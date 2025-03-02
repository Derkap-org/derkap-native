import { View, Pressable, ViewProps } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ellipsis, ChevronLeft } from "lucide-react-native";

interface ProfileHeaderProps extends ViewProps {
  showModal: () => void;
}

export default function ProfileHeader({
  showModal,
  ...props
}: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <View {...props} className="flex-row justify-between items-center p-4">
      <Pressable onPress={() => router.back()}>
        <ChevronLeft size={32} color={"black"} />
      </Pressable>
      <Pressable
        onPress={() => {
          showModal();
        }}
      >
        <Ellipsis size={32} color={"black"} />
      </Pressable>
    </View>
  );
}
