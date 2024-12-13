import { View, Text, Pressable, Image, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import { User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/auth-context";
import { getGroups, createGroup } from "@/functions/group-action";
import { TGroupDB } from "@/types/types";
import Button from "@/components/Button";
import StatusLabel from "@/components/group/StatusLabel";

const Home = () => {
  const [groups, setGroups] = useState<TGroupDB[]>([]);
  const { user, profile } = useSupabase();

  const handleGetGroups = async () => {
    try {
      const { data, error } = await getGroups({});

      if (error) {
        console.error(error);
      }
      if (data) {
        setGroups(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetGroups();
  }, []);

  const handleCreateGroup = async () => {
    const groupeName = "Groupe Test";
    const { data, error } = await createGroup({ name: groupeName });
    if (error) return console.error(error);
    if (data) {
      setGroups([...groups, data]);
    }
  };

  const handleJoinGroup = async () => {
    // const inviteCode = "INVITE_CODE";
    // const { data, error } = await joinGroup({ invite_code: inviteCode });
    // if (error) return console.error(error);
    // if (data) {
    //   setGroups([...groups, data]);
    // }
  };

  return (
    <SafeAreaView className="relative items-center justify-start flex-1 p-4 flex flex-col gap-4">
      <ScrollView>
        <View className="w-full flex-row justify-end px-4">
          <Link
            href={{
              pathname: "/profile/[id]",
              params: { id: user.id },
            }}
          >
            <User size={30} color="black" />
          </Link>
        </View>
        <View className="w-full flex-row justify-between items-center py-4">
          <Button onPress={handleCreateGroup} text="Créer un groupe" />
          <Button onPress={handleJoinGroup} text="Rejoindre un groupe" />
        </View>
        {groups.map((group) => (
          <Link
            key={group.id}
            href={{
              pathname: "/group/[id]",
              params: { id: group.id },
            }}
            className="p-4 shadow-element bg-white mb-4  border border-custom-black min-h-16 max-h-fit flex w-full px-4 rounded-xl bg-custom-white rounded-xl py-2 text-custom-black shadow-element gap-4 items-center"
          >
            <View className="flex-row justify-between items-center">
              <View className="w-full">
                <Text className="text-lg font-semibold">{group.name}</Text>

                {/* Statut du groupe */}
                <View className="w-24 text-white">
                  <StatusLabel challengeStatus={"posting"} />
                </View>

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
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
