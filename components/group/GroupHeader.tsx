import { View, Text, Pressable, ViewProps } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import StatusLabel from "@/components/group/StatusLabel";
import { TGroupDB, TChallengeDB } from "@/types/types";
interface GroupHeaderProps extends ViewProps {
  group?: TGroupDB;
  challenge: TChallengeDB;
}

export default function GroupHeader({
  group,
  challenge,
  ...props
}: GroupHeaderProps) {
  const router = useRouter();

  return (
    <View
      {...props}
      className="flex-row justify-between items-center p-4 bg-[#f1d7f3] "
    >
      <Pressable onPress={() => router.back()}>
        <ChevronLeft size={40} color={"black"} />
      </Pressable>
      {
        //todo: center the text
      }
      <Text className="text-2xl font-grotesque absolute left-1/2 transform -translate-x-1/2 ">
        {group?.name}
      </Text>

      <StatusLabel challengeStatus={challenge?.status} />
    </View>
  );
}
