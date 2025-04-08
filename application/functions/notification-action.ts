import { supabase } from "@/lib/supabase";

export const postSubscription = async ({
  expoPushToken,
}: {
  expoPushToken: string;
}) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    return {
      data: null,
      error: "User not found",
    };
  }

  const { data, error } = await supabase
    .from("notification_subscription")
    .upsert(
      {
        user_id: user.id,
        expo_push_token: expoPushToken,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )
    .select("*");

  if (error) {
    // console.error("Error posting subscription", error);
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
};
