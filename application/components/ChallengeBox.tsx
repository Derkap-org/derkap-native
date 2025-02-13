import { TChallengeDB } from "@/types/types";
import { View, Text } from "react-native";
import { cn } from "@/lib/utils";
import StatusLabel from "./group/StatusLabel";

interface ChallengeBoxProps {
  challenge?: TChallengeDB;
  className?: string;
}

export default function ChallengeBox({
  challenge,
  className,
  ...props
}: ChallengeBoxProps) {
  return (
    <View className={cn("w-full", className)}>
      <View className="min-h-16 bg-red max-h-fit flex flex-row items-center w-full px-4 bg-custom-white border border-custom-black rounded-xl py-2 text-custom-black shadow-element gap-x-2">
        <View className="flex-1 flex flex-col gap-y-1 ">
          <Text className="text-xl font-grotesque text-custom-black line-clamp-2">
            {challenge ? challenge.description : "Pas de défi..."}
          </Text>
          <Text className="text-xs line-clamp-1">
            {challenge
              ? "Par " + challenge.creator?.username
              : "Crée en un dès maintenant !"}
          </Text>
        </View>
        <StatusLabel challengeStatus={challenge?.status} />
      </View>
    </View>
  );
}
