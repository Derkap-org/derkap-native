import { cn } from "@/lib/utils";
import {
  TProfileDB,
  TProfileInGroup,
  TUserWithFriendshipStatus,
} from "@/types/types";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import ProfilePicture from "../ProfilePicture";

export default function ProfileLine({
  member,
  className,
  classNameText,
  avatarReloaded = true,
  clickable = true,
}: {
  member: TProfileDB | TProfileInGroup | TUserWithFriendshipStatus[0];
  className?: string;
  classNameText?: string;
  avatarReloaded?: boolean;
  clickable?: boolean;
}) {
  const handlePress = () => {
    if (clickable && member.username) {
      router.push(`/profile/${member.username}`);
    }
  };

  const ProfileContent = () => (
    <View
      key={member.id}
      className={cn(
        "flex flex-row items-center justify-start gap-x-2 w-full",
        className,
      )}
    >
      <ProfilePicture
        avatar_url={member.avatar_url}
        username={member.username}
        userId={member.id}
        clickable={false} // We handle click at ProfileLine level
      />
      <Text className={cn("text-sm text-gray-300", classNameText)}>
        {member.username}
      </Text>
    </View>
  );

  if (clickable && member.username) {
    return (
      <Pressable onPress={handlePress} className="active:opacity-70">
        <ProfileContent />
      </Pressable>
    );
  }

  return <ProfileContent />;
}
