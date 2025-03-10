import { TCommentDB } from "@/types/types";
import { View, Text, Image, Pressable } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useRef } from "react";
import { deleteComment } from "@/functions/comments-action";
import Toast from "react-native-toast-message";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import Button from "@/components/Button";
import React from "react";
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

  const handleReport = () => {
    // Implement report logic here
    Toast.show({
      text1: "Commentaire signalé",
      type: "success",
    });
    hideModal();
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
          <View className={`rounded-full overflow-hidden`}>
            {comment.creator?.avatar_url ? (
              <Image
                source={{
                  uri: `${comment.creator.avatar_url}`,
                }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <View className="items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                <Text className="text-sm text-white">
                  {comment.creator?.username?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>

          {/* Comment content container */}
          <View className="flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Text className="font-semibold">
                {comment.creator?.username || "Utilisateur supprimé"}
              </Text>
              <Text className="text-xs text-gray-500">{timeAgo}</Text>
            </View>

            <Text className="text-sm mt-1">
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
