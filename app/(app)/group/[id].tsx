import { Text, Pressable, View, Modal, TextInput } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import GroupHeader from "@/components/group/GroupHeader";
import ChallengeBox from "@/components/ChallengeBox";
import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";
import ChallengeInProgress from "@/components/group/ChallengeInProgress";
import ChallengeFinalization from "@/components/group/ChallengeFinalization";
import { getGroup } from "@/functions/group-action";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";

import {
  getCurrentChallenge,
  createChallenge,
} from "@/functions/challenge-action";
import { getPosts } from "@/functions/post-action";
import Button from "@/components/Button";

export default function Group() {
  const [currentGroup, setCurrentGroup] = useState<TGroupDB>();
  const [currentChallenge, setCurrentChallenge] = useState<TChallengeDB>();
  const [currentPosts, setCurrentPosts] = useState<TPostDB[]>();
  const { id } = useLocalSearchParams() as { id: string };
  const [modalNewGroup, setModalNewGroup] = useState(false);

  const [inputText, setInputText] = useState("");

  const fetchCurrentGroup = async () => {
    const { data: group, error } = await getGroup({ group_id: id });
    if (error) return console.error(error);
    if (group) setCurrentGroup(group);
  };

  const modalRef = useRef<SwipeModalPublicMethods>(null);

  const showModal = () => modalRef.current?.show();

  const fetchCurrentChallenge = async () => {
    const { data: challenges, error } = await getCurrentChallenge({
      group_id: id,
    });
    if (error) console.error("Erreur dans la récupéaration du défi");
    if (challenges) {
      console.log(challenges);
      setCurrentChallenge(challenges[0]);
      return challenges[0];
    }
  };

  const fetchCurrentPosts = async ({
    challengeId,
  }: {
    challengeId: number;
  }) => {
    const { data: posts, error } = await getPosts({
      challenge_id: challengeId,
    });
    if (error) return console.error("Erreur dans la récupéaration des posts");
    if (posts) {
      console.log(posts);
      setCurrentPosts(posts);
    }
  };

  const fetchAllGroupData = async () => {
    try {
      await fetchCurrentGroup();
      const challenge = await fetchCurrentChallenge();
      if (!challenge) return;
      await fetchCurrentPosts({ challengeId: challenge.id });
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    fetchAllGroupData();
  }, [id]);

  const handleCreateChallenge = async () => {
    try {
      if (!currentGroup?.id) return;

      const { error } = await createChallenge({
        challenge: {
          description: inputText,
          group_id: currentGroup.id,
        },
      });

      if (error) {
        throw new Error("");
      }
      fetchAllGroupData();
      setInputText("");
      modalRef.current?.hide();
    } catch (error) {
      console.error("Erreur lors de la création du défi");
    }
  };

  return (
    <>
      <SafeAreaView className="flex-1">
        <GroupHeader group={currentGroup} challenge={currentChallenge} />
        <View className="flex-1 p-4 gap-y-4">
          <ChallengeBox challenge={currentChallenge} />
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
        </View>
        {(!currentChallenge || currentChallenge?.status === "ended") && (
          <>
            <Button className="mx-4" onPress={showModal} text="Créer un défi" />
          </>
        )}
      </SafeAreaView>
      <SwipeModal
        ref={modalRef}
        showBar
        maxHeight={400}
        bg="white"
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col px-10 pt-10 bg-white pb-18 gap-y-4">
          <Text className="text-2xl font-bold">Créer un défi</Text>
          <TextInput
            className="w-full p-2 border border-gray-300 rounded-lg"
            onChangeText={setInputText}
            value={inputText}
            placeholder="Entrez votre défi ici"
            placeholderTextColor="#888"
          />
          <Button
            disabled={!inputText.length}
            onPress={handleCreateChallenge}
            text="Créer un défi"
            className="w-fit"
          />
        </View>
      </SwipeModal>
    </>
  );
}
