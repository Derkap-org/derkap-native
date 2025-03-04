import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/send-notification.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const {
    post_id,
    creator_id,
    comment_content,
    challenge_id,
    group_name,
    challenge_description,
    group_id,
  } = await req.json();
  console.log(
    post_id,
    creator_id,
    comment_content,
    challenge_id,
    group_name,
    challenge_description,
    group_id,
  );

  // Get commenter's profile
  const { data: senderData, error: senderError } = await supabase
    .from("profile")
    .select("username")
    .eq("id", creator_id)
    .single();

  if (senderError) {
    console.error("Error fetching sender", senderError);
    throw senderError;
  }

  const sender = senderData;

  // Get group participants excluding the comment creator
  const { data: groupParticipants, error: participantsError } = await supabase
    .from("group_profile")
    .select("profile_id")
    .eq("group_id", group_id)
    .neq("profile_id", creator_id);

  if (participantsError) {
    console.error("Error fetching group participants", participantsError);
    throw participantsError;
  }

  console.log("groupParticipants", groupParticipants);

  // Get notification tokens
  const { data: subscriptionsData, error: subscriptionsError } = await supabase
    .from("notification_subscription")
    .select("expo_push_token")
    .in(
      "user_id",
      groupParticipants.map((p) => p.profile_id),
    );

  if (subscriptionsError) {
    console.error("Error fetching subscriptions", subscriptionsError);
    throw subscriptionsError;
  }

  const subscriptions = subscriptionsData;

  const title = `${group_name || "Derkap"}`;
  const subtitle = `${challenge_description || "Challenge"}`;
  const message = `${sender.username}: "${comment_content}"`;
  console.log("title", title);
  console.log("subtitle", subtitle);
  console.log("message", message);
  console.log("subscriptions", subscriptions);
  const promises = subscriptions.map((sub) =>
    sendNotification({
      expoPushToken: sub.expo_push_token,
      title,
      subtitle,
      message,
    }),
  );

  await Promise.allSettled(promises);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
