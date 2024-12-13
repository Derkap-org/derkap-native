import { View, Text, Pressable, ViewProps } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ellipsis, ChevronLeft } from "lucide-react-native";

interface ProfileHeaderProps extends ViewProps {
  profile: any;
}

export default function ProfileHeader({ ...props }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <View {...props} className="flex-row justify-between items-center p-4">
      <Pressable onPress={() => router.back()}>
        <ChevronLeft size={30} color={"black"} />
      </Pressable>
      <Pressable
        onPress={() => {
          console.log("Edit profile");
        }}
      >
        <Ellipsis size={30} color={"black"} />
      </Pressable>
    </View>
  );
}
