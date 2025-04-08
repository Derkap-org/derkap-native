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
    .from("friends")
    .select("avatar_url, friend_id, username, email, created_at")

    .ilike("username", `%${username}%`);
  if (error) {
    console.error("Error fetching profile", error);
    throw error;
  }

  const transformedData = data?.map((friend) => {
    const { friend_id, ...rest } = friend;
    return {
      ...rest,
      id: friend_id,
    };
  });
  return { data: transformedData };
};

export const deleteAccount = async () => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const { error } = await supabase
    .from("delete_account")
    .insert({ profile_id: user.id });

  if (error) {
    throw error;
  }
};

export const isAccountDeleting = async (): Promise<boolean> => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const { data, error } = await supabase
    .from("delete_account")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (error) {
    return false;
  }
  const isDeleting = !!data;
  return isDeleting;
};

export const cancelDeleteAccount = async () => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  const { error } = await supabase
    .from("delete_account")
    .delete()
    .eq("profile_id", user.id);
  if (error) {
    throw error;
  }
};

export const isUsernameAvailableInDB = async (
  username: string,
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("username", username);
  if (error) {
    throw error;
  }
  return data.length === 0;
};
