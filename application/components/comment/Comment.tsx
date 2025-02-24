import { TCommentDB } from "@/types/types";
import { View, Text, Image, Pressable } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { deleteComment } from "@/functions/comments-action";
import Toast from "react-native-toast-message";
import { useSupabase } from "@/context/auth-context";

interface CommentProps {
  comment: TCommentDB;
  refreshComments: () => void;
}

export const Comment = ({ comment, refreshComments }: CommentProps) => {
  const { user } = useSupabase();
  const [showActions, setShowActions] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: fr,
  });

  const handleDeleteComment = async () => {
    try {
      console.log("deleteComment", comment.id);
      await deleteComment({ comment_id: comment.id });
      setShowActions(false);
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
    setShowActions(false);
  };

  return (
    <View className="relative">
      {/* Action buttons */}
      {showActions && (
        <View className="absolute top-10 right-0 mb-2 mx-2 bg-white rounded-xl shadow-lg">
          {user?.id === comment.creator_id && (
            <Pressable className="p-3" onPress={handleDeleteComment}>
              <Text className="text-center text-red-600">Supprimer</Text>
            </Pressable>
          )}
          <Pressable
            className="p-3 border-t border-gray-200"
            onPress={handleReport}
          >
            <Text className="text-center text-red-500">Signaler</Text>
          </Pressable>
        </View>
      )}

      {/* Comment content */}
      <Pressable
        onLongPress={() => setShowActions(true)}
        onPress={() => showActions && setShowActions(false)}
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
  );
};
