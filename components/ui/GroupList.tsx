import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";

interface GroupListProps {
  groups?: {
    id: number;
    name: string;
    status: "En votes" | "En cours" | "Terminé";
    members: {
      profile: { id: number; username: string; avatar_url: string | null };
    }[];
  }[];
  isLoading?: boolean;
  setIsCreateGroupDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsJoinGroupDrawerOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const GroupList: React.FC<GroupListProps> = ({
  groups = [],
  isLoading = false,
  setIsCreateGroupDrawerOpen,
  setIsJoinGroupDrawerOpen,
}) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "En votes":
        return "bg-yellow-500 text-white"; // Jaune
      case "En cours":
        return "bg-orange-500 text-white"; // Orange
      case "Terminé":
        return "bg-gray-500 text-white"; // Gris
      default:
        return "bg-gray-300 text-black"; // Gris clair
    }
  };

  return (
    <View className="w-full p-4">
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : groups.length === 0 ? (
        <Text className="text-center text-gray-500">
          Aucun groupe disponible
        </Text>
      ) : (
        <View className="space-y-8">
          {groups.map((group) => (
            <View
              key={group.id}
              className="p-4 rounded-xl shadow-element bg-white mb-4"
            >
              <View className="flex-row justify-between items-center">
                <View className="w-full">
                  <Text className="text-lg font-semibold">{group.name}</Text>

                  {/* Statut du groupe */}
                  <Text
                    className={`px-2 py-1 rounded w-24 text-center font-bold text-sm mt-2 mb-4 ${getStatusClass(
                      group.status,
                    )}`}
                  >
                    {group.status}
                  </Text>

                  {/* Barre de statut */}
                  <View className="mt-2 mb-2">
                    <View className="h-[2px] bg-gray-300 w-full" />
                  </View>

                  {/* Photos des membres */}
                  <View className="flex-row">
                    {group.members?.slice(0, 5).map((member, index) => (
                      <View
                        key={member.profile.id}
                        className={`border-2 border-white rounded-full overflow-hidden ${
                          index !== 0 ? "-ml-3" : ""
                        }`}
                      >
                        {member.profile.avatar_url ? (
                          <Image
                            source={{ uri: member.profile.avatar_url }}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <View className="w-10 h-10 bg-gray-300 justify-center items-center rounded-full">
                            <Text className="text-sm text-white">
                              {member.profile.username?.charAt(0) || "?"}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}

                    {/* Nombre de membres supplémentaires */}
                    {(group.members?.length || 0) > 5 && (
                      <View className="-ml-3 w-10 h-10 bg-gray-300 justify-center items-center rounded-full border-2 border-white">
                        <Text className="text-sm text-white">
                          +{(group.members?.length || 0) - 5}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Bouton de rejoindre le groupe */}
              {/* {setIsJoinGroupDrawerOpen && (
                <View className="mt-4">
                  <TouchableOpacity
                    onPress={() => setIsJoinGroupDrawerOpen(true)}
                    className="bg-green-500 py-2 px-4 rounded-lg"
                  >
                    <Text className="text-white text-center">Rejoindre un groupe</Text>
                  </TouchableOpacity>
                </View>
              )} */}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default GroupList;
