import { cn } from "@/lib/utils";
import Button from "@/components/Button";
import CarouselMedia from "@/components/challenge/CarouselMedia";
import {
  TPostDB,
  TVoteDB,
  TChallengeDB,
  UserVote,
  TGroupDB,
} from "@/types/types";
import { useState, useEffect, useRef } from "react";
import { View, Text, ViewProps, ScrollView } from "react-native";
import { useSupabase } from "@/context/auth-context";
import { addVote } from "@/functions/vote-action";
import Toast from "react-native-toast-message";

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

  // const [api, setApi] = useState<CarouselApi>();
  const [currentPost, setCurrentPost] = useState(0);

  const modalEndVoteRef = useRef<ActionSheetRef>(null);

  const showModalEndVote = () => modalEndVoteRef.current?.show();

  const handleVote = async () => {
    try {
      if (!selectedPost) throw new Error("Post inconnu");
      if (selectedPost.id === userVote?.postId) {
        throw new Error("Tu ne peux pas voter pour le même post");
      }
      await addVote({
        post_id: selectedPost.id,
        challenge_id: selectedPost.challenge_id,
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
        <CarouselMedia
          posts={posts}
          challengeStatus={challenge?.status}
          finalizationData={{
            setCurrentPostIndex: setCurrentPost,
            userVote: userVote,
            votes: votes,
          }}
        />
        <View className="flex flex-row items-center gap-1">
          {posts &&
            posts.map((post, index) => (
              <View
                key={index}
                className={cn(
                  "rounded-full cursor-pointer transition-all duration-300",
                  post.id === selectedPost?.id
                    ? "bg-gray-800 w-2 h-2"
                    : "bg-gray-400 w-1 h-1",
                )}
              ></View>
            ))}
        </View>

        {challenge?.status === "voting" && posts && posts.length > 0 && (
          <View className="flex flex-col w-full gap-y-2">
            <Button
              withLoader={true}
              className="w-full font-grotesque"
              text={
                userVote?.voted
                  ? `Changer mon vote pour @${selectedPost?.creator?.username}`
                  : `Voter pour @${selectedPost?.creator?.username || ""}`
              }
              isCancel={!selectedPost}
              onClick={handleVote}
            />
            {challenge?.creator_id === profile.id && (
              <Button
                text="Fermer les votes"
                //todo: add validation msg and confirm
                onClick={showModalEndVote}
              />
            )}
            <View className="flex flex-col w-full gap-1 mb-40">
              <Text className="text-xl font-grotesque">
                On attend leurs votes...
              </Text>
              <View className="flex flex-row flex-wrap w-full gap-2">
                {getWhoNotVote().map((member, index) => (
                  <Text key={index} className="">
                    {index !== 0 && ", "}@{member.profile?.username}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}
        {
          //todo: find a better way to handle full scroll instead of mb-48
        }
        {challenge?.status === "ended" && <View className="mb-48"></View>}
      </View>
      <Modal actionSheetRef={modalEndVoteRef}>
        <Text className="text-2xl font-bold">Fermer les votes</Text>
        <Text className="">
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
