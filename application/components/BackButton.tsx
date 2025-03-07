import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { View, Pressable } from "react-native";

export default function BackButton({ handleBack }: { handleBack: () => void }) {
  return (
    <View className="flex flex-row items-center justify-start w-1/3">
      <Pressable onPress={() => handleBack()}>
        <ChevronLeft size={32} color={"black"} />
      </Pressable>
    </View>
  );
}
