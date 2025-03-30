import { cn } from "@/lib/utils";
import Capture from "@/components/new-derkap/Capture";
import { TChallengeDB, TGroupDB, TPostDB } from "@/types/types";

import { View, ViewProps, ActivityIndicator } from "react-native";

interface PostNotTakenProps extends ViewProps {
  posts: TPostDB[] | undefined;
  refreshChallengeData: () => Promise<void>;
  challenge: TChallengeDB;
  group: TGroupDB;
  isLoading: boolean;
}

const PostNotTaken = ({
  className,
  posts,
  challenge,
  group,
  refreshChallengeData,
  isLoading,
  ...props
}: PostNotTakenProps) => {
  if (isLoading) {
    return (
      <View className="flex flex-col gap-y-1">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View {...props} className={cn("", className)}>
      <Capture
        refreshChallengeData={refreshChallengeData}
        challenge={challenge}
      />
    </View>
  );
};

export default PostNotTaken;
