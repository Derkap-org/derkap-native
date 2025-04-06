import { cn } from "@/lib/utils";
import {
  TProfileDB,
  TProfileInGroup,
  TUserWithFriendshipStatus,
} from "@/types/types";
import React from "react";
import { View, Text } from "react-native";
import ProfilePicture from "../ProfilePicture";

export default function ProfileLine({
  member,
  className,
  classNameText,
  avatarReloaded = true,
}: {
  member: TProfileDB | TProfileInGroup | TUserWithFriendshipStatus[0];
  className?: string;
  classNameText?: string;
  avatarReloaded?: boolean;
}) {
  return (
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
      />
      <Text className={cn("text-sm text-gray-300", classNameText)}>
        {member.username}
      </Text>
    </View>
  );
}
