import {
  Text,
  View,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useState, useEffect, useRef, Fragment } from "react";
import { useLocalSearchParams } from "expo-router";
import GroupHeader from "@/components/group/GroupHeader";

import { TChallengeDB, TGroupDB, TProfileInGroup } from "@/types/types";
import {
  addMemberToGroup,
  getGroup,
  leaveGroup,
  updateGroupName,
} from "@/functions/group-action";
import { useRouter } from "expo-router";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";

import Button from "@/components/Button";
import useGroupStore from "@/store/useGroupStore";
import { updateLastStatusSeen } from "@/lib/lastStatusSeen";
import Toast from "react-native-toast-message";
import { cn } from "@/lib/utils";
import GroupRankingTab from "@/components/group/GroupRankingTab";
import { Plus } from "lucide-react-native";
import { getProfileByUsername } from "@/functions/profile-action";
import ProfileLine from "@/components/profile/ProfileLine";
import { useDebounce } from "use-debounce";
import { ChallengesTab } from "@/components/group/ChallengesTab";

export default function Group() {
  const [selectedTab, setSelectedTab] = useState<"challenges" | "ranking">(
    "challenges",
  );
  const [currentGroup, setCurrentGroup] = useState<TGroupDB>();
  const [currentChallenge, setCurrentChallenge] = useState<TChallengeDB>();
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState("");

  const [searchedUsers, setSearchedUsers] = useState<TProfileInGroup[]>([]);
  const [queryUser, setQueryUser] = useState("");
  const [debouncedQuery] = useDebounce(queryUser, 400);

  const { fetchGroups } = useGroupStore();

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
    try {
      if (!newGroupName.length || newGroupName === currentGroup?.name) {
        return;
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

  useEffect(() => {
    if (currentGroup?.id && currentChallenge?.status) {
      updateLastStatusSeen({
        groupId: currentGroup.id,
        newStatus: currentChallenge.status,
      });
    }
  }, [currentGroup, currentChallenge]);

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

      <Modal actionSheetRef={modalGroupSettingsRef}>
        <ScrollView className="">
          <View className="flex-col items-center justify-between flex-1 gap-y-4">
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

            {/* <View className="flex flex-col items-center justify-center gap-2">
            <Text className="text-2xl font-bold font-grotesque">
              Code d'accès
            </Text>
            <Text className="text-2xl font-bold font-grotesque">
              {currentGroup?.invite_code}
            </Text>
            <Button
              className="flex items-center justify-center w-full gap-2"
              onClick={() => {
                copyInviteCode();
              }}
              text={"Copier le code"}
            />
          </View> */}

            <View className="flex flex-col items-center justify-center w-full gap-2 mt-10">
              <Text className="text-xl font-bold ">Membres du groupe</Text>
              <View className="flex flex-col w-full gap-y-4">
                {currentGroup?.members.length <= 10 && (
                  <View className="flex-row items-center justify-between w-full pb-4 mt-4 border-b-[1px] border-custom-primary">
                    {/* <Button onClick={showModalCreateGroup} text="Créer un groupe" />
          <Button onClick={showModalJoinGroup} text="Rejoindre un groupe" /> */}
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
                {currentGroup?.members?.map((member, i) => (
                  <Fragment key={i}>
                    <ProfileLine member={member.profile} />
                  </Fragment>
                ))}
              </View>
              <View className="flex flex-col items-center justify-center w-full gap-2 mt-5">
                <Button
                  withLoader={true}
                  className="w-full bg-red-500"
                  onClick={handleConfirmLeaveGroup}
                  text={"Quitter le groupe"}
                />
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
                className="text-xs "
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
