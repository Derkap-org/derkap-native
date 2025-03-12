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
  ActivityIndicator,
} from "react-native";
import { ChallengeScreen } from "../challenge/ChallengeScreen";
import Button from "../Button";
import { createChallenge } from "@/functions/challenge-action";
import { cn } from "@/lib/utils";

interface ChallengesTabProps {
  group: TGroupDB | undefined;
  selectedChallenge: TChallengeDB | null;
  setSelectedChallenge: (challenge: TChallengeDB | null) => void;
}

export const ChallengesTab = ({
  group,
  selectedChallenge,
  setSelectedChallenge,
}: ChallengesTabProps) => {
  const [isFetchingChallenges, setIsFetchingChallenges] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [challenges, setChallenges] = useState<TChallengeDB[] | undefined>(
    undefined,
  );

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [newChallengeDescription, setNewChallengeDescription] = useState("");

  const handleCreateChallenge = async () => {
    try {
      if (!group?.id) return;
      Keyboard.dismiss();
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

  const fetchChallenges = async (pageNum = 1, append = false) => {
    try {
      setIsFetchingChallenges(true);
      if (!group?.id) return;
      const result = await getChallenges({
        group_id: group.id,
        page: pageNum,
      });

      if (result.challenges) {
        setChallenges((prev) =>
          append ? [...(prev || []), ...result.challenges] : result.challenges,
        );
        setHasMore(result.hasMore);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur dans la récupération des défis",
        text2: error.message || "Veuillez réessayer",
      });
    } finally {
      setIsFetchingChallenges(false); // why is
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      await fetchChallenges(page + 1, true);
      setPage((prev) => prev + 1);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors du chargement des défis supplémentaires",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setPage(1);
      await fetchChallenges(1, false);
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
        challenge={selectedChallenge}
      />
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={"#fff"}
          />
        }
        className="flex flex-col px-4 min-h-full"
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;

          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {isFetchingChallenges && (!challenges || challenges?.length === 0) && (
          <View className="flex flex-col gap-y-1 mt-6">
            <ActivityIndicator size="large" />
          </View>
        )}

        {(!challenges ||
          challenges.length === 0 ||
          challenges[0]?.status === "ended") &&
          !isFetchingChallenges && (
            <View className="flex flex-col gap-y-2 mt-4">
              <TextInput
                className="w-full h-16 p-2 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl"
                onChangeText={setNewChallengeDescription}
                value={newChallengeDescription}
                placeholder="Crée un nouveau défi !"
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
