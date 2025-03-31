import { supabase } from "@/lib/supabase";
import { TCommentDB } from "@/types/types";

export const getCommentsFromDB = async ({
  derkap_id,
}: {
  derkap_id: number;
}): Promise<TCommentDB[]> => {
  const { data, error } = await supabase
    .from("comment")
    .select(`*, creator:profile(*)`)
    .eq("derkap_id", derkap_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createComment = async ({
  derkap_id,
  content,
}: {
  derkap_id: number;
  content: string;
}) => {
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user || !user_id) {
    throw new Error("Not authorized");
  }
  const { error } = await supabase
    .from("comment")
    .insert({ derkap_id, content, creator_id: user_id });

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteComment = async ({ comment_id }: { comment_id: number }) => {
  const { error } = await supabase
    .from("comment")
    .delete()
    .eq("id", comment_id);

  if (error) {
    throw new Error(error.message);
  }
};
