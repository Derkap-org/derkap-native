import { supabase } from "@/lib/supabase";

export const getProfile = async () => {
  const { user } = (await supabase.auth.getUser()).data;

  const { data, error, status } = await supabase
    .from("profile")
    .select(`*`)
    .eq("id", user.id)
    .single();
  if (error && status !== 406) {
    throw error;
  }
  return { data };
};

export async function updateAvatarProfile(file_url: string) {
  try {
    const { user } = (await supabase.auth.getUser()).data;

    console.log("user found");
    if (!user) {
      return {
        data: null,
        error: "User not found",
      };
    }
    console.log("file_url", file_url);
    const response = await fetch(file_url);
    console.log("response", response);
    const blob = await response.blob();
    console.log("blob", blob);
    const arrayBuffer = await new Response(blob).arrayBuffer();
    console.log("arrayBuffer", arrayBuffer);

    // UPLOAD NEW AVATAR
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`${user.id}/avatar`, arrayBuffer, {
        upsert: true,
        contentType: "image/png",
      });

    console.log("data avatars", data);

    if (error) {
      console.error("Error uploading avatar:", error.message);
      return {
        data: null,
        error: error.message,
      };
    }
    if (!data) {
      console.log("No data");
      return {
        data: null,
        error: "No data",
      };
    }

    // GET NEW AVATAR URL
    const { data: avatar_url } = await supabase.storage
      .from("avatars")
      .getPublicUrl(`${user.id}/avatar?${new Date().getTime()}`);

    console.log("avatar_url", avatar_url);

    const { error: updateError } = await supabase
      .from("profile")
      .update({
        avatar_url: avatar_url.publicUrl,
      })
      .eq("id", user.id);

    console.log("updateError", updateError);

    if (updateError) {
      console.error("Error updating profile:", updateError.message);
      return {
        data: null,
        error: updateError.message,
      };
    }
    console.log("avatar_url", avatar_url);
    return { data: avatar_url, error: null };
  } catch (error) {
    console.error("Error updating profile:", error.message);
    return {
      data: null,
      error: error.message,
    };
  }
}
