import { cn } from "@/lib/utils";
import Button from "@/components/Button";
import {
  TPostDB,
  TVoteDB,
  TChallengeDB,
  UserVote,
  TGroupDB,
} from "@/types/types";
import { useState, useEffect, useRef } from "react";
import { View, Text, ViewProps, Image } from "react-native";
import { useSupabase } from "@/context/auth-context";
import Toast from "react-native-toast-message";
import PostsList from "@/components/challenge/PostsList";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import { setChallengeToEnd } from "@/functions/challenge-action";
import React from "react";

interface ChallengeFinalizationProps extends ViewProps {
  posts: TPostDB[];
  refreshChallengeData: () => Promise<void>;
  challenge: TChallengeDB;
  group: TGroupDB;
  votes: TVoteDB[];
}

const ChallengeFinalization = ({
  posts,
  group,
  challenge,
  refreshChallengeData,
  className,
  votes,
  ...props
}: ChallengeFinalizationProps) => {
  const { profile } = useSupabase();
  const [selectedPost, setSelectedPost] = useState<TPostDB | null>(null);
  const [userVote, setUserVote] = useState<UserVote>(); // null

  const [currentPost, setCurrentPost] = useState(0);

  const modalEndVoteRef = useRef<ActionSheetRef>(null);

  const showModalEndVote = () => modalEndVoteRef.current?.show();

  const handleEndVote = async () => {
    try {
      if (!challenge) throw new Error("Challenge inconnu");
      await setChallengeToEnd({ challenge_id: challenge.id });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la fermeture des votes",
        text2: error?.message || "Une erreur est survenue",
      });
    } finally {
      modalEndVoteRef.current?.hide();
      await refreshChallengeData();
    }
  };

  const getWhoNotVote = () => {
    if (!challenge || !posts) return [];
    const groupMembers = group.members;
    const votesProfiles = votes.map((vote) => vote.user_id);
    return groupMembers?.filter(
      (member) => !votesProfiles.includes(member.profile?.id ?? ""),
    );
  };

  useEffect(() => {
    if (!votes) return;
    const userVote = votes?.find((vote) => vote.user_id === profile.id);
    setUserVote({
      voted: !!userVote,
      postId: userVote?.post_id,
    });
  }, [votes]);

  // useEffect(() => {
  //   fetchVotes();
  // }, []);

  useEffect(() => {
    if (!posts) return;
    setSelectedPost(posts[currentPost]);
  }, [currentPost, posts]);

  return (
    <View>
      <View
        {...props}
        className={cn("w-full flex flex-col items-center gap-2", className)}
      >
        {challenge?.status === "voting" && (
          <View className="w-full flex flex-row items-center justify-center gap-6">
            <Text className="text-white text-center text-2xl font-grotesque">
              {votes.length} votes sur {group.members.length}
            </Text>
            <View className="flex flex-col items-center gap-2">
              {challenge?.creator_id !== profile.id && (
                <Text className="text-sm text-gray-300 text-center">
                  Seul le créateur du défi{"\n"}peut clore les votes
                </Text>
              )}
              <Button
                className="px-2 py-0"
                text="Clore les votes"
                onClick={showModalEndVote}
                isCancel={challenge.creator_id !== profile.id}
              />
            </View>
          </View>
        )}

        {challenge?.status === "voting" && posts && posts.length > 0 && (
          <View className="flex flex-col items-center justify-center w-full gap-1 mt-2">
            <Text className="text-2xl font-grotesque text-white">
              On attend leur votes...
            </Text>
            <View className="flex flex-row items-center justify-center flex-wrap w-full gap-2 px-4">
              {getWhoNotVote().map((member, index) => (
                <View
                  key={index}
                  className="flex flex-row items-center gap-x-2"
                >
                  <View className={`rounded-full overflow-hidden`}>
                    {member.profile.avatar_url ? (
                      <Image
                        source={{
                          uri: `${member.profile.avatar_url}?t=${new Date().getTime()}`,
                        }}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <View className="items-center justify-center w-10 h-10 bg-black rounded-full">
                        <Text className="text-sm text-gray-300">
                          {member.profile.username?.charAt(0) || "?"}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-lg font-bold text-white">
                    {member.profile.username}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <PostsList
          posts={posts}
          challengeStatus={challenge?.status}
          finalizationData={{
            setCurrentPostIndex: setCurrentPost,
            userVote: userVote,
            votes: votes,
          }}
          refreshChallengeData={refreshChallengeData}
        />

        {
          //todo: find a better way to handle full scroll instead of mb-48
        }
        {<View className="mb-48"></View>}
      </View>
      <Modal actionSheetRef={modalEndVoteRef}>
        <Text className="text-2xl font-bold text-center text-white font-grotesque">
          Fermer les votes
        </Text>
        <Text className="text-white">
          En tant que créateur du défi, tu peux décider de fermer les votes,
          sans attendre que tous les participants aient voté.
          {"\n"}
          <Text className="font-bold">
            Attention, une fois les votes clos, les participants ne pourront
            plus voter et le défi sera terminé.
          </Text>
        </Text>
        <Button
          className="bg-purple-500 w-full font-grotesque"
          text="Confirmer"
          //todo: add validation msg and confirm
          onClick={handleEndVote}
          withLoader={true}
        />
      </Modal>
    </View>
  );
};

export default ChallengeFinalization;
