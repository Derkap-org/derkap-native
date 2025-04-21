import { supabase } from "@/lib/supabase";

export const reportContent = async ({
  derkap_id,
  comment_id,
  reason,
}: {
  derkap_id?: number;
  comment_id?: number;
  reason: string;
}) => {
  if (!derkap_id && !comment_id) return;
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user || !user_id) {
    throw new Error("Not authorized");
  }
  const { error } = await supabase
    .from("reporting")
    .insert({ derkap_id, comment_id, reason, reported_by: user_id });

  if (error) {
    throw new Error(error.message);
  }
};
