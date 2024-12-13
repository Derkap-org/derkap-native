import { Dimensions, Image, Text, View, ViewProps } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { TPostDB, UserVote, TVoteDB } from "@/types/types";
import { cn } from "@/lib/utils";
import { BlurView } from "expo-blur";
interface CarouselMediaProps extends ViewProps {
  posts: TPostDB[];
  finalizationData?: {
    setCurrentPostIndex: React.Dispatch<React.SetStateAction<number>>;
    userVote: UserVote;
    votes: TVoteDB[];
  };
  groupLength?: number;
  challengeStatus: "posting" | "voting" | "ended";
}

export default function CarouselMedia({
  posts,
  finalizationData,
  groupLength,
  challengeStatus,
  className,
  ...props
}: CarouselMediaProps) {
  const width = Dimensions.get("window").width;
  const { setCurrentPostIndex, userVote, votes } = finalizationData || {};
  const handleSnapToItem = (index: number) => {
    if (setCurrentPostIndex) {
      setCurrentPostIndex(index);
    }
  };

  const getVoteCount = ({ postId }: { postId: number }) => {
    if (!votes) return 0;
    return votes.filter((vote) => vote.post_id === postId).length;
  };

  // used to scroll to the post with the most votes
  // const getPostWithMostVotes = () => {
  //   const postsWithVotes = posts.map((post) => ({
  //     ...post,
  //     voteCount: getVoteCount({ postId: post.id }),
  //   }));
  //   const highestVotes = Math.max(
  //     ...postsWithVotes.map((post) => post.voteCount),
  //   );
  //   return postsWithVotes.find((post) => post.voteCount === highestVotes);
  // };

  const isPostHasMoreVotes = (postId: number) => {
    const postsWithVotesCount = posts.map((post) => ({
      ...post,
      votes: getVoteCount({ postId: post.id }),
    }));
    const highestPostVotes = Math.max(
      ...postsWithVotesCount.map((post) => post.votes),
    );
    return postsWithVotesCount.find(
      (post) => post.id === postId && post.votes === highestPostVotes,
    );
  };

  return (
    <View className="w-full relative rounded-2xl">
      <View className={cn("flex flex-row", className)}>
        <Carousel
          loop={false}
          style={{ width: "100%", borderRadius: "1rem" }}
          // width={width}
          width={width - 28}
          height={width * (5 / 4)}
          autoPlay={false}
          data={posts}
          scrollAnimationDuration={400}
          onSnapToItem={(index) => handleSnapToItem(index)}
          renderItem={({ item: post, index }) => (
            <View className="flex-1 rounded-2xl gap-y-2 relative">
              <Image
                src={post.img_url}
                className={cn(
                  "flex-1 rounded-2xl",
                  challengeStatus === "voting" &&
                    post.id === userVote?.postId &&
                    "border-4 border-green-500",
                  challengeStatus === "ended" &&
                    isPostHasMoreVotes(post.id) &&
                    "border-4 border-yellow-500",
                )}
              />

              {finalizationData && (
                <View className="flex flex-row w-full justify-between absolute bottom-1 px-4">
                  <Text className="font-champ">@{post.creator?.username}</Text>
                  <Text className="font-champ">
                    {getVoteCount({ postId: post.id })} vote(s)
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      </View>
      {challengeStatus === "posting" && (
        <View className="absolute flex flex-col w-full h-full gap-4 font-champ rounded-2xl overflow-hidden">
          <BlurView
            intensity={80}
            tint="light"
            className="flex flex-col w-full h-full items-center justify-center text-center"
          >
            <Text className="text-xl w-fit">
              En attente de tous les participants !
            </Text>
            <Text className="text-4xl w-fit">
              {posts?.length} / {groupLength || 0}
            </Text>
          </BlurView>
        </View>
      )}
    </View>
  );
}
