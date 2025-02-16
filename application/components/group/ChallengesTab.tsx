import { TChallengeDB, TGroupDB } from "@/types/types";
import { useEffect, useState } from "react";
import ChallengeBox from "@/components/ChallengeBox";
import { getChallenges } from "@/functions/challenge-action";
import Toast from "react-native-toast-message";
import {
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Keyboard,
  RefreshControl,
} from "react-native";
import { ChallengeScreen } from "../challenge/ChallengeScreen";
import Button from "../Button";
import { createChallenge } from "@/functions/challenge-action";
import { cn } from "@/lib/utils";

interface ChallengesTabProps {
  group: TGroupDB | undefined;
}

export const ChallengesTab = ({ group }: ChallengesTabProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [challenges, setChallenges] = useState<TChallengeDB[] | undefined>(
    undefined,
  );
  const [selectedChallenge, setSelectedChallenge] =
    useState<TChallengeDB | null>(null);

  const [newChallengeDescription, setNewChallengeDescription] = useState("");

  const handleCreateChallenge = async () => {
    try {
      if (!group?.id) return;

      await createChallenge({
        challenge: {
          description: newChallengeDescription,
          group_id: group.id,
        },
      });

      await fetchChallenges();
      setNewChallengeDescription("");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la création du défi",
        text2: error.message || "Veuillez réessayer",
      });
    }
  };

  const fetchChallenges = async () => {
    if (!group?.id) return;
    try {
      // todo: add pagination
      const challenges = await getChallenges({
        group_id: group.id,
      });

      if (challenges) {
        setChallenges(challenges);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur dans la récupération des défis",
        text2: error.message || "Veuillez réessayer",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchChallenges();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors du rafraîchissement des défis",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [group]);

  useEffect(() => {
    // search if there was a selected challenge, if it's in the list of challenges, update it
    if (selectedChallenge) {
      const challenge = challenges?.find(
        (challenge) => challenge.id === selectedChallenge.id,
      );
      if (challenge) {
        setSelectedChallenge(challenge);
      }
    }
  }, [challenges]);

  if (selectedChallenge) {
    return (
      <ChallengeScreen
        refreshChallenge={fetchChallenges}
        group={group}
        handleBack={() => setSelectedChallenge(null)}
        challenge={selectedChallenge}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        className="flex flex-col px-4 min-h-full"
      >
        {(!challenges ||
          challenges.length === 0 ||
          challenges[0]?.status === "ended") && (
          <View className="flex flex-col gap-y-1">
            <TextInput
              className="w-full h-16 p-2 bg-white border border-gray-300 rounded-xl placeholder:text-gray-500"
              onChangeText={setNewChallengeDescription}
              value={newChallengeDescription}
              placeholder="Crée un nouveau défi !"
              placeholderTextColor="#888"
            />
            <Button
              withLoader={true}
              isCancel={!newChallengeDescription.length}
              onClick={handleCreateChallenge}
              text="Créer"
              className="w-fit"
            />
          </View>
        )}
        {challenges?.map((challenge, i) => (
          <Pressable
            // className="my-2"
            className={cn(`my-2 ${i === challenges.length - 1 ? "mb-48" : ""}`)}
            key={challenge.id}
            onPress={() => {
              setSelectedChallenge(challenge);
            }}
          >
            <ChallengeBox challenge={challenge} />
          </Pressable>
        ))}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};
