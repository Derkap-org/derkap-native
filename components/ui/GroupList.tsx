import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

interface GroupListProps {
  groups: {
    id: number;
    name: string;
    members: { profile: { id: number; username: string; avatar_url: string | null } }[];
  }[];
  isLoading: boolean;
  setIsCreateGroupDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsJoinGroupDrawerOpen?: React.Dispatch<React.SetStateAction<boolean>>; // Propriété optionnelle
}

const GroupList: React.FC<GroupListProps> = ({
  groups,
  isLoading,
  setIsCreateGroupDrawerOpen,
  setIsJoinGroupDrawerOpen,
}) => {
  return (
    <View className="w-full p-4">
      <Text className="text-xl font-bold mb-4">Groupes</Text>

      {/* Affichage pendant le chargement */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View className="space-y-4">
          {groups.map((group) => (
            <View
              key={group.id}
              className="p-4 border border-gray-300 rounded-lg flex-row justify-between items-center"
            >
              <View>
                <Text className="text-lg font-semibold">{group.name}</Text>
              </View>

              {/* Afficher les photos de profils des membres sous le titre */}
              <View className="flex-row space-x-2 mt-2">
                {group.members.slice(0, 5).map((member, index) => (
                  <View
                    key={member.profile.id}
                    className="flex items-center justify-center"
                    style={{ zIndex: group.members.length - index }}
                  >
                    {member.profile.avatar_url ? (
                      <Image
                        source={{ uri: member.profile.avatar_url }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          backgroundColor: '#ddd',
                          borderRadius: 20,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text className="text-sm text-white">
                          {member.profile.username.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
                {/* Afficher le nombre d'autres membres si nécessaire */}
                {group.members.length > 5 && (
                  <View
                    className="flex items-center justify-center"
                    style={{ zIndex: group.members.length - 5 }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#ddd',
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text className="text-sm text-white">
                        +{group.members.length - 5}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Boutons de création et d'adhésion */}
              <View className="flex-row space-x-2 mt-4">
                {setIsJoinGroupDrawerOpen && (
                  <TouchableOpacity
                    onPress={() => setIsJoinGroupDrawerOpen(true)}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg"
                  >
                    <Text className="text-white">Rejoindre un groupe</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default GroupList;
