import { View, Text, Image, ScrollView, RefreshControl } from "react-native";
import React, { useEffect, useState } from "react";
import { GroupRanking } from "@/types/types";
import { useSupabase } from "@/context/auth-context";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { getGroupRanking } from "@/functions/group-action";
import AsyncStorage from "@react-native-async-storage/async-storage";
const GroupRankingTab = ({ groupId }: { groupId: number }) => {
  const { user } = useSupabase();

  const [groupRanking, setGroupRanking] = useState<GroupRanking>();
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroupRanking = async () => {
    try {
      const key = `group_ranking_${groupId}`;
      const cachedGroupRanking = await AsyncStorage.getItem(key);

      if (cachedGroupRanking) {
        setGroupRanking(JSON.parse(cachedGroupRanking));
      }

      const groupRanking = await getGroupRanking({ group_id: groupId });

      if (groupRanking) {
        setGroupRanking(groupRanking);
        AsyncStorage.setItem(key, JSON.stringify(groupRanking));
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur dans la récupération du classement",
        text2: error.message || "Veuillez réessayer",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchGroupRanking();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroupRanking();
  }, [groupId]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="white"
        />
      }
      className="p-4 h-full mb-48"
    >
      {!groupRanking || groupRanking?.length === 0 ? (
        <Text className="text-center text-gray-300">
          Aucun classement disponible
        </Text>
      ) : (
        <View className="">
          {groupRanking.map((ranking, index) => (
            <View
              key={index}
              className="flex flex-row justify-between items-center py-2"
            >
              <View className="flex flex-row items-center gap-x-2">
                <View className={`rounded-full overflow-hidden`}>
                  {ranking.avatar_url ? (
                    <Image
                      source={{
                        uri: `${ranking.avatar_url}?t=${user.user_metadata.avatarTimestamp}`,
                      }}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <View className="items-center justify-center w-10 h-10 bg-black rounded-full">
                      <Text className="text-sm text-gray-300">
                        {ranking.username?.charAt(0) || "?"}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-lg font-bold text-white">
                  {ranking.username}
                </Text>
              </View>
              <Text className="text-lg font-bold text-white">
                {ranking.winned_challenges} 🥇
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default GroupRankingTab;
