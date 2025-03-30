import { TPostDB, TGroupDB, TChallengeDB } from "@/types/types";
import { useRef, useState, useEffect } from "react";
import { View, Text, Image } from "react-native";
import Button from "../Button";
import { useSupabase } from "@/context/auth-context";
import { setChallengeToVoting } from "@/functions/challenge-action";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
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
  const [myPost, setMyPost] = useState<TPostDB | null>(null);

  const { profile } = useSupabase();

  useEffect(() => {
    if (posts) {
      const myPost = posts.find((post) => post.profile_id === profile.id);
      if (myPost) {
        setMyPost(myPost);
      }
    }
  }, [posts, profile, challenge]);

  const modalGoVoteRef = useRef<ActionSheetRef>(null);

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
        <View className="flex gap-x-2 flex-row justify-center items-center px-4">
          <View className="w-1/2">
            <Image
              src={myPost?.base64img}
              className="w-full aspect-[4/5] rounded-xl"
            />
          </View>

          <View className="w-1/2 flex gap-4 flex-col items-center justify-center">
            <Text className="text-xl text-center font-grotesque text-white">
              On attend encore tes potes !
            </Text>
            <Text className="text-6xl text-center font-grotesque text-white">
              {posts?.length} / {group?.members?.length}
            </Text>
            {challenge.creator.id !== profile.id && (
              <Text className="text-xs text-center text-gray-300">
                Seul le créateur du défi peut passer aux votes
              </Text>
            )}
            <Button
              text="Passer aux votes"
              className="w-full font-grotesque px-2 py-1"
              onClick={() => {
                showModalGoVote();
              }}
              isCancel={challenge.creator.id !== profile.id}
            />
          </View>
        </View>

        <View className="flex flex-col items-center justify-center w-full gap-1">
          <Text className="text-2xl font-grotesque text-white">
            Toujours en retard...
          </Text>
          <View className="flex flex-row items-center justify-center flex-wrap w-full gap-2 px-4">
            {getWhoNotPost().map((member, index) => (
              <View key={index} className="flex flex-row items-center gap-x-2">
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
      </View>
      <Modal actionSheetRef={modalGoVoteRef}>
        <Text className="text-2xl font-bold font-grotesque text-center text-white">
          Passer aux votes
        </Text>
        <Text className="text-white">
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
      </Modal>
    </>
  );
};

export default PostTaken;

// const styles = StyleSheet.create({
//   blurView: {
//     borderRadius: 20,
//   },
// });
