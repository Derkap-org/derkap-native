import { supabase } from "@/lib/supabase";

export const addPostToDb = async ({
  file_url,
  challenge_id,
}: {
  file_url: string;
  challenge_id: number;
}) => {
  const user = supabase.auth.getUser();
  const user_id = (await user).data.user?.id;

  if (!user || !user_id) {
    throw new Error("Not authorized");
  }

  const response = await fetch(file_url);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();
  const date = new Date().toISOString();
  const fileName = user_id + "/" + date + ".jpeg";

  const { error } = await supabase.storage
    .from("posts")
    .upload(fileName, arrayBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });
  if (error) {
    return {
      error: error.message,
    };
  }

  const { data: imgData } = supabase.storage
    .from("posts")
    .getPublicUrl(fileName);
  const publicUrl = imgData?.publicUrl;

  if (!publicUrl) {
    return {
      error: "No public url",
      data: null,
    };
  }

  const { error: errorPost } = await supabase
    .from("post")
    .insert({
      img_url: publicUrl,
      profile_id: user_id,
      challenge_id: challenge_id,
      file_name: fileName,
    })
    .single();

  if (errorPost) {
    return {
      error: errorPost.message,
    };
  }

  return {
    error: null,
    data: null,
  };
};

export const getPosts = async ({ challenge_id }: { challenge_id: number }) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    return {
      data: null,
      error: "User not found",
    };
  }
  const { data, error } = await supabase
    .from("post")
    .select(`*, creator:profile(*)`)
    .eq("challenge_id", challenge_id);
  if (error) {
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
