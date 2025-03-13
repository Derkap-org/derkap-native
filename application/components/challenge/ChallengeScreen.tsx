import { TChallengeDB, TGroupDB, TPostDB, TVoteDB } from "@/types/types";
import { X } from "lucide-react-native";
import { View, ScrollView, Pressable, RefreshControl } from "react-native";
import ChallengeBox from "@/components/ChallengeBox";
import ChallengeSteps from "@/components/challenge/ChallengeSteps";
import { getPosts } from "@/functions/post-action";
import Toast from "react-native-toast-message";
import { getVotes } from "@/functions/vote-action";
import { useEffect, useState } from "react";

interface ChallengeScreenProps {
  challenge: TChallengeDB;
  group: TGroupDB;
  refreshChallenge: () => Promise<void>;
}

export const ChallengeScreen = ({
  challenge,
  group,
  refreshChallenge,
}: ChallengeScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<TPostDB[]>();
  const [votes, setVotes] = useState<TVoteDB[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      if (!group?.id) return;
      if (!challenge?.id) return;
      // add cache for posts
      const posts = await getPosts({
        challenge_id: challenge.id,
        group_id: group.id,
        isChallengeEnded: challenge.status === "ended",
      });

      if (posts) {
        setPosts(posts);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur dans la récupération des posts",
        text2: error.message || "Veuillez réessayer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVotes = async () => {
    try {
      if (!challenge) return;
      const votes = await getVotes({
        challenge_id: challenge.id,
      });
      setVotes(votes || []);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la récupération des votes",
        text2: error?.message || "Une erreur est survenue",
      });
    }
  };

  const refreshChallengeData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchPosts(), refreshChallenge(), fetchVotes()]);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors du rafraîchissement des données du défi",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshChallengeData();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors du rafraîchissement des données du défi",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [challenge, group]);

  useEffect(() => {
    fetchVotes();
  }, [challenge]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={"#fff"}
        />
      }
      className="flex flex-col min-h-full"
    >
      <View className="relative my-2 px-4">
        <ChallengeBox challenge={challenge} />
      </View>
      <ChallengeSteps
        isLoading={isLoading}
        challenge={challenge}
        group={group}
        posts={posts}
        votes={votes}
        refreshChallengeData={refreshChallengeData}
      />
    </ScrollView>
  );
};
