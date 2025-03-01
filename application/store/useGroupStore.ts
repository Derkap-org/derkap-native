import { createGroup, getGroups, joinGroup } from "@/functions/group-action";
import { getCurrentChallengesStatus } from "@/functions/challenge-action";
import { TGroupDB } from "@/types/types";
import { create } from "zustand";
import { addLastActivityToGroups } from "@/lib/last-activity-storage";

interface GroupState {
  groups: TGroupDB[];
  isJoining: boolean;
  isCreating: boolean;
  setGroups: (groups: TGroupDB[]) => void;
  fetchGroups: () => Promise<void>;
  joinGroup: (invite_code: string) => Promise<{ succes: boolean }>;
  createGroup: (name: string) => Promise<{ succes: boolean }>;
  updateGroupImg: (id: number, newImgUrl: string) => void;
}

const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  isJoining: false,
  isCreating: false,
  setGroups: (groups) => set({ groups }),
  updateGroupImg(id, newImgUrl) {
    const groups = get().groups;
    const updatedGroups = groups.map((group) => {
      if (group.id === id) {
        return { ...group, avatar_url: newImgUrl };
      }
      return group;
    });
    set({ groups: updatedGroups });
  },
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
        new Date(b.last_activity).getTime() -
        new Date(a.last_activity).getTime(),
    );

    const { data: challengesStatus } = await getCurrentChallengesStatus({
      group_ids: groupsOrdered.map((group) => group.id),
    });

    if (!challengesStatus) {
      const groupsWithNewActivity =
        await addLastActivityToGroups(groupsOrdered);
      set({ groups: groupsWithNewActivity });
      return;
    }

    const groupsWithChallengesStatus = groupsOrdered.map((group) => {
      const challengeStatus = challengesStatus.find(
        (challenge) => challenge.group_id === group.id,
      );
      return {
        ...group,
        challengeStatus: challengeStatus?.status || null,
      };
    });

    const groupsWithNewActivity = await addLastActivityToGroups(
      groupsWithChallengesStatus,
    );

    set({ groups: groupsWithNewActivity });

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
      set({ groups: [data, ...groups], isJoining: false });
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
