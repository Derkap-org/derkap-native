import { View, Text, TextInput } from "react-native";
import { cn } from "@/lib/utils";

interface ChallengeBoxProps {
  challenge?: string;
  className?: string;
  setChallenge: (challenge: string) => void;
  isChallengeChangeable: boolean;
}

export default function ChallengeBox({
  challenge,
  setChallenge,
  className,
  isChallengeChangeable,
  ...props
}: ChallengeBoxProps) {
  return (
    <View className={cn("w-full", className)}>
      <View className="min-h-16 max-h-fit flex justify-center flex-row items-center w-full bg-zinc-800 rounded-t-xl py-2 gap-x-2">
        {!isChallengeChangeable ? (
          <Text className="text-lg font-grotesque w-full text-white text-center">
            {challenge}
          </Text>
        ) : (
          <TextInput
            className="text-lg font-grotesque text-white text-center max-w-full w-full"
            value={challenge}
            onChangeText={setChallenge}
            placeholder="Choisi un défi..."
          />
        )}
      </View>
    </View>
  );
}
