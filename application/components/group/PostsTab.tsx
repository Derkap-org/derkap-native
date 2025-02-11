import { Text, View, TextInput, ScrollView } from "react-native";
import React, { useState, useRef } from "react";

import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";
import ChallengeInProgress from "@/components/group/ChallengeInProgress";
import ChallengeFinalization from "@/components/group/ChallengeFinalization";

import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";

import { createChallenge } from "@/functions/challenge-action";
import Button from "@/components/Button";
import Toast from "react-native-toast-message";

interface PostsTabProps {
  fetchAllGroupData: () => Promise<void>;
  currentGroup: TGroupDB | undefined;
  currentChallenge: TChallengeDB | undefined;
  currentPosts: TPostDB[] | undefined;
}

export default function PostsTab({
  fetchAllGroupData,
  currentGroup,
  currentChallenge,
  currentPosts,
}: PostsTabProps) {
  const [newChallengeDescription, setNewChallengeDescription] = useState("");

  const modalCreateChallengeRef = useRef<SwipeModalPublicMethods>(null);

  const showCreateChallengeModal = () =>
    modalCreateChallengeRef.current?.show();

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

  return (
    <>
      <ScrollView className="flex flex-col px-4">
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
            group={currentGroup}
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
    </>
  );
}
