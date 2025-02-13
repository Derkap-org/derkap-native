import { cn } from "@/lib/utils";
import { TProfileDB, TProfileInGroup } from "@/types/types";
import React from "react";
import { View, Image, Text } from "react-native";

export default function ProfileLine({
  member,
  className,
}: {
  member: TProfileDB | TProfileInGroup;
  className?: string;
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
            uri: `${member.avatar_url}?t=${new Date().getTime()}`,
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
      <Text className="text-sm text-gray-500">{member.username}</Text>
    </View>
  );
}
