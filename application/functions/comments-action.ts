import { supabase } from "@/lib/supabase";
import { TCommentDB } from "@/types/types";

export const getCommentsFromDB = async ({
  post_id,
}: {
  post_id: number;
}): Promise<TCommentDB[]> => {
  const { data, error } = await supabase
    .from("comment")
    .select(`*, creator:profile(*)`)
    .eq("post_id", post_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const createComment = async ({
  post_id,
  content,
}: {
  post_id: number;
  content: string;
}) => {
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user || !user_id) {
    throw new Error("Not authorized");
  }
  const { error } = await supabase
    .from("comment")
    .insert({ post_id, content, creator_id: user_id });

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
