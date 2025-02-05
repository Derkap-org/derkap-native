import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/send-notification.ts";

type Challenge = {
  group_id: number;
  group: {
    name: string;
  };
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
  const { post_id, challenge_id, sender_id } = await req.json();
  console.log(post_id, challenge_id, sender_id);

  const { data: challengeData, error: challengeError } = await supabase
    .from("challenge")
    .select(
      `
        group_id,
        group:group_id (
          name
        )
      `,
    )
    .eq("id", challenge_id)
    .single();

  if (challengeError) {
    console.error("Error fetching challenge", challengeError);
    throw challengeError;
  }

  const challenge = challengeData as unknown as Challenge;

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

  const { data: groupParticipants, error: participantsError } = await supabase
    .from("group_profile")
    .select("profile_id")
    .eq("group_id", challenge.group_id)
    .neq("profile_id", sender_id);

  console.log("Group participants", groupParticipants);
  if (participantsError) {
    console.error("Error participants", participantsError);
    throw participantsError;
  }

  const { data: subscriptionsData, error: subscriptionsError } = await supabase
    .from("notification_subscription")
    .select("expo_push_token")
    .in(
      "user_id",
      groupParticipants.map((participant) => participant.profile_id),
    );

  if (subscriptionsError) {
    console.error("Error subscriptions", subscriptionsError);
    throw subscriptionsError;
  }

  const subscriptions = subscriptionsData as Subscription[];

  const title = `${challenge?.group?.name || "Derkap"}`;
  const subtitle = "Nouveau post";
  const message = `${sender.username} a pris son Derkap !`;

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
