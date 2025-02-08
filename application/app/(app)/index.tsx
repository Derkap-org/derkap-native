import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "expo-router";
import { Plus, User } from "lucide-react-native";
import { useSupabase } from "@/context/auth-context";
import Button from "@/components/Button";
import StatusLabel from "@/components/group/StatusLabel";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import useGroupStore from "@/store/useGroupStore";
import { useFocusEffect } from "@react-navigation/native";
import { cn } from "@/lib/utils";
import Toast from "react-native-toast-message";

const Home = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [isJoinSelected, setIsJoinSelected] = useState(true);

  const { user } = useSupabase();

  const { groups, fetchGroups, joinGroup, createGroup } = useGroupStore();

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, []),
  );

  // const modalCreateGroupRef = useRef<SwipeModalPublicMethods>(null);

  // const modalJoinGroupRef = useRef<SwipeModalPublicMethods>(null);

  const modalGroupOptionsRef = useRef<SwipeModalPublicMethods>(null);

  // const showModalCreateGroup = () => modalCreateGroupRef.current?.show();
  // const showModalJoinGroup = () => modalJoinGroupRef.current?.show();
  const showModalGroupOptions = () => modalGroupOptionsRef.current?.show();

  const handleJoinGroup = async () => {
    const { succes } = await joinGroup(inviteCode);
    if (succes) {
      modalGroupOptionsRef.current?.hide();
      setInviteCode("");
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la connexion au groupe",
      });
    }
  };

  const handleCreateGroup = async () => {
    const { succes } = await createGroup(groupName);
    if (succes) {
      modalGroupOptionsRef.current?.hide();
      setGroupName("");
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la création du groupe",
      });
    }
  };

  return (
    <>
      <View className="relative flex flex-col items-center justify-start flex-1 gap-4 p-4">
        <View className="flex-row justify-between w-full px-4">
          <Text className="text-2xl font-bold">Mes groupes</Text>
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
          {/* <Button onClick={showModalCreateGroup} text="Créer un groupe" />
          <Button onClick={showModalJoinGroup} text="Rejoindre un groupe" /> */}
          <Pressable
            className="bg-custom-primary rounded-full p-2"
            onPress={showModalGroupOptions}
          >
            <Plus color={"white"} />
          </Pressable>
        </View>
        {groups.length === 0 ? (
          <View className="flex flex-col items-center justify-center flex-1">
            <View className="flex flex-col items-center justify-center gap-2">
              <Text className="text-xs">Pas de groupe pour le moment...</Text>
              <Text className="text-4xl text-center font-grotesque">
                Crée en un dès maintenant !
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
                    <View className="flex-row items-center justify-between w-full">
                      <View className="">
                        <Text className="text-lg font-semibold">
                          {group.name}
                        </Text>

                        {/* Statut du groupe */}
                        <View className="w-24 text-white">
                          <StatusLabel
                            challengeStatus={group.challengeStatus}
                          />
                        </View>
                      </View>

                      {group.hasNewStatus === true && (
                        <Text className="flex flex-col text-center pt-[1px] items-center justify-center text-white rounded-full aspect-square h-5 w-5 bg-red-500 text-xs">
                          1
                        </Text>
                      )}
                    </View>

                    {/* Barre de statut */}
                    <View className="my-2">
                      <View className="h-[2px] bg-gray-300 w-full rounded-full" />
                    </View>

                    {/* Photos des membres */}
                    <View className="flex-row">
                      {group.members?.slice(0, 5).map((member, index) => {
                        if (!member.profile) return;
                        return (
                          <View
                            key={member.profile.id}
                            className={`border-2 border-white rounded-full overflow-hidden ${
                              index !== 0 ? "-ml-3" : ""
                            }`}
                          >
                            {member.profile?.avatar_url ? (
                              <Image
                                source={{
                                  uri: `${member.profile?.avatar_url}?t=${user.user_metadata.avatarTimestamp}`,
                                }}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <View className="items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                                <Text className="text-sm text-white">
                                  {member.profile?.username?.charAt(0) || "?"}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}

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

      {/* <SwipeModal
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
            placeholder="Entre le code d'invitation ici"
            placeholderTextColor="#888"
          />
          <Button
            withLoader={true}
            isCancel={!inviteCode.length}
            onClick={handleJoinGroup}
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
            placeholder="Entre le nom de groupe ici"
            placeholderTextColor="#888"
          />
          <Button
            withLoader={true}
            isCancel={!groupName.length}
            onClick={handleCreateGroup}
            text="Créer"
            className="w-fit"
          />
        </View>
      </SwipeModal> */}

      {/*
        className={cn(
                "py-2 px-4 rounded-xl text-sm disabled:opacity-50",
                className,
              )}
        */}
      <SwipeModal
        ref={modalGroupOptionsRef}
        showBar
        maxHeight={400}
        bg="white"
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col px-10 pt-4 bg-white pb-18 gap-y-4">
          <View className="flex flex-row items-center justify-center w-full gap-x-2">
            <Pressable
              onPress={() => setIsJoinSelected(true)}
              className={cn(
                " w-1/2  rounded-xl p-2",
                isJoinSelected ? "bg-custom-primary/50" : "bg-gray-300",
              )}
            >
              <Text
                className={cn(
                  "text-2xl text-center font-bold ",
                  !isJoinSelected && "text-gray-500 ",
                )}
              >
                Rejoindre
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setIsJoinSelected(false)}
              className={cn(
                " w-1/2  rounded-xl p-2",
                !isJoinSelected ? "bg-custom-primary/50" : "bg-gray-300 ",
              )}
            >
              <Text
                className={cn(
                  "text-2xl text-center font-bold ",
                  isJoinSelected && "text-gray-500 ",
                )}
              >
                Créer
              </Text>
            </Pressable>
          </View>

          {isJoinSelected ? (
            <View className="flex flex-col gap-y-4">
              <Text className="text-2xl font-bold">Rejoindre un groupe</Text>
              <TextInput
                className="w-full p-2 border border-gray-300 rounded-xl"
                onChangeText={setInviteCode}
                value={inviteCode}
                placeholder="Entre le code d'invitation ici"
                placeholderTextColor="#888"
              />
              <Button
                withLoader={true}
                isCancel={!inviteCode.length}
                onClick={handleJoinGroup}
                text="Rejoindre un groupe"
                className="w-fit"
              />
            </View>
          ) : (
            <View className="flex flex-col gap-y-4">
              <Text className="text-2xl font-bold">Créer un groupe</Text>
              <TextInput
                className="w-full p-2 border border-gray-300 rounded-xl"
                onChangeText={setGroupName}
                value={groupName}
                placeholder="Entre le nom de groupe ici"
                placeholderTextColor="#888"
              />
              <Button
                withLoader={true}
                isCancel={!groupName.length}
                onClick={handleCreateGroup}
                text="Créer"
                className="w-fit"
              />
            </View>
          )}
        </View>
      </SwipeModal>
    </>
  );
};

export default Home;
