import { TGroupDB } from "@/types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const hasNewLastActivity = async (group: TGroupDB) => {
  const key = `last_activity_${group.id}`;
  const lastActivity = await AsyncStorage.getItem(key);
  if (!lastActivity) {
    await AsyncStorage.setItem(key, group.last_activity);
    return true;
  }
  if (lastActivity && group.last_activity) {
    if (lastActivity !== group.last_activity) {
      await AsyncStorage.setItem(key, group.last_activity);
      return true;
    }
  }
  return false;
};

const addLastActivityToGroup = async (group: TGroupDB): Promise<TGroupDB> => {
  try {
    const hasNewActivity = await hasNewLastActivity(group);
    if (hasNewActivity) {
      return { ...group, new_activity: true };
    }
    return group;
  } catch (error) {
    return group;
  }
};

export const addLastActivityToGroups = async (groups: TGroupDB[]) => {
  try {
    const groupsWithNewActivity = await Promise.all(
      groups.map(addLastActivityToGroup),
    );
    return groupsWithNewActivity;
  } catch (error) {
    return groups;
  }
};
