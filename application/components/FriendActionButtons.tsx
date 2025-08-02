import React from "react";
import { View } from "react-native";
import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import useFriendStore from "@/store/useFriendStore";
import { TUserWithFriendshipStatus } from "@/types/types";

interface FriendActionButtonsProps {
  userProfile: TUserWithFriendshipStatus[0];
  onUpdate?: () => void;
}

export default function FriendActionButtons({ 
  userProfile, 
  onUpdate 
}: FriendActionButtonsProps) {
  const { addRequest, acceptRequest, rejectRequest } = useFriendStore();

  const handleAddFriend = async () => {
    try {
      await addRequest({ user_id: userProfile.id });
      onUpdate?.();
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await acceptRequest({
        request_id: userProfile.friend_request_id,
        user_id: userProfile.id,
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async () => {
    try {
      await rejectRequest({
        request_id: userProfile.friend_request_id,
        user_id: userProfile.id,
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await rejectRequest({
        request_id: userProfile.friend_request_id,
        user_id: userProfile.id,
      });
      onUpdate?.();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const renderButtons = () => {
    switch (userProfile.friendship_status) {
      case "not_friend":
        return (
          <Button
            withLoader={true}
            text="Ajouter"
            className="px-6 py-3 bg-custom-primary rounded-xl"
            onClick={handleAddFriend}
          />
        );

      case "pending_your_acceptance":
        return (
          <View className="flex flex-row gap-2">
            <Button
              withLoader={true}
              className="px-4 py-3 bg-custom-primary rounded-xl flex-row items-center gap-2"
              onClick={handleAcceptRequest}
            >
              <Ionicons name="checkmark" size={20} color="white" />
            </Button>
            <Button
              withLoader={true}
              color="danger"
              className="px-4 py-3 rounded-xl flex-row items-center gap-2"
              onClick={handleRejectRequest}
            >
              <Ionicons name="close" size={20} color="white" />
            </Button>
          </View>
        );

      case "pending_their_acceptance":
        return (
          <Button
            withLoader={true}
            color="gray"
            className="px-6 py-3 rounded-xl"
            onClick={handleRejectRequest}
            text="Annuler la demande"
          />
        );

      case "friend":
        return (
          <Button
            withLoader={true}
            color="danger"
            className="px-6 py-3 rounded-xl"
            onClick={handleRemoveFriend}
            text="Supprimer ami"
          />
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex flex-row justify-center">
      {renderButtons()}
    </View>
  );
}