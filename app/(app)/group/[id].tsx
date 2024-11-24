import { Text, Pressable, View } from "react-native";
import React, { useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import GroupHeader from "@/components/group/GroupHeader";
import ChallengeBox from "@/components/ChallengeBox";
import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";
import ChallengeInProgress from "@/components/group/ChallengeInProgress";
import ChallengeFinalization from "@/components/group/ChallengeFinalization";
export default function Group() {
  const mockedChallenge: TChallengeDB = {
    created_at: "",
    id: 1,
    creator: {
      avatar_url: "",
      created_at: "",
      email: "",
      id: "1",
      username: "Nicoalz",
    },
    creator_id: "1",
    description: "Description du défi",
    group_id: 1,
    status: "ended",
  };

  const mockedPosts: TPostDB[] = [
    {
      challenge_id: 1,
      created_at: "",
      creator: {
        avatar_url: "",
        created_at: "",
        email: "",
        id: "1",
        username: "Nicoalz",
      },
      id: 1,
      img_url: "https://picsum.photos/id/237/200/300",
      file_name: "mocked",
      profile_id: "1",
    },
    {
      challenge_id: 1,
      created_at: "",
      creator: {
        avatar_url: "",
        created_at: "",
        email: "",
        id: "1",
        username: "Nicoalz",
      },
      id: 2,
      img_url: "https://picsum.photos/id/237/200/300",
      file_name: "mocked",
      profile_id: "1",
    },
  ];

  const [currentGroup, setCurrentGroup] = useState<TGroupDB>();
  const [currentChallenge, setCurrentChallenge] =
    useState<TChallengeDB>(mockedChallenge);
  const [currentPosts, setCurrentPosts] = useState<TPostDB[]>(mockedPosts);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] =
    useState<boolean>(false); // todo: add new challenge
  const { id } = useLocalSearchParams() as { id: string };
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <GroupHeader group_id={id} />
      <View className="flex-1 p-4 gap-y-4 ">
        <ChallengeBox challenge={currentChallenge} />
        {currentChallenge?.status === "posting" && (
          <ChallengeInProgress
            challenge={currentChallenge}
            group={currentGroup}
            posts={currentPosts}
            // fetchAllGroupData={fetchAllGroupData}
          />
        )}
        {(currentChallenge?.status === "voting" ||
          currentChallenge?.status === "ended") && (
          <ChallengeFinalization
            posts={currentPosts}
            challenge={currentChallenge}
            // fetchAllGroupData={fetchAllGroupData}
            setIsCreateChallengeOpen={setIsCreateChallengeOpen}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
