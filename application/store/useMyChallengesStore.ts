import { create } from "zustand";
import { fetchAllMyChallenges } from "@/functions/derkap-action";

interface MyChallengesState {
  myChallenges: string[];
  isLoading: boolean;
  refreshMyChallenges: () => Promise<void>;
  alreadyMadeThisChallenge: (challenge: string) => boolean;
}

const useMyChallengesStore = create<MyChallengesState>((set) => ({
  myChallenges: [],
  isLoading: false,
  refreshMyChallenges: async () => {
    try {
      set({ isLoading: true });
      const myChallenges = await fetchAllMyChallenges();
      set({ myChallenges });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
  alreadyMadeThisChallenge: (challenge: string) => {
    return useMyChallengesStore.getState().myChallenges.includes(challenge);
  },
}));

export default useMyChallengesStore;
