import { supabase } from "@/lib/supabase";

export const getFeedbackLink = async () => {
  const { data, error } = await supabase
    .from("app_feedback")
    .select("link")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("No data found");
  }

  return data[0].link;
};
