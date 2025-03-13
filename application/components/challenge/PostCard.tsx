import {
  View,
  ViewProps,
  Text,
  Image,
  ScrollView,
  TextInput,
  Keyboard,
  Pressable,
  Animated,
} from "react-native";
import {
  TPostDB,
  TChallengeStatus,
  UserVote,
  TCommentDB,
  TVoteDB,
} from "@/types/types";
import { cn } from "@/lib/utils";
import Button from "../Button";
import { ActionSheetRef } from "react-native-actions-sheet";
import { useRef, useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Comment } from "@/components/comment/Comment";
import Toast from "react-native-toast-message";
import { createComment, getCommentsFromDB } from "@/functions/comments-action";
import { TapGestureHandler, State } from "react-native-gesture-handler";

interface PostCardProps extends ViewProps {
  post: TPostDB;
  handleVote: (post: TPostDB) => Promise<void>;
  challengeStatus: TChallengeStatus;
  userVote: UserVote | null;
  votes: TVoteDB[];
}

export default function PostCard({
  post,
  handleVote,
  challengeStatus,
  userVote,
  votes,
  className,
  ...props
}: PostCardProps) {
  const [comments, setComments] = useState<TCommentDB[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const modalCommentRef = useRef<ActionSheetRef>(null);
  const [showHeart, setShowHeart] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;

  const handleFetchComments = async () => {
    const comments = await getCommentsFromDB({ post_id: post.id });
    setComments(comments);
  };

  useEffect(() => {
    handleFetchComments();
  }, []);

  const animateHeart = () => {
    setShowHeart(true);
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHeart(false);
    });
  };

  const handleDoubleTap = async () => {
    if (challengeStatus === "voting") {
      animateHeart();
      await handleVote(post);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment) return;
    Keyboard.dismiss();
    try {
      setPostingComment(true);
      await createComment({
        post_id: post.id,
        content: newComment,
      });
      await handleFetchComments();
      setNewComment("");
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
    await handleFetchComments();
    modalCommentRef.current?.show();
  };

  const getVoteCount = ({ postId }: { postId: number }) => {
    if (!votes) return 0;
    return votes.filter((vote) => vote.post_id === postId).length;
  };

  const isPostHasMoreVotes = (postId: number) => {
    if (!votes) return true;
    const highestVotes = Math.max(
      ...votes.map((vote) => getVoteCount({ postId: vote.post_id })),
    );
    return getVoteCount({ postId: postId }) === highestVotes;
  };

  return (
    <View
      className={cn(
        "flex flex-col items-center justify-center w-full my-4",
        className,
      )}
      {...props}
    >
      <View className="flex flex-row items-center justify-between w-full p-2">
        <View className="flex flex-row items-center gap-x-2">
          <View className={`rounded-full overflow-hidden`}>
            {post.creator.avatar_url ? (
              <Image
                source={{
                  uri: `${post.creator.avatar_url}?t=${new Date().getTime()}`,
                }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-10 h-10 bg-black rounded-full">
                <Text className="text-sm text-gray-300">
                  {post.creator.username?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-lg font-bold text-white">
            {post.creator.username}
          </Text>
        </View>
        {challengeStatus === "voting" && (
          <Button
            onClick={async () => {
              await handleVote(post);
            }}
            withLoader={true}
            color={
              userVote?.voted && userVote.postId === post.id
                ? "gray"
                : "primary"
            }
            text={
              userVote?.voted && userVote.postId === post.id ? "Voté" : "Voter"
            }
            className="w-fit px-2 py-1"
            textClassName="text-md"
          />
        )}
        {challengeStatus === "ended" && (
          <View className="flex flex-row items-center gap-x-2">
            <Text className="text-center font-grotesque text-white text-xl">
              {getVoteCount({ postId: post.id })} 🏆
            </Text>
            <View
              className={cn(
                "rounded px-2 py-1  w-fit",
                isPostHasMoreVotes(post.id)
                  ? "bg-orange-300"
                  : "bg-neutral-600",
              )}
            >
              <Text className="text-center font-grotesque text-zinc-800 text-xl">
                {isPostHasMoreVotes(post.id) ? "Gagné" : "Perdu"}
              </Text>
            </View>
          </View>
        )}
      </View>
      <View className="w-full aspect-[4/5] relative">
        {post.caption && (
          <View className="absolute bottom-0 left-0 right-0 z-10 p-4 flex-row items-start justify-between">
            <View className="w-full p-4 bg-zinc-800/80 rounded-xl">
              <Text className="text-white text-center font-grotesque">
                {post.caption}
              </Text>
            </View>
          </View>
        )}
        {showHeart && (
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 20,
              transform: [{ scale: heartScale }],
            }}
          >
            <Text className="text-9xl font-bold text-white">🏆</Text>
          </Animated.View>
        )}
        <TapGestureHandler
          numberOfTaps={2}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.ACTIVE) {
              handleDoubleTap();
            }
          }}
        >
          <Image
            src={post.base64img}
            className={cn(
              "w-full h-full",
              //   challengeStatus === "voting" &&
              //     post.id === userVote?.postId &&
              //     "border-4 border-green-500",
              //   challengeStatus === "ended" &&
              //     isPostHasMoreVotes(post.id) &&
              //     "border-4 border-yellow-500",
            )}
          />
        </TapGestureHandler>
      </View>
      <View className="w-full flex flex-row items-center justify-end px-4 mt-2">
        <Pressable onPress={openModalComment}>
          <Text className="text-white font-grotesque">
            {comments?.length || 0} commentaires
          </Text>
        </Pressable>
      </View>
      <Modal fullScreen={true} actionSheetRef={modalCommentRef}>
        <View className="flex flex-col h-full">
          <Text className="text-2xl font-bold font-grotesque text-center py-4 text-white">
            Commentaires
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className="flex-1 flex-col gap-y-2"
          >
            {comments?.length > 0 ? (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  refreshComments={handleFetchComments}
                />
              ))
            ) : (
              <Text className="text-center text-gray-500">
                Aucun commentaire pour le moment
              </Text>
            )}
          </ScrollView>
          <View className="flex flex-col gap-y-2 px-4 py-4 justify-center items-center">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              className="w-full p-2 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl"
              placeholder="Ajouter un commentaire"
            />
            <Button
              className="w-full rounded-xl"
              isCancel={
                postingComment || !newComment || newComment.length === 0
              }
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
