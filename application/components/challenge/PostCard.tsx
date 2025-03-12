import { View, ViewProps, Text, Image } from "react-native";
import { TPostDB } from "@/types/types";
import { cn } from "@/lib/utils";

interface PostCardProps extends ViewProps {
  post: TPostDB;
}

export default function PostCard({ post, className, ...props }: PostCardProps) {
  return (
    <View
      className={cn(
        "flex flex-col items-center justify-center w-full my-2",
        className,
      )}
      {...props}
    >
      <Image
        src={post.base64img}
        className={cn(
          "w-full aspect-[4/5]",
          //   challengeStatus === "voting" &&
          //     post.id === userVote?.postId &&
          //     "border-4 border-green-500",
          //   challengeStatus === "ended" &&
          //     isPostHasMoreVotes(post.id) &&
          //     "border-4 border-yellow-500",
        )}
      />
    </View>
  );
}
