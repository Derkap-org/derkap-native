import { ScrollView } from "react-native";

import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";
import ChallengeInProgress from "@/components/challenge/ChallengeInProgress";
import ChallengeFinalization from "@/components/challenge/ChallengeFinalization";

interface ChallengeStepsProps {
  refreshChallengeData: () => Promise<void>;
  group: TGroupDB | undefined;
  challenge: TChallengeDB | undefined;
  posts: TPostDB[] | undefined;
}

export default function ChallengeSteps({
  refreshChallengeData,
  group,
  challenge,
  posts,
}: ChallengeStepsProps) {
  return (
    <>
      <ScrollView className="flex flex-col px-4 my-2 min-h-full">
        {challenge?.status === "posting" && (
          <ChallengeInProgress
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
            // setIsCreateChallengeOpen={setIsCreateChallengeOpen}
          />
        )}
      </ScrollView>
    </>
  );
}
