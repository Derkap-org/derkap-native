import React from "react";
import { View, Text } from "react-native";
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
  onUpdate,
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

  const getStatusText = () => {
    switch (userProfile.friendship_status) {
      case "not_friend":
        return "Vous n'êtes pas amis";
      case "pending_your_acceptance":
        return "Demande d'ami en cours";
      case "pending_their_acceptance":
        return "Demande d'ami en cours";
      case "friend":
        return "Vous êtes amis";
      default:
        return "";
    }
  };

  const renderButtons = () => {
    switch (userProfile.friendship_status) {
      case "not_friend":
        return (
          <Button
            withLoader={true}
            text="Ajouter"
            className="px-2 py-1 bg-custom-primary rounded-xl"
            onClick={handleAddFriend}
          />
        );

      case "pending_your_acceptance":
        return (
          <View className="flex flex-row gap-2">
            <Button
              withLoader={true}
              text="Accepter"
              className="px-2 py-1 bg-custom-primary rounded-xl"
              onClick={handleAcceptRequest}
            />
            <Button
              withLoader={true}
              text="Refuser"
              color="danger"
              className="px-2 py-1 rounded-xl"
              onClick={handleRejectRequest}
            />
          </View>
        );

      case "pending_their_acceptance":
        return (
          <Button
            withLoader={true}
            text="En attente"
            color="gray"
            className="px-2 py-1 rounded-xl"
            onClick={handleRejectRequest}
          />
        );

      case "friend":
        return (
          <Button
            withLoader={true}
            text="Supprimer ami"
            color="danger"
            className="px-2 py-1 rounded-xl"
            onClick={handleRemoveFriend}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex flex-col items-center gap-3">
      <Text className="text-white text-center font-medium">
        {getStatusText()}
      </Text>
      <View className="flex flex-row justify-center">{renderButtons()}</View>
    </View>
  );
}
