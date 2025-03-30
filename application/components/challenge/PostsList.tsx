import { View, ViewProps, ActivityIndicator } from "react-native";
import { TPostDB, TVoteDB, UserVote } from "@/types/types";
import PostCard from "./PostCard";
import { ScrollView } from "react-native-gesture-handler";
import { useState, useEffect } from "react";

import Toast from "react-native-toast-message";
import { addVote } from "@/functions/vote-action";
interface PostsListProps extends ViewProps {
  posts: TPostDB[];
  finalizationData?: {
    setCurrentPostIndex: React.Dispatch<React.SetStateAction<number>>;
    userVote: UserVote;
    votes: TVoteDB[];
  };
  groupLength?: number;
  challengeStatus: "posting" | "voting" | "ended";
  refreshChallengeData: () => Promise<void>;
}

export default function PostsList({
  posts,
  finalizationData,
  groupLength,
  challengeStatus,
  refreshChallengeData,
  className,
  ...props
}: PostsListProps) {
  const [sortedPosts, setSortedPosts] = useState<TPostDB[]>();

  const { userVote, votes } = finalizationData || {};
  const getVoteCount = ({ postId }: { postId: number }) => {
    if (!votes) return 0;
    return votes.filter((vote) => vote.post_id === postId).length;
  };

  const handleVote = async (post: TPostDB) => {
    try {
      if (post.id === userVote?.postId) return;
      await addVote({
        post_id: post.id,
        challenge_id: post.challenge_id,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors du vote",
        text2: error?.message || "Une erreur est survenue",
      });
    } finally {
      await refreshChallengeData();
    }
  };

  useEffect(() => {
    if (!posts) return;
    if (challengeStatus !== "ended") {
      setSortedPosts(posts);
      return;
    }
    const sorted = [...posts].sort((a, b) => {
      const votesA = getVoteCount({ postId: a.id });
      const votesB = getVoteCount({ postId: b.id });
      return votesB - votesA;
    });
    setSortedPosts(sorted);
  }, [challengeStatus, posts, votes]);

  if (!sortedPosts)
    return (
      <View className="flex h-[34rem] w-full">
        <View className="bg-black/50 flex items-center justify-center w-full h-full rounded-2xl ">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      className=""
    >
      {sortedPosts?.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          handleVote={handleVote}
          challengeStatus={challengeStatus}
          userVote={userVote}
          votes={votes}
        />
      ))}
    </ScrollView>
  );
}
