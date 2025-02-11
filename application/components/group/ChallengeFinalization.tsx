import { cn } from "@/lib/utils";
import Button from "@/components/Button";
// import CarouselComponent from '@/components/CarousselComponent';
// import { CarouselApi, CarouselItem } from '@/components/ui/carousel';
import CarouselMedia from "@/components/group/CarouselMedia";
import {
  TPostDB,
  TVoteDB,
  TChallengeDB,
  UserVote,
  TGroupDB,
} from "@/types/types";
import { useState, useEffect, useRef } from "react";
import { Image, View, Text, ViewProps, Pressable } from "react-native";
import { useSupabase } from "@/context/auth-context";
import { getVotes, addVote } from "@/functions/vote-action";
import Toast from "react-native-toast-message";
// import { useUser } from '@/contexts/user-context';
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import { setChallengeToEnd } from "@/functions/challenge-action";
import React from "react";

interface ChallengeFinalizationProps extends ViewProps {
  posts: TPostDB[];
  fetchAllGroupData: () => Promise<void>;
  challenge: TChallengeDB;
  group: TGroupDB;
}

const ChallengeFinalization = ({
  posts,
  group,
  challenge,
  fetchAllGroupData,
  className,
  ...props
}: ChallengeFinalizationProps) => {
  const { profile } = useSupabase();
  const [selectedPost, setSelectedPost] = useState<TPostDB | null>(null);
  const [votes, setVotes] = useState<TVoteDB[]>([]);
  const [userVote, setUserVote] = useState<UserVote>(); // null

  // const [api, setApi] = useState<CarouselApi>();
  const [currentPost, setCurrentPost] = useState(0);

  const modalEndVoteRef = useRef<SwipeModalPublicMethods>(null);

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
      console.error("Erreur lors du vote: ", error?.message);
      Toast.show({
        type: "error",
        text1: "Erreur lors du vote",
        text2: error?.message || "Une erreur est survenue",
      });
    } finally {
      await fetchAllGroupData();
      await fetchVotes();
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
      await fetchAllGroupData();
      await fetchVotes();
    }
  };

  const fetchVotes = async () => {
    try {
      if (!challenge) return;
      const votes = await getVotes({
        challenge_id: challenge.id,
      });
      setVotes(votes || []);
      const userVote = votes?.find((vote) => vote.user_id === profile.id);
      setUserVote({
        voted: !!userVote,
        postId: userVote?.post_id,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la récupération des votes",
        text2: error?.message || "Une erreur est survenue",
      });
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
    fetchVotes();
  }, []);

  // useEffect(() => {
  //   if (challenge?.status === 'ended') {
  //     const highestVotedPost = getPostWithMostVotes();
  //     if (highestVotedPost && api) {
  //       const postIndex = posts.findIndex(
  //         post => post.id === highestVotedPost.id,
  //       );
  //       if (postIndex !== -1) {
  //         setCurrentPost(postIndex + 1);
  //         api.scrollTo(postIndex);
  //       }
  //     }
  //   }
  // }, [challenge, posts, api, votes]);

  // useEffect(() => {
  //   if (!api) {
  //     return;
  //   }
  //   setCurrentPost(api.selectedScrollSnap() + 1);
  //   api.on('select', () => {
  //     setCurrentPost(api.selectedScrollSnap() + 1);
  //   });
  // }, [api]);

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
        {challenge?.status === "ended" && (
          <Text className="font-grotesque text-xl">
            Défi terminé ! Check les résultats:
          </Text>
        )}
        {/* <CarouselComponent setApi={setApi}>
      {posts.map((post, index) => (
        <CarouselItem onClick={() => setSelectedPost(post)} key={index}>
          <Image
            className={cn(
              'rounded-xl w-full object-cover max-h-[510px] aspect-image',
              challenge?.status === 'voting' &&
                post.id === userVote?.postId &&
                'border-4 border-green-500',
              challenge?.status === 'ended' &&
                isPostHasMoreVotes(post.id) &&
                'border-4 border-yellow-500',
            )}
            src={post.img_url}
            alt="post"
            width={300}
            height={300}
          />
          <View className="flex w-full justify-between">
            <Text className="font-grotesque">@{post.creator?.username}</Text>
            <Text className="font-grotesque">{getVoteCount(post.id)} vote(s)</Text>
          </View>
        </CarouselItem>
      ))}
    </CarouselComponent> */}
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
            <View className="flex flex-col w-full gap-1 mb-28">
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
      </View>
      <SwipeModal
        ref={modalEndVoteRef}
        showBar
        maxHeight={400}
        bg="white"
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col px-10 justify-between items-center bg-white gap-y-4">
          <Text className="text-2xl font-bold">Fermer les votes</Text>
          <Text className="text-xs">
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
        </View>
      </SwipeModal>
    </View>
  );
};

export default ChallengeFinalization;
