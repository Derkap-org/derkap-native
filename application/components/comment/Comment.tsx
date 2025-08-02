import { TCommentDB } from "@/types/types";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useRef } from "react";
import { deleteComment } from "@/functions/comments-action";
import Toast from "react-native-toast-message";
import { Modal } from "@/components/modals/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import Button from "@/components/Button";
import React from "react";
import ProfilePicture from "../ProfilePicture";
import { reportContent } from "@/functions/reporting-action";
interface CommentProps {
  comment: TCommentDB;
  refreshComments: () => void;
}

export const Comment = ({ comment, refreshComments }: CommentProps) => {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: fr,
  });

  const actionSheetRef = useRef<ActionSheetRef>(null);

  const showModal = () => actionSheetRef.current?.show();
  const hideModal = () => actionSheetRef.current?.hide();

  const handleDeleteComment = async () => {
    try {
      await deleteComment({ comment_id: comment.id });
      hideModal();
      refreshComments();
    } catch (error) {
      Toast.show({
        text1: "Erreur lors de la suppression du commentaire",
        type: "error",
      });
    }
  };

  const handleReport = async () => {
    try {
      await reportContent({
        comment_id: comment.id,
        reason: "Commentaire inapproprié", // TODO: add reason
      });
      Toast.show({
        text1: "Commentaire signalé",
        type: "success",
      });
      hideModal();
    } catch (error) {
      // console.error(error);
    }
  };

  return (
    <>
      <View className="relative">
        {/* Comment content */}
        <Pressable
          onLongPress={showModal}
          className="flex flex-row gap-x-3 p-2"
        >
          {/* Avatar */}
          <ProfilePicture
            avatar_url={comment.creator.avatar_url}
            username={comment.creator.username}
            userId={comment.creator.id}
          />

          {/* Comment content container */}
          <View className="flex-1">
            <View className="flex flex-row items-center justify-between">
              <Pressable onPress={() => comment.creator?.username && router.push(`/profile/${comment.creator.username}`)}>
                <Text className="font-grotesque text-white">
                  {comment.creator?.username || "Utilisateur supprimé"}
                </Text>
              </Pressable>
              <Text className="text-xs text-gray-500">{timeAgo}</Text>
            </View>

            <Text className="text-sm mt-1 text-white">
              {comment.content || "Commentaire supprimé"}
            </Text>
          </View>
        </Pressable>
      </View>
      <Modal actionSheetRef={actionSheetRef}>
        <View className="flex flex-row justify-center items-center gap-x-4">
          <Button
            withLoader={true}
            onClick={handleReport}
            text="Signaler"
            className="w-1/2"
          />
          <Button
            withLoader={true}
            onClick={handleDeleteComment}
            text="Supprimer"
            className="w-1/2"
          />
        </View>
      </Modal>
    </>
  );
};
