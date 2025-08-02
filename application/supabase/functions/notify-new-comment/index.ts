import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendNotification } from "../_shared/send-notification.ts";

type Record = {
  id: number;
  content: string | null;
  creator_id: string | null;
  derkap_id: number | null;
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

  const comment_id = record.id;
  const comment_content = record.content;
  const comment_creator_id = record.creator_id;
  const derkap_id = record.derkap_id;

  if (!comment_creator_id || !derkap_id) {
    console.error("Missing required fields");
    return new Response(JSON.stringify({ success: false }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get the derkap creator's profile
  const { data: derkapData, error: derkapError } = await supabase
    .from("derkap")
    .select(
      `
        creator_id,
        challenge,
        profile!derkap_creator_id_fkey(
          username
        )
      `,
    )
    .eq("id", derkap_id)
    .single();

  if (derkapError) {
    console.error("Error fetching derkap", derkapError);
    throw derkapError;
  }

  const derkapCreator = derkapData.profile as unknown as Profile;
  const derkapCreatorId = derkapData.creator_id;
  const derkapChallenge = derkapData.challenge;
  // Get the comment creator's profile
  const { data: commentCreatorData, error: commentCreatorError } =
    await supabase
      .from("profile")
      .select("username")
      .eq("id", comment_creator_id)
      .single();

  if (commentCreatorError) {
    console.error("Error fetching comment creator", commentCreatorError);
    throw commentCreatorError;
  }

  const commentCreator = commentCreatorData as unknown as Profile;

  // Get all unique users who should receive notifications
  // This includes:
  // 1. The derkap creator
  // 2. All users who commented on this derkap (except the current comment creator)
  const { data: usersToNotify, error: usersError } = await supabase
    .from("comment")
    .select(
      `
        creator_id,
        profile!comment_creator_id_fkey(
          username
        )
      `,
    )
    .eq("derkap_id", derkap_id)
    .neq("creator_id", comment_creator_id);

  if (usersError) {
    console.error("Error fetching users to notify", usersError);
    throw usersError;
  }

  // Create a Set of unique user IDs to notify
  const uniqueUserIds = new Set<string>();

  // Add derkap creator if they're not the comment creator
  if (derkapCreatorId !== comment_creator_id) {
    uniqueUserIds.add(derkapCreatorId);
  }

  // Add all commenters
  usersToNotify.forEach((comment) => {
    if (comment.creator_id) {
      uniqueUserIds.add(comment.creator_id);
    }
  });

  // Send notifications to all unique users
  for (const userId of uniqueUserIds) {
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("notification_subscription")
      .select("expo_push_token")
      .eq("user_id", userId)
      .single();

    if (subscriptionError) {
      console.error("Error fetching subscription", subscriptionError);
      continue;
    }

    const subscription = subscriptionData as unknown as Subscription;

    if (!subscription.expo_push_token) {
      console.error("No expo push token found for user", userId);
      continue;
    }

    const title = `${commentCreator.username} a commenté le Derkap`;
    const subtitle = `de ${derkapCreator.username} : ${derkapChallenge}`;
    const message = `${commentCreator.username}: "${comment_content}"`;

    await sendNotification({
      expoPushToken: subscription.expo_push_token,
      title,
      subtitle,
      message,
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
