import { View, Text, Image } from "react-native";
import React from "react";
import { GroupRanking } from "@/types/types";
import { useSupabase } from "@/context/auth-context";

interface GroupRankingTabProps {
  groupRanking: GroupRanking;
}

const GroupRankingTab = ({ groupRanking }: GroupRankingTabProps) => {
  const { user } = useSupabase();
  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-4 text-center">
        Classement du Groupe
      </Text>

      {groupRanking?.length === 0 ? (
        <Text className="text-center text-gray-500">
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
                    <View className="items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                      <Text className="text-sm text-white">
                        {ranking.username?.charAt(0) || "?"}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-lg font-bold">{ranking.username}</Text>
              </View>
              <Text className="text-lg font-bold">
                {ranking.winned_challenges} 🥇
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default GroupRankingTab;
