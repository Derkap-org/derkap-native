import { useSupabase } from "../context/auth-context";
import { supabase } from "../lib/supabase";

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
