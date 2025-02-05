import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/send-notification.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const { challenge_id, group_id, event_type, old_status, new_status } =
    await req.json();
  console.log("Received data:", {
    challenge_id,
    group_id,
    event_type,
    old_status,
    new_status,
  });

  const { data: groupData, error: groupError } = await supabase
    .from("group")
    .select(
      `
        name,
        group_profile:group_profile!inner(
          profile:profile!inner(
            notification_subscription(expo_push_token)
          )
        )
      `,
    )
    .eq("id", group_id)
    .single();

  if (groupError) {
    console.error("Error fetching group data:", groupError);
    throw groupError;
  }

  const groupName = groupData?.name || "Derkap";

  const subscriptions = (groupData.group_profile as any)
    .flatMap(
      (gp: { profile: { notification_subscription: any } }) =>
        gp.profile.notification_subscription,
    )
    .filter(
      (sub: { expo_push_token: null } | null) =>
        sub !== null && sub.expo_push_token !== null,
    );

  console.log("Old status :", old_status);
  console.log("New status :", new_status);
  console.log("Group name:", groupName);
  console.log("Subscriptions:", subscriptions);

  const title = `${groupName}`;
  let subtitle = "Nouveau challenge";
  let message = "";
  if (event_type === "new_challenge") {
    subtitle = `Nouveau challenge !`;
    message = `Un nouveau challenge a été créé. Vite ! 🤯`;
  } else if (event_type === "status_change") {
    if (new_status === "voting") {
      subtitle = `Challenge ✅`;
      message = `Tout le monde a posté ! Maintenant, faut voter ! 🤔`;
    } else if (new_status === "ended") {
      subtitle = `Stooooop !`;
      message = `Les votes sont clos ! Qui a gagné ? 🧐 `;
    } else {
      message = `Le challenge est passé de "${old_status}" à "${new_status}".`;
    }
  }

  ////

  // const EXPO_ACCESS_TOKEN = Deno.env.get("EXPO_ACCESS_TOKEN")!;

  const promises = subscriptions.map((sub: { expo_push_token: string }) =>
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
}); //${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
