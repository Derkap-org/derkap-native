import { cn } from "@/lib/utils";
import { TProfileDB } from "@/types/types";
import { User } from "@supabase/supabase-js";
import { Pencil } from "lucide-react-native";
import React from "react";
import { View, Image, Text, Pressable } from "react-native";

export default function Avatar({
  profile,
  index,
  user,
  classNameImage,
  classNameContainer,
  pickImage,
}: {
  profile: TProfileDB;
  index: number;
  user: User;
  classNameImage?: string;
  classNameContainer?: string;
  pickImage?: () => void;
}) {
  if (!profile) return null;
  return (
    <View
      key={profile.id}
      className={cn(
        "border-2 border-white rounded-full flex",
        classNameContainer,
        index !== 0 ? "-ml-3" : "",
      )}
    >
      {pickImage && (
        <Pressable
          onPress={pickImage}
          className="absolute z-10 p-2 rounded-full -right-2 -top-2 bg-custom-primary"
        >
          <Pencil size={20} color={"white"} />
        </Pressable>
      )}
      {profile?.avatar_url ? (
        <Image
          width={70}
          height={70}
          source={{
            uri: `${profile?.avatar_url}?t=${user.user_metadata.avatarTimestamp}`,
          }}
          className={cn("w-10 h-10 rounded-full", classNameImage)}
        />
      ) : (
        <View
          className={cn(
            "items-center justify-center w-10 h-10 bg-gray-300 rounded-full",
            classNameImage,
          )}
        >
          <Text className="text-white">
            {profile?.username?.charAt(0) || "?"}
          </Text>
        </View>
      )}
    </View>
  );
}
