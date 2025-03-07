import { cn } from "@/lib/utils";
import {
  TProfileDB,
  TProfileInGroup,
  TUserWithFriendshipStatus,
} from "@/types/types";
import React from "react";
import { View, Image, Text } from "react-native";

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
      {member.avatar_url ? (
        <Image
          source={{
            uri: avatarReloaded
              ? `${member.avatar_url}?t=${new Date().getTime()}`
              : `${member.avatar_url}`,
          }}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <View className="items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
          <Text className="text-sm text-white">
            {member.username?.charAt(0) || "?"}
          </Text>
        </View>
      )}
      <Text className={cn("text-sm text-gray-500", classNameText)}>
        {member.username}
      </Text>
    </View>
  );
}
