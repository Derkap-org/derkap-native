import {
  Dimensions,
  Image,
  Text,
  View,
  ViewProps,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { TPostDB, UserVote, TVoteDB, TCommentDB } from "@/types/types";
import { cn } from "@/lib/utils";
import { BlurView } from "expo-blur";
import { useEffect, useState, useRef } from "react";
import { Pressable, TextInput } from "react-native";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import { createComment, getCommentsFromDB } from "@/functions/comments-action";
import Toast from "react-native-toast-message";
import Button from "../Button";
import { Comment } from "@/components/comment/Comment";
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
  const [comments, setComments] = useState<Record<number, TCommentDB[]>>({}); // { post_id: [comment1, comment2, ...] }
  const [sortedPosts, setSortedPosts] = useState<TPostDB[]>();
  const width = Dimensions.get("window").width;
  const [newComment, setNewComment] = useState("");
  const { setCurrentPostIndex, userVote, votes } = finalizationData || {};
  const [postingComment, setPostingComment] = useState(false);
  const [activePostId, setActivePostId] = useState<number>(0);
  const modalCommentRef = useRef<ActionSheetRef>(null);

  const fetchAllComments = async () => {
    if (!sortedPosts) return;
    for (const post of sortedPosts) {
      await fetchComments({ post_id: post.id });
    }
  };

  useEffect(() => {
    fetchAllComments();
  }, [sortedPosts]);

  useEffect(() => {
    if (sortedPosts?.length) {
      setActivePostId(sortedPosts[0].id);
    }
  }, [sortedPosts]);

  const fetchComments = async ({ post_id }: { post_id: number }) => {
    try {
      const comments = await getCommentsFromDB({ post_id });
      setComments((prev) => ({ ...prev, [post_id]: comments }));
    } catch (error) {
      Toast.show({
        text1: "Erreur lors de la récupération des commentaires",
        type: "error",
      });
    }
  };

  const handleCreateComment = async () => {
    if (!newComment) return;
    try {
      setPostingComment(true);
      await createComment({
        post_id: activePostId,
        content: newComment,
      });
      setNewComment("");
      await fetchComments({ post_id: activePostId });
    } catch (error) {
      Toast.show({
        text1: "Erreur lors de la création du commentaire",
        type: "error",
      });
    } finally {
      setPostingComment(false);
    }
  };

  const openModalComment = async () => {
    await fetchComments({ post_id: activePostId });
    modalCommentRef.current?.show();
  };

  const handleSnapToItem = (index: number) => {
    if (setCurrentPostIndex) {
      setCurrentPostIndex(index);
    }
  };

  const getVoteCount = ({ postId }: { postId: number }) => {
    if (!votes) return 0;
    return votes.filter((vote) => vote.post_id === postId).length;
  };

  useEffect(() => {
    if (!posts) return;
    if (challengeStatus !== "ended") {
      setSortedPosts(posts);
      return;
    }
    const sorted = [...posts].sort((a, b) => {
      const votesA = getVoteCount({ postId: a.id });
      const votesB = getVoteCount({ postId: b.id });
      return votesB - votesA;
    });
    setSortedPosts(sorted);
  }, [challengeStatus, posts, votes]);

  const isPostHasMoreVotes = (postId: number) => {
    if (!sortedPosts) return false;
    const highestVotes = Math.max(
      ...sortedPosts.map((post) => getVoteCount({ postId: post.id })),
    );
    return getVoteCount({ postId: postId }) === highestVotes;
  };

  if (!sortedPosts)
    return (
      <View className="flex h-[34rem] w-full">
        <View className="bg-black/50 flex items-center justify-center w-full h-full rounded-2xl ">
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );

  return (
    <View className="w-full relative rounded-2xl">
      <View className={cn("flex flex-col", className)}>
        <Carousel
          loop={false}
          style={{ width: "100%", borderRadius: "1rem" }}
          // width={width}
          width={width - 28}
          height={width * (5 / 4)}
          autoPlay={false}
          data={sortedPosts}
          scrollAnimationDuration={400}
          onSnapToItem={(index) => {
            handleSnapToItem(index);
            setActivePostId(sortedPosts[index].id);
          }}
          renderItem={({ item: post, index }) => (
            <View className="flex-1 rounded-2xl gap-y-2 relative">
              <Image
                src={post.base64img}
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
                <View className="flex flex-row w-full justify-between absolute bottom-0 rounded-b-2xl py-1 px-4 bg-black/30">
                  <Text className="font-grotesque text-white">
                    {post.creator?.username}
                    {post.caption && ` : ${post.caption}`}
                  </Text>

                  <Text className="font-grotesque text-white">
                    {getVoteCount({ postId: post.id })} 🏆
                  </Text>
                </View>
              )}
            </View>
          )}
        />
        <View className="flex flex-row justify-end px-4 my-2">
          <Pressable onPress={openModalComment}>
            <Text className="">
              {comments[activePostId]?.length || 0} commentaires
            </Text>
          </Pressable>
        </View>
      </View>
      {challengeStatus === "posting" && (
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
              {sortedPosts?.length} / {groupLength || 0}
            </Text>
          </BlurView>
        </View>
      )}
      <Modal fullScreen={true} actionSheetRef={modalCommentRef}>
        <View className="flex flex-col h-full">
          <Text className="text-2xl font-bold font-grotesque text-center py-4">
            Commentaires
          </Text>
          <ScrollView className="flex-1 flex-col gap-y-2 px-10">
            {comments[activePostId]?.length > 0 ? (
              comments[activePostId]?.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  refreshComments={() =>
                    fetchComments({ post_id: activePostId })
                  }
                />
              ))
            ) : (
              <Text className="text-center text-gray-500">
                Aucun commentaire pour le moment
              </Text>
            )}
          </ScrollView>
          <View className="flex flex-row gap-x-2 px-4 py-4 justify-center items-center">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              className="w-8/12 p-2 border border-gray-300 rounded-xl"
              placeholder="Ajouter un commentaire"
            />
            <Button
              className="w-4/12 p-0 bg-custom-primary rounded-xl"
              isCancel={postingComment}
              text="Envoyer"
              onClick={handleCreateComment}
              withLoader={true}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
