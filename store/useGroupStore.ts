import { createGroup, getGroups, joinGroup } from "@/functions/group-action";
import { getCurrentChallengesStatus } from "@/functions/challenge-action";
import { TGroupDB } from "@/types/types";
import { create } from "zustand";

interface GroupState {
  groups: TGroupDB[];
  isJoining: boolean;
  isCreating: boolean;
  setGroups: (groups: TGroupDB[]) => void;
  fetchGroups: () => Promise<void>;
  joinGroup: (invite_code: string) => Promise<{ succes: boolean }>;
  createGroup: (name: string) => Promise<{ succes: boolean }>;
}

const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isJoining: false,
  isCreating: false,
  setGroups: (groups) => set({ groups }),
  fetchGroups: async () => {
    const { data, error } = await getGroups({});

    if (error) {
      console.error(error);
      set({ groups: [] });
      return;
    }

    if (!data) {
      set({ groups: [] });
      return;
    }

    const groups: TGroupDB[] = data;
    const groupsOrdered = groups.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    set({ groups: groupsOrdered });

    const { data: challengesStatus } = await getCurrentChallengesStatus({
      group_ids: groupsOrdered.map((group) => group.id),
    });

    if (!challengesStatus) return;

    const groupsWithChallenges = groupsOrdered.map((group) => {
      const challengeStatus = challengesStatus.find(
        (challenge) => challenge.group_id === group.id,
      );
      return {
        ...group,
        challengeStatus: challengeStatus?.status || "ended",
      };
    });

    set({ groups: groupsWithChallenges });

    return;
  },
  joinGroup: async (invite_code) => {
    set({ isJoining: true });
    const { data, error } = await joinGroup({ invite_code });
    if (error) {
      console.error(error);
      set({ isJoining: false });
      return { succes: false };
    }
    if (data) {
      const groups = get().groups;
      set({ groups: [...groups, data], isJoining: false });
      return { succes: true };
    }
    set({ isJoining: false });
    return { succes: false };
  },
  createGroup: async (name) => {
    set({ isCreating: true });
    const { data, error } = await createGroup({ name });
    if (error) {
      console.error(error);
      set({ isCreating: false });
      return { succes: false };
    }
    if (data) {
      const groups = get().groups;
      set({ groups: [data, ...groups], isCreating: false });
      return { succes: true };
    }
    set({ isCreating: false });
    return { succes: false };
  },
}));

export default useGroupStore;
