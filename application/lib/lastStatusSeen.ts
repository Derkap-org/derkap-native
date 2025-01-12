import AsyncStorage from "@react-native-async-storage/async-storage";

import { TGroupDB } from "@/types/types";

export const getLastStatusSeen = async () => {
  const localStoredLastStatusSeen =
    await AsyncStorage.getItem("lastStatusSeen");
  if (!localStoredLastStatusSeen) return [];
  return JSON.parse(localStoredLastStatusSeen || "{}") as {
    groupId: number;
    status: "posting" | "voting" | "ended";
  }[];
};

export const updateLastStatusSeen = async ({
  groupId,
  newStatus,
}: {
  groupId: number;
  newStatus: "posting" | "voting" | "ended";
}) => {
  let lastStatusSeen = await getLastStatusSeen();
  if (!lastStatusSeen) lastStatusSeen = [];
  const newLastStatusSeen = lastStatusSeen.filter(
    (status) => status.groupId !== groupId,
  );
  newLastStatusSeen.push({ groupId, status: newStatus });
  await AsyncStorage.setItem(
    "lastStatusSeen",
    JSON.stringify(newLastStatusSeen),
  );
};

export const addLastStatusSeenToGroups = async ({
  groups,
}: {
  groups: TGroupDB[];
}): Promise<TGroupDB[]> => {
  let groupsToReturn = groups;
  try {
    const lastStatusSeen = await getLastStatusSeen();
    if (!lastStatusSeen.length) return groups;
    const groupsWLastSeenStatus = groups.map((group) => {
      const lastStatus = lastStatusSeen.find(
        (status) => status.groupId === group.id,
      );
      if (lastStatus) {
        if (lastStatus.status !== group.challengeStatus) {
          return { ...group, hasNewStatus: true };
        }
      }
      return group;
    });
    groupsToReturn = groupsWLastSeenStatus;
  } catch (error) {
    console.error(error);
  } finally {
    return groupsToReturn;
  }
};
