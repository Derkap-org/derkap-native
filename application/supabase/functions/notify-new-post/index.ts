import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/send-notification.ts";

type Record = {
  derkap_id: string;
  allowed_user_id: string;
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

  const derkap_id = record.derkap_id;
  const allowed_user_id = record.allowed_user_id;

  console.log(allowed_user_id, derkap_id);

  const { data: derkapData, error: derkapError } = await supabase
    .from("derkap")
    .select(
      `
        profile!derkap_creator_id_fkey(
          username
        )
      `,
    )
    .eq("id", derkap_id)
    .neq("creator_id", allowed_user_id)
    .single();

  if (derkapError) {
    console.error("Error fetching derkap", derkapError);
    throw derkapError;
  }

  const profile = derkapData.profile as unknown as Profile;

  const { data: subscriptionsData, error: subscriptionsError } = await supabase
    .from("notification_subscription")
    .select("expo_push_token")
    .eq("user_id", allowed_user_id)
    .single();

  if (subscriptionsError) {
    console.error("Error subscriptions", subscriptionsError);
    throw subscriptionsError;
  }

  const subscriptions = subscriptionsData as unknown as Subscription;

  const title = profile?.username ?? "Derkap";
  const subtitle = "Nouveau Derkap";
  const message = `${profile?.username} a posté un nouveau Derkap !`;

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
    subtitle,
    message,
    // EXPO_ACCESS_TOKEN: EXPO_ACCESS_TOKEN,
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
