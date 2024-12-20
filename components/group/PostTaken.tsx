import { cn } from "@/lib/utils";
import { TPostDB, TGroupDB, TChallengeDB } from "@/types/types";
// import { useUser } from '@/contexts/user-context';
// import Button from '../Button';
// import DrawerComponent from '@/components/DrawerComponent';
import { useState, useRef } from "react";
// import { setChallengeToVoting } from '@/functions/challenge-action';
// import { toast } from 'sonner';
// import CarouselComponent from '../CarousselComponent';
// import { CarouselItem } from '../ui/carousel';
import Image, { View, Text, StyleSheet } from "react-native";
import Button from "../Button";
// import { Separator } from '@radix-ui/react-separator';
import CarouselMedia from "@/components/group/CarouselMedia";
import { BlurView } from "expo-blur";
import { useSupabase } from "@/context/auth-context";
import { setChallengeToVoting } from "@/functions/challenge-action";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import React from "react";

interface PostTakenProps {
  posts: TPostDB[] | undefined;
  group: TGroupDB | undefined;
  challenge: TChallengeDB;
  fetchAllGroupData: () => Promise<void>;
  className?: string;
}

const PostTaken = ({
  className,
  posts,
  challenge,
  group,
  fetchAllGroupData,
  ...props
}: PostTakenProps) => {
  const { profile } = useSupabase();
  const [isGoVoteOpen, setIsGoVoteOpen] = useState<boolean>(false);

  const modalGoVoteRef = useRef<SwipeModalPublicMethods>(null);

  const showModalGoVote = () => modalGoVoteRef.current?.show();

  const handleGoVote = async () => {
    try {
      if (!challenge) return console.error("Challenge inconnu");
      await setChallengeToVoting({ challenge_id: challenge.id });
    } catch (error) {
      console.error("Erreur lors du passage aux votes");
    } finally {
      modalGoVoteRef.current?.hide();
      await fetchAllGroupData();
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
      <View className="w-full flex flex-col gap-4 rounded-2xl">
        <View
          {...props}
          className={cn(
            " w-full rounded-2xl flex items-center justify-center flex-col text-white gap-y-4",
            className,
          )}
        >
          <View className="w-full relative rounded-2xl">
            {/* <CarouselComponent>
      {posts?.map((post, index) => (
        <CarouselItem key={index}>
          <Image
            src={post.img_url}
            alt="post"
            width={300}
            height={300}
            className="blur-2xl w-full object-cover aspect-image rounded-xl"
          />
        </CarouselItem>
      ))}
    </CarouselComponent> */}
            <CarouselMedia
              posts={posts}
              groupLength={group.members.length}
              challengeStatus="posting"
            />
            <View className="absolute flex flex-col w-full h-full gap-4 font-grotesque rounded-2xl overflow-hidden">
              <BlurView
                intensity={80}
                tint="light"
                className="flex flex-col w-full h-full items-center justify-center text-center"
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

        <View className="w-full flex flex-col gap-4">
          <Text className="text-xl font-grotesque">Toujours en retard...</Text>
          <View className="w-full flex flex-col gap-2">
            {getWhoNotPost().map((member, index) => (
              <Text key={index} className="">
                @{member.profile?.username}
              </Text>
            ))}
          </View>
        </View>

        {challenge?.creator_id === profile.id && (
          <Button
            text="Passer aux votes"
            className="w-full font-grotesque"
            //todo: add confirmation before go
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
        <View className="flex flex-col px-10 justify-between items-center bg-white gap-y-4">
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
            className="bg-purple-500 w-full font-grotesque"
            text="Confirmer"
            //todo: add validation msg and confirm
            onClick={() => {
              handleGoVote();
            }}
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
