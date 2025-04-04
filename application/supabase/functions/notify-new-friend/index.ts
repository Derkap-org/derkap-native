import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/send-notification.ts";

type Record = {
  sender_id: string;
  receiver_id: string;
};

type Profile = {
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
  const { record } = (await req.json()) as { record: Record };
  console.log(record);

  const sender_id = record.sender_id;
  const receiver_id = record.receiver_id;

  console.log(sender_id, receiver_id);

  const { data: senderData, error: senderError } = await supabase
    .from("profile")
    .select(
      `
        username
      `,
    )
    .eq("id", sender_id)
    .single();

  if (senderError) {
    console.error("Error fetching sender", senderError);
    throw senderError;
  }

  const sender = senderData as unknown as Profile;

  const { data: subscriptionsData, error: subscriptionsError } = await supabase
    .from("notification_subscription")
    .select("expo_push_token")
    .eq("user_id", receiver_id)
    .single();

  if (subscriptionsError) {
    console.error("Error subscriptions", subscriptionsError);
    throw subscriptionsError;
  }

  const subscriptions = subscriptionsData as unknown as Subscription;

  const title = "Nouvelle demande d'ami";
  const message = `${sender?.username} t'a envoyé une demande d'ami !`;

  // const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN")!;

  if (!subscriptions.expo_push_token) {
    console.error("No expo push token found");
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  await sendNotification({
    expoPushToken: subscriptions.expo_push_token,
    title,
    subtitle: "",
    message,
    // EXPO_ACCESS_TOKEN: EXPO_ACCESS_TOKEN,
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
