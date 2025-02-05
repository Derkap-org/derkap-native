import { supabase } from "@/lib/supabase";

export const uploadPostToDB = async ({
  base64file,
  challenge_id,
}: {
  base64file: string;
  challenge_id: number;
}) => {
  try {
    console.log("uploadPostToDB", challenge_id);
    const user = await supabase.auth.getUser();
    const user_id = user.data.user?.id;
    if (!user || !user_id) {
      throw new Error("Not authorized");
    }

    const session = await supabase.auth.getSession();
    const access_token = session?.data?.session?.access_token;
    const refresh_token = session?.data?.session?.refresh_token;

    if (!access_token || !refresh_token) {
      throw new Error("Not authorized");
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/api/post/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
          refresh_token: refresh_token,
        },
        body: JSON.stringify({
          base64_img: base64file,
          profile_id: user_id,
          challenge_id: challenge_id,
        }),
      },
    );
    const data = await response.json();
    console.log("data", data);
    if (data.error) {
      return {
        error: data.error,
      };
    }
    return {
      error: null,
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
};

export const getEncryptedPosts = async ({
  challenge_id,
}: {
  challenge_id: number;
}) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    return {
      data: null,
      error: "User not found",
    };
  }
  const session = await supabase.auth.getSession();
  const access_token = session?.data?.session?.access_token;
  const refresh_token = session?.data?.session?.refresh_token;

  if (!access_token || !refresh_token) {
    return {
      data: null,
      error: "Token not found",
    };
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/post/get`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        refresh_token: refresh_token,
      },
      body: JSON.stringify({
        challenge_id,
      }),
    },
  );
  const data = await response.json();
  return {
    data: data.posts,
    error: null,
  };
};
