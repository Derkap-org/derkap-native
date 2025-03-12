import { ScrollView } from "react-native";
import React from "react";
import { TChallengeDB, TGroupDB, TPostDB, TVoteDB } from "@/types/types";
import ChallengeInProgress from "@/components/challenge/ChallengeInProgress";
import ChallengeFinalization from "@/components/challenge/ChallengeFinalization";

interface ChallengeStepsProps {
  refreshChallengeData: () => Promise<void>;
  group: TGroupDB | undefined;
  challenge: TChallengeDB | undefined;
  posts: TPostDB[] | undefined;
  votes: TVoteDB[] | undefined;
  isLoading: boolean;
}

export default function ChallengeSteps({
  refreshChallengeData,
  group,
  challenge,
  posts,
  votes,
  isLoading,
}: ChallengeStepsProps) {
  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="always"
        className="flex flex-col my-2 min-h-full"
      >
        {challenge?.status === "posting" && (
          <ChallengeInProgress
            isLoading={isLoading}
            challenge={challenge}
            group={group}
            posts={posts}
            refreshChallengeData={refreshChallengeData}
          />
        )}

        {(challenge?.status === "voting" || challenge?.status === "ended") && (
          <ChallengeFinalization
            group={group}
            posts={posts}
            challenge={challenge}
            refreshChallengeData={refreshChallengeData}
            votes={votes}
          />
        )}
      </ScrollView>
    </>
  );
}
