import {
  Text,
  View,
  TextInput,
  Alert,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useRef, Fragment } from "react";
import { useLocalSearchParams } from "expo-router";
import GroupHeader from "@/components/group/GroupHeader";

import { TGroupDB, TProfileInGroup } from "@/types/types";
import {
  addMemberToGroup,
  getGroup,
  leaveGroup,
  updateDbGroupImg,
  updateGroupName,
  MAX_GROUP_NAME_LENGTH,
} from "@/functions/group-action";
import { useRouter } from "expo-router";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";

import Button from "@/components/Button";
import useGroupStore from "@/store/useGroupStore";
import Toast from "react-native-toast-message";
import { cn } from "@/lib/utils";
import GroupRankingTab from "@/components/group/GroupRankingTab";
import { Pencil, Plus } from "lucide-react-native";
import { getProfileByUsername } from "@/functions/profile-action";
import ProfileLine from "@/components/profile/ProfileLine";
import { useDebounce } from "use-debounce";
import { ChallengesTab } from "@/components/group/ChallengesTab";
import * as ImagePicker from "expo-image-picker";
import { updateLastActivitySeen } from "@/lib/last-activity-storage";

export default function Group() {
  const [selectedTab, setSelectedTab] = useState<"challenges" | "ranking">(
    "challenges",
  );
  const [currentGroup, setCurrentGroup] = useState<TGroupDB>();
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupImage, setNewGroupImage] = useState<string | null>(null);

  const [searchedUsers, setSearchedUsers] = useState<TProfileInGroup[]>([]);
  const [queryUser, setQueryUser] = useState("");
  const [debouncedQuery] = useDebounce(queryUser, 400);

  const { fetchGroups, updateGroupImg } = useGroupStore();

  useEffect(() => {
    if (currentGroup) {
      updateLastActivitySeen(currentGroup);
    }
  }, [currentGroup]);

  const fetchCurrentGroup = async () => {
    try {
      const group = await getGroup({ group_id: id });
      if (group) setCurrentGroup(group);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur dans la récupération du groupe",
        text2: error.message || "Veuillez réessayer",
      });
    }
  };

  const modalGroupSettingsRef = useRef<ActionSheetRef>(null);

  const modalAddMemberRef = useRef<ActionSheetRef>(null);

  const showGroupSettingsModal = () => modalGroupSettingsRef.current?.show();

  const showAddMemberModal = () => {
    modalAddMemberRef.current?.show();
  };

  const handleAddMember = async (user_id: string) => {
    if (!currentGroup?.id) {
      console.error("No group id");
      return;
    }

    if (currentGroup?.members?.length >= 10) {
      Toast.show({
        type: "error",
        text1: "Le groupe est complet",
      });
      return;
    }

    if (
      currentGroup?.members?.some((member) => member.profile.id === user_id)
    ) {
      Toast.show({
        type: "error",
        text1: "Le membre est déjà dans le groupe",
      });
      return;
    }

    try {
      const result = await addMemberToGroup({
        group_id: currentGroup.id,
        user_id,
      });

      if (result?.error) {
        Toast.show({
          type: "error",
          text1: result.error || "Erreur lors de l'ajout du membre",
        });
      } else {
        const newGroup = {
          ...currentGroup,
          members: [
            ...currentGroup.members,
            {
              profile: searchedUsers.find((user) => user.id === user_id),
            },
          ],
        };
        setCurrentGroup(newGroup);
        const newSearchUsers = searchedUsers.map((user) => {
          if (user.id === user_id) {
            return { ...user, alreadyInGroup: true };
          }
          return user;
        });
        setSearchedUsers(newSearchUsers);
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l'ajout du membre",
        text2: "Veuillez réessayer",
      });
    }
  };

  const handleUpdateGroupName = async () => {
    if (newGroupName.length > MAX_GROUP_NAME_LENGTH) {
      Toast.show({
        type: "error",
        text1: `Le nom du groupe ne doit pas dépasser ${MAX_GROUP_NAME_LENGTH} caractères`,
      });
      return;
    }
    try {
      if (!newGroupName.length || newGroupName === currentGroup?.name) {
      }
      await updateGroupName({
        group_id: currentGroup?.id,
        name: newGroupName,
      });

      fetchCurrentGroup();
      setNewGroupName("");
      modalGroupSettingsRef.current?.hide();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la modification du nom du groupe",
        text2: error.message || "Veuillez réessayer",
      });
    }
  };

  const fetchUserByUsername = async (query: string) => {
    const { data } = await getProfileByUsername(query);

    const enrichedUsers = data.map((user) => ({
      ...user,
      alreadyInGroup:
        currentGroup?.members?.some(
          (member) => member.profile.username === user.username,
        ) || false,
    }));
    setSearchedUsers(enrichedUsers);
  };

  useEffect(() => {
    fetchCurrentGroup();
  }, [id]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchUserByUsername(debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleConfirmLeaveGroup = async () => {
    Alert.alert("Êtes-vous sûr de vouloir quitter le groupe ?", "", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Quitter",
        onPress: () => (handleLeaveGroup(), fetchGroups()),
      },
    ]);
  };

  const handleLeaveGroup = async () => {
    try {
      if (!currentGroup?.id) {
        return;
      }

      await leaveGroup({
        group_id: currentGroup.id?.toString(),
      });

      fetchGroups();
      router.back();
      Toast.show({
        type: "success",
        text1: "Vous avez quitté le groupe",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la sortie du groupe",
        text2: "Veuillez réessayer",
      });
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
      });

      if (result.canceled) return;

      const imgUrl = result.assets[0].uri;

      setNewGroupImage(imgUrl);

      await updateDbGroupImg(currentGroup.id, imgUrl);
      updateGroupImg(currentGroup.id, imgUrl);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la mise à jour de l'image",
        text2: error?.message || "Une erreur inconnue est survenue",
      });
    }
  };

  return (
    <>
      <View className="mb-28">
        <GroupHeader
          group={currentGroup}
          // challenge={currentChallenge}
          showModal={showGroupSettingsModal}
        />

        {/* <View className="p-4 gap-y-4"> */}

        <View className="flex flex-row justify-between px-4 my-2">
          <Pressable
            className={cn(
              "w-1/2 flex justify-center items-center rounded-xl py-4",
              selectedTab === "challenges" && "bg-custom-primary/50",
            )}
            onPress={() => setSelectedTab("challenges")}
          >
            <Text
              className={cn(
                "text-gray-500",
                selectedTab === "challenges" && "text-black font-bold",
              )}
            >
              Défis
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "w-1/2 flex justify-center items-center rounded-xl py-4",
              selectedTab === "ranking" && "bg-custom-primary/50",
            )}
            onPress={() => setSelectedTab("ranking")}
          >
            <Text
              className={cn(
                "text-gray-500",
                selectedTab === "ranking" && "text-black font-bold",
              )}
            >
              Classement
            </Text>
          </Pressable>
        </View>
        {selectedTab === "challenges" && <ChallengesTab group={currentGroup} />}
        {selectedTab === "ranking" && <GroupRankingTab groupId={Number(id)} />}
      </View>

      <Modal fullScreen={true} actionSheetRef={modalGroupSettingsRef}>
        <ScrollView className="min-h-full">
          <View className="flex-col h-full items-center justify-between flex-1 gap-y-4 mt-2">
            <View className="relative flex items-center justify-center w-24 h-24 border-2 rounded-full bg-custom-white border-custom-primary">
              <Pressable
                onPress={pickImage}
                className="absolute z-10 p-2 rounded-full -right-2 -top-2 bg-custom-primary"
              >
                <Pencil size={20} color={"white"} />
              </Pressable>
              {currentGroup?.img_url || newGroupImage ? (
                <Image
                  src={
                    newGroupImage ||
                    `${currentGroup?.img_url}?t=${new Date().getTime()}`
                  }
                  alt={currentGroup?.name ?? ""}
                  width={70}
                  height={70}
                  className="object-cover w-24 h-24 border-2 rounded-full border-custom-primary bg-custom-white"
                />
              ) : (
                <Text className="text-2xl uppercase">
                  {currentGroup?.name
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")}
                </Text>
              )}
            </View>

            <Text className="text-2xl font-bold font-grotesque">
              Gérer le groupe
            </Text>

            <View className="flex flex-col items-center justify-center w-full gap-2">
              <Text className="text-xl ">Nom du groupe</Text>
              <TextInput
                className="w-full p-2 border border-gray-300 rounded-xl"
                onChangeText={setNewGroupName}
                value={newGroupName}
                placeholder={currentGroup?.name}
                placeholderTextColor="#888"
              />
              <Button
                withLoader={true}
                className="flex items-center justify-center w-full gap-2"
                onClick={handleUpdateGroupName}
                isCancel={
                  !newGroupName.length || newGroupName === currentGroup?.name
                }
                text={"Modifier le nom du groupe"}
              />
            </View>

            <View className="flex flex-col items-center justify-center w-full gap-2">
              <Button
                withLoader={true}
                className="w-full bg-red-500"
                onClick={handleConfirmLeaveGroup}
                text={"Quitter le groupe"}
              />
            </View>

            <View className="flex flex-grow flex-col items-center justify-center w-full gap-2 mt-10">
              <Text className="text-xl font-bold ">Membres du groupe</Text>
              <View className="flex flex-col w-full gap-y-4">
                {currentGroup?.members.length <= 10 && (
                  <View className="flex-row items-center justify-between w-full pb-4 mt-4 border-b-[1px] border-custom-primary">
                    <Pressable
                      className="flex flex-row items-center gap-x-2"
                      onPress={showAddMemberModal}
                    >
                      <View className="p-2 rounded-full bg-custom-primary w-fit">
                        <Plus color={"white"} size={22} />
                      </View>
                      <Text>Ajouter un membre</Text>
                    </Pressable>
                  </View>
                )}
                <Text className="font-bold ">
                  {currentGroup?.members?.length}/10 membres
                </Text>
                <View className="flex flex-col w-full gap-y-4">
                  {currentGroup?.members?.map((member, i) => (
                    <Fragment key={i}>
                      <ProfileLine member={member.profile} />
                    </Fragment>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <Modal actionSheetRef={modalAddMemberRef} fullScreen={true}>
          <Text className="text-2xl font-bold">Ajoute tes amis</Text>
          <TextInput
            className="w-full p-2 border border-gray-300 rounded-xl"
            onChangeText={setQueryUser}
            // value={queryUser}
            placeholder="Cherche quelqu'un"
            placeholderTextColor="#888"
          />
          {searchedUsers.map((user) => (
            <View
              className="flex flex-row items-center justify-between w-full gap-2"
              key={user.id}
            >
              <ProfileLine member={user} className="w-fit" />
              <Button
                className="text-xs"
                isCancel={!!user?.alreadyInGroup}
                withLoader={true}
                onClick={() => handleAddMember(user.id)}
                text={user?.alreadyInGroup ? "Ajouté" : "Ajouter"}
              />
            </View>
          ))}
        </Modal>
      </Modal>
    </>
  );
}
