import { cn } from "@/lib/utils";
import { TProfileDB } from "@/types/types";
import { User } from "@supabase/supabase-js";
import { Pencil } from "lucide-react-native";
import React from "react";
import { View, Pressable } from "react-native";
import ProfilePicture from "./ProfilePicture";

export default function Avatar({
  profile,
  user,
  classNameImage,
  classNameContainer,
  pickImage,
}: {
  profile: TProfileDB;
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
      <ProfilePicture
        avatar_url={profile.avatar_url}
        username={profile.username}
        imgClassName={classNameImage}
        userId={profile.id}
      />
    </View>
  );
}
