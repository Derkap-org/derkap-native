import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Link } from "expo-router";
import { User } from "lucide-react-native";
import { useSupabase } from "@/context/auth-context";
import Button from "@/components/Button";
import StatusLabel from "@/components/group/StatusLabel";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import JoinGroupModal from "./_components/modals/JoinGroupModal";
import CreateGroupModal from "./_components/modals/CreateGroupModal";
import useGroupStore from "@/store/useGroupStore";

const Home = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");

  const { user, profile } = useSupabase();

  const {
    groups,
    fetchGroups,
    setGroups,
    joinGroup,
    createGroup,
    isJoining,
    isCreating,
  } = useGroupStore();

  useEffect(() => {
    fetchGroups();
  }, []);

  const modalCreateGroupRef = useRef<SwipeModalPublicMethods>(null);

  const modalJoinGroupRef = useRef<SwipeModalPublicMethods>(null);

  const showModalCreateGroup = () => modalCreateGroupRef.current?.show();
  const showModalJoinGroup = () => modalJoinGroupRef.current?.show();

  const handleJoinGroup = async () => {
    const { succes } = await joinGroup(inviteCode);
    if (succes) {
      modalJoinGroupRef.current?.hide();
      setInviteCode("");
    }
  };

  const handleCreateGroup = async () => {
    const { succes } = await createGroup(groupName);
    if (succes) {
      modalCreateGroupRef.current?.hide();
      setGroupName("");
    }
  };

  return (
    <>
      <View className="relative flex flex-col items-center justify-start flex-1 gap-4 p-4">
        <View className="flex-row justify-end w-full px-4">
          <Link
            href={{
              pathname: "/profile/[id]",
              params: { id: user.id },
            }}
          >
            <User size={30} color="black" />
          </Link>
        </View>
        <View className="flex-row items-center justify-between w-full py-4">
          <Button onPress={showModalCreateGroup} text="Créer un groupe" />
          <Button onPress={showModalJoinGroup} text="Rejoindre un groupe" />
        </View>
        {groups.length === 0 ? (
          <View className="flex-1 flex flex-col items-center justify-center">
            <View className="flex flex-col gap-2 items-center justify-center">
              <Text className="text-xs">Pas de groupe pour le moment...</Text>
              <Text className="font-grotesque text-4xl text-center">
                Créez en un dès maintenant !
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView className="w-full">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={{
                  pathname: "/group/[id]",
                  params: { id: group.id },
                }}
                className="flex items-center w-full gap-4 p-4 px-4 py-2 mb-4 bg-white border shadow-element border-custom-black rounded-xl text-custom-black"
              >
                <View className="flex-row items-center justify-between">
                  <View className="w-full">
                    <Text className="text-lg font-semibold">{group.name}</Text>

                    {/* Statut du groupe */}
                    <View className="w-24 text-white">
                      <StatusLabel challengeStatus={group.challengeStatus} />
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
                            <View className="items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                              <Text className="text-sm text-white">
                                {member.profile.username?.charAt(0) || "?"}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}

                      {/* Nombre de membres supplémentaires */}
                      {(group.members?.length || 0) > 5 && (
                        <View className="items-center justify-center w-10 h-10 -ml-3 bg-gray-300 border-2 border-white rounded-full">
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
        )}
      </View>

      <SwipeModal
        ref={modalJoinGroupRef}
        showBar
        maxHeight={400}
        bg="white"
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col px-10 pt-10 bg-white pb-18 gap-y-4">
          <Text className="text-2xl font-bold">Rejoindre un groupe</Text>
          <TextInput
            className="w-full p-2 border border-gray-300 rounded-xl"
            onChangeText={setInviteCode}
            value={inviteCode}
            placeholder="Entrez votre code d'invitation ici"
            placeholderTextColor="#888"
          />
          <Button
            disabled={!inviteCode.length}
            onPress={handleJoinGroup}
            text="Rejoindre un groupe"
            className="w-fit"
          />
        </View>
      </SwipeModal>
      <SwipeModal
        ref={modalCreateGroupRef}
        showBar
        maxHeight={400}
        bg="white"
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col px-10 pt-10 bg-white pb-18 gap-y-4">
          <Text className="text-2xl font-bold">Créer un groupe</Text>
          <TextInput
            className="w-full p-2 border border-gray-300 rounded-xl"
            onChangeText={setGroupName}
            value={groupName}
            placeholder="Entrez votre nom de groupe ici"
            placeholderTextColor="#888"
          />
          <Button
            disabled={!groupName.length}
            onPress={handleCreateGroup}
            text="Créer"
            className="w-fit"
          />
        </View>
      </SwipeModal>
    </>
  );
};

export default Home;
