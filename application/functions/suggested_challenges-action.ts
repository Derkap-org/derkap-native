import { supabase } from "@/lib/supabase";
import {
  TSuggestedChallenge,
  TSuggestedChallengeCategory,
} from "@/types/types";
const fetchSuggestedChallengesFromDB = async () => {
  const user = await supabase.auth.getUser();
  const user_id = user.data.user?.id;
  if (!user || !user_id) {
    throw new Error("Not authorized");
  }
  const { data, error } = await supabase
    .from("suggested_challenge")
    .select("challenge, category")
    .order("challenge", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const getSuggestedChallenges = async (): Promise<{
  categories: TSuggestedChallengeCategory[];
  challenges: TSuggestedChallenge[];
}> => {
  const challenges = await fetchSuggestedChallengesFromDB();
  const categories = challenges.map((challenge) => challenge.category);
  const uniqCategories = [...new Set(categories)];
  return {
    categories: uniqCategories,
    challenges,
  };
};
