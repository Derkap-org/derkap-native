import { View, Text, Pressable, ViewProps } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { ChevronLeft, Ellipsis } from "lucide-react-native";

import { TGroupDB, TChallengeDB } from "@/types/types";
import useGroupStore from "@/store/useGroupStore";
import BackButton from "../BackButton";
interface GroupHeaderProps extends ViewProps {
  group?: TGroupDB;
  showModal: () => void;
  selectedChallenge: TChallengeDB | null;
  setSelectedChallenge: (challenge: TChallengeDB | null) => void;
}

export default function GroupHeader({
  showModal,
  group,
  selectedChallenge,
  setSelectedChallenge,
  ...props
}: GroupHeaderProps) {
  const router = useRouter();
  const { fetchGroups } = useGroupStore();

  const handleBack = () => {
    if (selectedChallenge) {
      setSelectedChallenge(null);
    } else {
      fetchGroups();
      router.back();
    }
  };

  return (
    <View
      {...props}
      className="flex-row justify-between items-center p-4 bg-[#f1d7f3] border-b border-[#d4c1d6] rounded-b-xl"
    >
      <View className="w-[12.5%] flex flex-row items-center justify-start">
        <Pressable onPress={() => handleBack()}>
          <ChevronLeft size={32} color={"black"} />
        </Pressable>
      </View>

      <View className="w-[75%] flex flex-row items-center justify-center">
        <Text className="text-2xl font-grotesque">{group?.name}</Text>
      </View>

      <View className="w-[12.5%] flex flex-row items-center justify-end">
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
