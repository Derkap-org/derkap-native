import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";
import { X } from "lucide-react-native";
import { View, ScrollView, Pressable } from "react-native";
import ChallengeBox from "@/components/ChallengeBox";
import ChallengeSteps from "@/components/challenge/ChallengeSteps";
import { getPosts } from "@/functions/post-action";
import Toast from "react-native-toast-message";

import { useEffect, useState } from "react";

interface ChallengeScreenProps {
  challenge: TChallengeDB;
  group: TGroupDB;
  handleBack: () => void;
  refreshChallenge: () => Promise<void>;
}

export const ChallengeScreen = ({
  challenge,
  group,
  handleBack,
  refreshChallenge,
}: ChallengeScreenProps) => {
  const [posts, setPosts] = useState<TPostDB[]>();

  const fetchPosts = async () => {
    try {
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
    }
  };

  const refreshChallengeData = async () => {
    await fetchPosts();
    await refreshChallenge();
  };

  useEffect(() => {
    fetchPosts();
  }, [challenge, group]);

  return (
    <ScrollView className="flex flex-col min-h-full">
      <View className="relative my-2 px-4">
        <Pressable
          className="absolute -top-2 right-3 z-10 p-1 rounded-full bg-red-500"
          onPress={() => handleBack()}
        >
          <X color={"white"} size={20} />
        </Pressable>
        <ChallengeBox challenge={challenge} />
      </View>
      <ChallengeSteps
        challenge={challenge}
        group={group}
        posts={posts}
        refreshChallengeData={refreshChallengeData}
      />
    </ScrollView>
  );
};
