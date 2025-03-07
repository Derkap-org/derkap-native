import { View, Text, Pressable, ViewProps } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { ChevronLeft, Ellipsis } from "lucide-react-native";

import { TGroupDB } from "@/types/types";
import useGroupStore from "@/store/useGroupStore";
import BackButton from "../BackButton";
interface GroupHeaderProps extends ViewProps {
  group?: TGroupDB;
  showModal: () => void;
}

export default function GroupHeader({
  showModal,
  group,
  ...props
}: GroupHeaderProps) {
  const router = useRouter();
  const { fetchGroups } = useGroupStore();

  const handleBack = () => {
    fetchGroups();
    router.back();
  };

  return (
    <View
      {...props}
      className="flex-row justify-between items-center p-4 bg-[#f1d7f3] border-b border-[#d4c1d6] rounded-b-xl"
    >
      <BackButton handleBack={handleBack} />

      <View className="flex flex-row items-center justify-center w-1/3">
        <Text className="text-2xl font-grotesque">{group?.name}</Text>
      </View>

      <View className="flex flex-row items-center justify-end w-1/3">
        <Pressable
          onPress={() => {
            showModal();
          }}
        >
          <Ellipsis size={32} color={"black"} />
        </Pressable>
      </View>
    </View>
  );
}
