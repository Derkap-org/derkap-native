import { View, Text, ViewProps, ActivityIndicator } from "react-native";
import { TPostDB, TVoteDB, UserVote } from "@/types/types";
import PostCard from "./PostCard";
import { ScrollView } from "react-native-gesture-handler";
import { useState, useEffect } from "react";
interface PostsListProps extends ViewProps {
  posts: TPostDB[];
  finalizationData?: {
    setCurrentPostIndex: React.Dispatch<React.SetStateAction<number>>;
    userVote: UserVote;
    votes: TVoteDB[];
  };
  groupLength?: number;
  challengeStatus: "posting" | "voting" | "ended";
}

export default function PostsList({
  posts,
  finalizationData,
  groupLength,
  challengeStatus,
  className,
  ...props
}: PostsListProps) {
  const [sortedPosts, setSortedPosts] = useState<TPostDB[]>();
  const { setCurrentPostIndex, userVote, votes } = finalizationData || {};
  const getVoteCount = ({ postId }: { postId: number }) => {
    if (!votes) return 0;
    return votes.filter((vote) => vote.post_id === postId).length;
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
    <ScrollView className="">
      {sortedPosts?.map((post) => <PostCard key={post.id} post={post} />)}
    </ScrollView>
  );
}
