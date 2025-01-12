import { supabase } from "@/lib/supabase";
import { Alert } from "react-native";

export const getCurrentChallenge = async ({
  group_id,
}: {
  group_id: string;
}) => {
  // get the latest created challenge, and the profile of the creator
  const { data, error } = await supabase
    .from("challenge")
    .select(`*, creator:profile(*)`)
    .eq("group_id", group_id)
    .order("created_at", { ascending: false })
    .limit(1);
  // .single(); // => if single set and no row is found, it will return an error, but no challenge can be possible so no error

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data,
    error: null,
  };
};

export const createChallenge = async ({
  challenge,
}: {
  challenge: {
    description: string;
    group_id: number;
  };
}) => {
  const { user } = (await supabase.auth.getUser()).data;
  const user_id = user?.id;

  if (!user || !user_id) {
    throw new Error("Not authorized");
  }
  //todo: check if there is already a challenge for this group, if so, return an error
  const { error: errorCreate } = await supabase.from("challenge").insert({
    description: challenge.description,
    creator_id: user_id,
    group_id: challenge.group_id,
    status: "posting",
  });

  if (errorCreate) {
    return {
      error: errorCreate.message,
    };
  }

  return {
    error: null,
    data: null,
  };
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
    console.error("Error setting challenge to voting", error);
    return {
      error: error.message,
    };
  }

  return {
    data: null,
    error: null,
  };
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
    return {
      error: error.message,
    };
  }

  return {
    data: null,
    error: null,
  };
};
