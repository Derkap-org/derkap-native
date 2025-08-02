import { View, Pressable, ViewProps } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Ellipsis, ChevronLeft } from "lucide-react-native";
import BackButton from "../BackButton";

interface ProfileHeaderProps extends ViewProps {
  showModal?: () => void;
}

export default function ProfileHeader({
  showModal,
  ...props
}: ProfileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <View {...props} className="flex-row items-center justify-between p-4">
      <BackButton handleBack={handleBack} />
      <Pressable
        disabled={!showModal}
        onPress={() => {
          if (showModal) {
            showModal();
          }
        }}
      >
        {showModal && <Ellipsis size={32} color={"white"} />}
      </Pressable>
    </View>
  );
}
