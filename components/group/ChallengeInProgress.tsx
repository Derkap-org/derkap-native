import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import PostTaken from "@/components/group/PostTaken";
// import PostNotTaken from './PostNotTaken';
import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";
// import { useUser } from '@/contexts/user-context';
import { View, ViewProps, Text } from "react-native";
import PostNotTaken from "@/components/group/PostNotTaken";
import { useSupabase } from "@/context/auth-context";
interface ChallengeInProgressProps extends ViewProps {
  group: TGroupDB | undefined;
  posts: TPostDB[] | undefined;
  fetchAllGroupData: () => Promise<void>;
  challenge: TChallengeDB;
}

const ChallengeInProgress = ({
  group,
  posts,
  challenge,
  fetchAllGroupData,
  className,
  ...props
}: ChallengeInProgressProps) => {
  const { profile } = useSupabase();
  const [isMyPostTaken, setIsMyPostTaken] = useState<boolean>(false);

  useEffect(() => {
    if (posts) {
      const myPost = posts.find((post) => post.profile_id === profile.id);
      if (myPost) setIsMyPostTaken(true);
    }
  }, [posts, profile]);

  return (
    <View {...props} className={cn("w-full", className)}>
      {isMyPostTaken ? (
        <PostTaken
          fetchAllGroupData={fetchAllGroupData}
          challenge={challenge}
          posts={posts}
          group={group}
        />
      ) : (
        <PostNotTaken
          group={group}
          posts={posts}
          challenge={challenge}
          // fetchAllGroupData={fetchAllGroupData}
        />
      )}
    </View>
  );
};

export default ChallengeInProgress;
