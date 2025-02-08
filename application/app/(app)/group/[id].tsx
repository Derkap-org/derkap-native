import { Text, View, TextInput, Alert, ScrollView } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import GroupHeader from "@/components/group/GroupHeader";
import ChallengeBox from "@/components/ChallengeBox";
import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";
import ChallengeInProgress from "@/components/group/ChallengeInProgress";
import ChallengeFinalization from "@/components/group/ChallengeFinalization";
import {
  getGroup,
  leaveGroup,
  updateGroupName,
} from "@/functions/group-action";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import { useRouter } from "expo-router";
import {
  getCurrentChallenge,
  createChallenge,
} from "@/functions/challenge-action";
import { getPostsFromDB } from "@/functions/post-action";
import Button from "@/components/Button";
import * as Clipboard from "expo-clipboard";
import useGroupStore from "@/store/useGroupStore";
import { updateLastStatusSeen } from "@/lib/lastStatusSeen";
import Toast from "react-native-toast-message";

export default function Group() {
  const [currentGroup, setCurrentGroup] = useState<TGroupDB>();
  const [currentChallenge, setCurrentChallenge] = useState<TChallengeDB>();
  const [currentPosts, setCurrentPosts] = useState<TPostDB[]>();
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();
  const [newGroupName, setNewGroupName] = useState("");
  const [newChallengeDescription, setNewChallengeDescription] = useState("");

  const { fetchGroups } = useGroupStore();

  const copyInviteCode = async () => {
    await Clipboard.setStringAsync(currentGroup?.invite_code);
  };

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

  const modalCreateChallengeRef = useRef<SwipeModalPublicMethods>(null);

  const modalGroupSettingsRef = useRef<SwipeModalPublicMethods>(null);

  const showCreateChallengeModal = () =>
    modalCreateChallengeRef.current?.show();

  const showGroupSettingsModal = () => modalGroupSettingsRef.current?.show();

  const fetchCurrentChallenge = async () => {
    try {
      const challenge = await getCurrentChallenge({
        group_id: id,
      });

      if (challenge) {
        setCurrentChallenge(challenge);
        return challenge;
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur dans la récupération du défi",
        text2: error.message || "Veuillez réessayer",
      });
    }
  };

  const fetchCurrentPosts = async ({
    challengeId,
  }: {
    challengeId: number;
  }) => {
    try {
      const posts = await getPostsFromDB({
        challenge_id: challengeId,
        group_id: Number(id),
      });

      if (posts) {
        setCurrentPosts(posts);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur dans la récupération des posts",
        text2: error.message || "Veuillez réessayer",
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

  const fetchAllGroupData = async () => {
    try {
      await fetchCurrentGroup();
      const challenge = await fetchCurrentChallenge();
      if (!challenge) return;
      await fetchCurrentPosts({ challengeId: challenge.id });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur dans la récupération des données du groupe",
        text2: error.message || "Veuillez réessayer",
      });
    }
  };

  useEffect(() => {
    fetchAllGroupData();
  }, [id]);

  useEffect(() => {
    if (currentGroup?.id && currentChallenge?.status) {
      updateLastStatusSeen({
        groupId: currentGroup.id,
        newStatus: currentChallenge.status,
      });
    }
  }, [currentGroup, currentChallenge]);

  const handleCreateChallenge = async () => {
    try {
      if (!currentGroup?.id) return;

      await createChallenge({
        challenge: {
          description: newChallengeDescription,
          group_id: currentGroup.id,
        },
      });

      fetchAllGroupData();
      setNewChallengeDescription("");
      modalCreateChallengeRef.current?.hide();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la création du défi",
        text2: error.message || "Veuillez réessayer",
      });
    }
  };

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
      <View className="">
        <GroupHeader
          group={currentGroup}
          challenge={currentChallenge}
          showModal={showGroupSettingsModal}
        />

        {/* <View className="p-4 gap-y-4"> */}
        <ChallengeBox challenge={currentChallenge} />
        <ScrollView className="flex flex-col px-4 pt-4">
          {currentChallenge?.status === "posting" && (
            <ChallengeInProgress
              challenge={currentChallenge}
              group={currentGroup}
              posts={currentPosts}
              fetchAllGroupData={fetchAllGroupData}
            />
          )}

          {(currentChallenge?.status === "voting" ||
            currentChallenge?.status === "ended") && (
            <ChallengeFinalization
              posts={currentPosts}
              challenge={currentChallenge}
              fetchAllGroupData={fetchAllGroupData}
              // setIsCreateChallengeOpen={setIsCreateChallengeOpen}
            />
          )}
          {/* </View> */}
          {(!currentChallenge || currentChallenge?.status === "ended") && (
            <>
              <Button
                className="m-4"
                onClick={showCreateChallengeModal}
                text="Créer un défi"
              />
            </>
          )}
        </ScrollView>
      </View>
      <SwipeModal
        ref={modalCreateChallengeRef}
        showBar
        maxHeight={400}
        bg="white"
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col px-10 pt-10 bg-white pb-18 gap-y-4">
          <Text className="text-2xl font-bold">Créer un défi</Text>
          <TextInput
            className="w-full p-2 border border-gray-300 rounded-xl"
            onChangeText={setNewChallengeDescription}
            value={newChallengeDescription}
            placeholder="Entre ton défi ici"
            placeholderTextColor="#888"
          />
          <Button
            withLoader={true}
            isCancel={!newChallengeDescription.length}
            onClick={handleCreateChallenge}
            text="Créer un défi"
            className="w-fit"
          />
        </View>
      </SwipeModal>
      <SwipeModal
        ref={modalGroupSettingsRef}
        showBar
        maxHeight={600}
        bg="white"
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        wrapInGestureHandlerRootView
      >
        <View className="flex-col items-center justify-between flex-1 px-10 py-5 gap-y-4">
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

          <View className="flex flex-col items-center justify-center gap-2">
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
          </View>

          <View className="flex flex-col items-center justify-center w-full gap-2">
            <Text className="font-bold ">
              {currentGroup?.members?.length}/10 membres
            </Text>
            <Button
              withLoader={true}
              className="w-full bg-red-500"
              onClick={handleConfirmLeaveGroup}
              text={"Quitter le groupe"}
            />
          </View>
        </View>
      </SwipeModal>
    </>
  );
}
