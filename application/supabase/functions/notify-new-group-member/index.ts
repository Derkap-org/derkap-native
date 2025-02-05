import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/send-notification.ts";

type Group = {
  name: string;
};

type Sender = {
  username: string;
};

type Subscription = {
  expo_push_token: string;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const { group_id, sender_id } = await req.json();
  console.log(group_id, sender_id);

  // Fetch group details
  const { data: groupData, error: groupError } = await supabase
    .from("group")
    .select("name")
    .eq("id", group_id)
    .single();

  if (groupError) {
    console.error("Error fetching group", groupError);
    throw groupError;
  }

  const group = groupData as Group;

  // Fetch sender details (new member)
  const { data: senderData, error: senderError } = await supabase
    .from("profile")
    .select("username")
    .eq("id", sender_id)
    .single();

  if (senderError) {
    console.error("Error fetching sender", senderError);
    throw senderError;
  }

  const sender = senderData as Sender;

  // Fetch all existing group members except the new member
  const { data: groupParticipants, error: participantsError } = await supabase
    .from("group_profile")
    .select("profile_id")
    .eq("group_id", group_id)
    .neq("profile_id", sender_id);

  if (participantsError) {
    console.error("Error fetching group participants", participantsError);
    throw participantsError;
  }

  console.log("Group participants", groupParticipants);

  // Fetch notification subscriptions for these members
  const { data: subscriptionsData, error: subscriptionsError } = await supabase
    .from("notification_subscription")
    .select("expo_push_token")
    .in(
      "user_id",
      groupParticipants.map((participant) => participant.profile_id),
    );

  if (subscriptionsError) {
    console.error("Error fetching subscriptions", subscriptionsError);
    throw subscriptionsError;
  }

  const subscriptions = subscriptionsData as Subscription[];

  const title = `${group?.name || "Derkap"}`;
  const subtitle = "Nouveau membre";
  const message = `${sender.username} a rejoint ton groupe !`;

  // const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN")!;

  const promises = subscriptions.map((sub: Subscription) =>
    sendNotification({
      expoPushToken: sub.expo_push_token,
      title,
      subtitle,
      message,
      // EXPO_ACCESS_TOKEN: EXPO_ACCESS_TOKEN,
    }),
  );

  await Promise.allSettled(promises);

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
