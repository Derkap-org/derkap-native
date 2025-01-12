import { View, Text, Pressable, ViewProps } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import StatusLabel from "@/components/group/StatusLabel";
import { TGroupDB, TChallengeDB } from "@/types/types";
import useGroupStore from "@/store/useGroupStore";
interface GroupHeaderProps extends ViewProps {
  group?: TGroupDB;
  challenge: TChallengeDB;
  showModal: () => void;
}

export default function GroupHeader({
  showModal,
  group,
  challenge,
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
      <Pressable onPress={() => handleBack()}>
        <ChevronLeft size={32} color={"black"} />
      </Pressable>
      {
        //todo: center the text
      }
      <Text
        onPress={showModal}
        className="text-2xl font-grotesque absolute left-1/2 transform -translate-x-1/2 "
      >
        {group?.name}
      </Text>

      <StatusLabel challengeStatus={challenge?.status} />
    </View>
  );
}
