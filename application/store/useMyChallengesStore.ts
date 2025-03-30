import { create } from "zustand";
import { fetchAllMyChallenges } from "@/functions/derkap-action";

interface MyChallengesState {
  challenges: string[];
  isLoading: boolean;
  refreshChallenges: () => Promise<void>;
  alreadyMadeThisChallenge: (challenge: string) => boolean;
}

const useMyChallengesStore = create<MyChallengesState>((set) => ({
  challenges: [],
  isLoading: false,
  refreshChallenges: async () => {
    try {
      set({ isLoading: true });
      const challenges = await fetchAllMyChallenges();
      set({ challenges });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  alreadyMadeThisChallenge: (challenge: string) => {
    return useMyChallengesStore.getState().challenges.includes(challenge);
  },
}));

export default useMyChallengesStore;
