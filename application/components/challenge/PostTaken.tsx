import { cn } from "@/lib/utils";
import { TPostDB, TGroupDB, TChallengeDB } from "@/types/types";
import { useRef } from "react";
import { View, Text } from "react-native";
import Button from "../Button";
import CarouselMedia from "@/components/challenge/CarouselMedia";
import { BlurView } from "expo-blur";
import { useSupabase } from "@/context/auth-context";
import { setChallengeToVoting } from "@/functions/challenge-action";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import React from "react";
import Toast from "react-native-toast-message";

interface PostTakenProps {
  posts: TPostDB[] | undefined;
  group: TGroupDB | undefined;
  challenge: TChallengeDB;
  refreshChallengeData: () => Promise<void>;
  className?: string;
}

const PostTaken = ({
  className,
  posts,
  challenge,
  group,
  refreshChallengeData,
  ...props
}: PostTakenProps) => {
  const { profile } = useSupabase();

  const modalGoVoteRef = useRef<SwipeModalPublicMethods>(null);

  const showModalGoVote = () => modalGoVoteRef.current?.show();

  const handleGoVote = async () => {
    try {
      if (!challenge) throw new Error("Pas de challenge");
      await setChallengeToVoting({ challenge_id: challenge.id });
    } catch (error) {
      Toast.show({
        type: "Erreur lors du passage aux votes",
        text1: error?.message || "Erreur lors du passage aux votes",
      });
    } finally {
      modalGoVoteRef.current?.hide();
      await refreshChallengeData();
    }
  };

  const getWhoNotPost = () => {
    if (!group || !posts) return [];
    const groupMembers = group.members;
    const postsProfiles = posts.map((post) => post.profile_id);
    return groupMembers.filter(
      (member) => !postsProfiles.includes(member.profile?.id ?? ""),
    );
  };

  return (
    <>
      <View className="flex flex-col w-full gap-4 rounded-2xl">
        <View
          {...props}
          className={cn(
            " w-full rounded-2xl flex items-center justify-center flex-col text-white gap-y-4",
            className,
          )}
        >
          <View className="relative w-full rounded-2xl">
            {/* <CarouselComponent>
      {posts?.map((post, index) => (
        <CarouselItem key={index}>
          <Image
            src={post.img_url}
            alt="post"
            width={300}
            height={300}
            className="object-cover w-full blur-2xl aspect-image rounded-xl"
          />
        </CarouselItem>
      ))}
    </CarouselComponent> */}
            <CarouselMedia
              posts={posts}
              groupLength={group.members.length}
              challengeStatus="posting"
            />
            <View className="absolute flex flex-col w-full h-full gap-4 overflow-hidden font-grotesque rounded-2xl">
              <BlurView
                intensity={80}
                tint="light"
                className="flex flex-col items-center justify-center w-full h-full text-center"
              >
                <Text className="text-xl w-fit">
                  En attente de tous les participants !
                </Text>
                <Text className="text-4xl w-fit">
                  {posts?.length} / {group?.members?.length}
                </Text>
              </BlurView>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full gap-1">
          <Text className="text-xl font-grotesque">Toujours en retard...</Text>
          <View className="flex flex-row flex-wrap w-full gap-2">
            {getWhoNotPost().map((member, index) => (
              <Text key={index} className="">
                {index !== 0 && ", "}@{member.profile?.username}
              </Text>
            ))}
          </View>
        </View>

        {challenge?.creator_id === profile.id && (
          <Button
            text="Passer aux votes"
            className="w-full font-grotesque mb-40"
            onClick={() => {
              showModalGoVote();
            }}
          />
        )}
      </View>
      <SwipeModal
        ref={modalGoVoteRef}
        showBar
        maxHeight={400}
        bg="white"
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col items-center justify-between px-10 bg-white gap-y-4">
          <Text className="text-2xl font-bold">Passer aux votes</Text>
          <Text className="text-xs">
            En tant que créateur du défi, tu peux décider de passer aux votes,
            sans attendre que tous les participants aient posté leur Derkap.
            {"\n"}
            <Text className="font-bold">
              Attention, une fois les votes lancés, les participants ne pourront
              plus poster leur Derkap.
            </Text>
          </Text>
          <Button
            className="w-full bg-purple-500 font-grotesque"
            text="Confirmer"
            onClick={handleGoVote}
            withLoader={true}
          />
        </View>
      </SwipeModal>
    </>
  );
};

export default PostTaken;

// const styles = StyleSheet.create({
//   blurView: {
//     borderRadius: 20,
//   },
// });
