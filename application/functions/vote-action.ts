import { supabase } from "@/lib/supabase";

export const getVotes = async ({ challenge_id }: { challenge_id: number }) => {
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const { data: votes, error } = await supabase
    .from("vote")
    .select("*")
    .eq("challenge_id", challenge_id);

  if (error) {
    throw new Error(
      error?.message || "Erreur lors de la récupération des votes",
    );
  }

  return votes;
};

export const addVote = async ({
  post_id,
  challenge_id,
}: {
  post_id: number;
  challenge_id: number;
}) => {
  console.log("addVote", post_id, challenge_id);
  const { user } = (await supabase.auth.getUser()).data;
  if (!user) {
    return {
      data: null,
      error: "User not found",
    };
  }

  const { error } = await supabase.from("vote").upsert(
    {
      post_id,
      challenge_id,
    },
    {
      onConflict: "challenge_id, user_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
};
