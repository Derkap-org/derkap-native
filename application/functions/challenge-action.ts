import { supabase } from "@/lib/supabase";
import { generateChallengeBaseKey } from "./encryption-action";

export const getChallenges = async ({
  group_id,
  page = 1,
}: {
  group_id: number;
  page?: number;
}) => {
  const CHALLENGES_PER_PAGE = 20;

  const offset = (page - 1) * CHALLENGES_PER_PAGE;

  const { data: challenges, error } = await supabase
    .from("challenge")
    .select(`*, creator:profile(*)`)
    .eq("group_id", Number(group_id))
    .order("created_at", { ascending: false })
    .range(offset, offset + CHALLENGES_PER_PAGE - 1);

  if (error) {
    throw new Error(error.message);
  }

  return challenges;
};

export const createChallenge = async ({
  challenge,
}: {
  challenge: {
    description: string;
    group_id: number;
  };
}) => {
  const challenge_key = await generateChallengeBaseKey({
    text: challenge.description,
  });

  const { user } = (await supabase.auth.getUser()).data;
  const user_id = user?.id;

  if (!user || !user_id) {
    throw new Error("Utilisateur non autorisé");
  }

  // check if there is already a challenge for this group, if so, return an error
  const lastChallenge = await getCurrentChallengesStatus({
    group_ids: [challenge.group_id],
  });

  if (lastChallenge.error) {
    throw new Error(
      lastChallenge?.error || "Erreur lors de la récupération du défi",
    );
  }

  if (lastChallenge.data && lastChallenge.data.length > 0) {
    if (lastChallenge.data[0].status !== "ended") {
      throw new Error("Un challenge est déjà en cours pour ce groupe");
    }
  }

  const { error: errorCreate } = await supabase.from("challenge").insert({
    description: challenge.description,
    creator_id: user_id,
    group_id: challenge.group_id,
    base_key: challenge_key,
    status: "posting",
  });

  if (errorCreate) {
    throw new Error(
      errorCreate?.message || "Erreur lors de la création du challenge",
    );
  }
};

export const getCurrentChallengesStatus = async ({
  group_ids,
}: {
  group_ids: number[];
}) => {
  // Constructing the raw SQL query
  const { data, error } = await supabase.rpc("get_latest_challenge_status", {
    group_ids: group_ids,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
};

export const setChallengeToVoting = async ({
  challenge_id,
}: {
  challenge_id: number;
}) => {
  const { error } = await supabase
    .from("challenge")
    .update({ status: "voting" })
    .eq("id", challenge_id);

  if (error) {
    throw new Error(error?.message || "Erreur lors du passage aux votes");
  }
};

export const setChallengeToEnd = async ({
  challenge_id,
}: {
  challenge_id: number;
}) => {
  const { error } = await supabase
    .from("challenge")
    .update({ status: "ended" })
    .eq("id", challenge_id);

  if (error) {
    throw new Error(error?.message || "Erreur lors de la fin du challenge");
  }
};
