import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import PostTaken from "@/components/challenge/PostTaken";

import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";

import { View, ViewProps } from "react-native";
import PostNotTaken from "@/components/challenge/PostNotTaken";
import { useSupabase } from "@/context/auth-context";
interface ChallengeInProgressProps extends ViewProps {
  group: TGroupDB | undefined;
  posts: TPostDB[] | undefined;
  refreshChallengeData: () => Promise<void>;
  challenge: TChallengeDB;
}

const ChallengeInProgress = ({
  group,
  posts,
  challenge,
  refreshChallengeData,
  className,
  ...props
}: ChallengeInProgressProps) => {
  const { profile } = useSupabase();
  const [isMyPostTaken, setIsMyPostTaken] = useState<boolean>(false);

  useEffect(() => {
    if (posts) {
      const myPost = posts.find((post) => post.profile_id === profile.id);
      if (myPost) {
        setIsMyPostTaken(true);
      } else {
        setIsMyPostTaken(false);
      }
    }
  }, [posts, profile, challenge]);

  return (
    <View {...props} className={cn("w-full mb-48", className)}>
      {isMyPostTaken ? (
        <PostTaken
          refreshChallengeData={refreshChallengeData}
          challenge={challenge}
          posts={posts}
          group={group}
        />
      ) : (
        <PostNotTaken
          group={group}
          posts={posts}
          challenge={challenge}
          refreshChallengeData={refreshChallengeData}
        />
      )}
    </View>
  );
};

export default ChallengeInProgress;
