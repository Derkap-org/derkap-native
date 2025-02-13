import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

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
  const { user } = (await supabase.auth.getUser()).data;

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const response = await fetch(file_url);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  // UPLOAD NEW AVATAR
  const { data, error } = await supabase.storage
    .from("avatars")
    .upload(`${user.id}/avatar`, arrayBuffer, {
      upsert: true,
      contentType: "image/png",
    });

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("No data");
  }

  // GET NEW AVATAR URL
  const { data: avatar_url } = await supabase.storage
    .from("avatars")
    .getPublicUrl(`${user.id}/avatar?${new Date().getTime()}`);

  const { error: updateError } = await supabase
    .from("profile")
    .update({
      avatar_url: avatar_url.publicUrl,
    })
    .eq("id", user.id);

  if (updateError) {
    throw updateError;
  }

  return avatar_url;
}

export const getProfileByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .ilike("username", `%${username}%`);
  if (error) {
    console.error("Error fetching profile", error);
    throw error;
  }
  return { data };
};
