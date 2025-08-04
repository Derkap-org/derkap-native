import React from "react";
import { View, Text, Pressable } from "react-native";
import { Modal } from "@/components/modals/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import Button from "@/components/Button";

// Centralized rank definitions based on derkap count
const RANKS = {
  0: {
    name: "Mou du genou",
    emoji: "🦴",
    color: "text-gray-400",
    description: "Tu n'as même pas commencé à derkapper...",
  },
  3: {
    name: "Branleur amateur",
    emoji: "🛋️",
    color: "text-gray-300",
    description: "Tu fais semblant de derkapper",
  },
  5: {
    name: "Débutant pathétique",
    emoji: "🥱",
    color: "text-gray-200",
    description: "Tu commences à peine à comprendre",
  },
  10: {
    name: "Moyen médiocre",
    emoji: "😐",
    color: "text-yellow-300",
    description: "Tu es dans la moyenne, bravo...",
  },
  15: {
    name: "Pas trop nul",
    emoji: "🤔",
    color: "text-yellow-200",
    description: "Tu commences à être acceptable",
  },
  25: {
    name: "Derkappeur confirmé",
    emoji: "😏",
    color: "text-orange-300",
    description: "Tu as un bon niveau de derkappage",
  },
  35: {
    name: "Expert en absurdité",
    emoji: "😈",
    color: "text-orange-200",
    description: "Tu maîtrises l'art de l'absurde",
  },
  50: {
    name: "Maître du nonsense",
    emoji: "🤪",
    color: "text-red-300",
    description: "Tu excelles dans le nonsense",
  },
  75: {
    name: "Génie de l'humour",
    emoji: "🤡",
    color: "text-red-200",
    description: "Tu es un génie de l'humour",
  },
  100: {
    name: "Légende urbaine",
    emoji: "👻",
    color: "text-purple-300",
    description: "On parle de toi dans les couloirs",
  },
  150: {
    name: "Dieu du chaos",
    emoji: "👹",
    color: "text-purple-200",
    description: "Tu contrôles le chaos",
  },
  200: {
    name: "Empereur du fun",
    emoji: "👑",
    color: "text-pink-300",
    description: "Tu règnes sur le fun",
  },
  300: {
    name: "Seigneur des ténèbres",
    emoji: "🦇",
    color: "text-pink-200",
    description: "Tu es une légende sombre",
  },
  500: {
    name: "Légende vivante",
    emoji: "🏆",
    color: "text-yellow-400",
    description: "Tu es immortel",
  },
  1000: {
    name: "Mythologie urbaine",
    emoji: "⚡",
    color: "text-blue-400",
    description: "Tu es une légende",
  },
} as const;

// Helper function to get rank based on derkap count
const getRankForCount = (count: number) => {
  const rankThresholds = Object.keys(RANKS)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of rankThresholds) {
    if (count >= threshold) {
      return RANKS[threshold as keyof typeof RANKS];
    }
  }

  // Fallback to highest rank (1000+)
  return {
    name: "DIEU ABSOLU",
    emoji: "💎",
    color: "text-cyan-400",
    description: "Tu es au-delà de tout",
  };
};

interface DerkapRankProps {
  totalDerkaps: number;
  onPress: () => void;
}

export const DerkapRankDisplay: React.FC<DerkapRankProps> = ({
  totalDerkaps,
  onPress,
}) => {
  const rankInfo = getRankForCount(totalDerkaps);

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-1 ">
      <Text className={`text-lg font-bold ${rankInfo.color}`}>
        {rankInfo.emoji}
      </Text>
      <Text className={`text-xs font-bold ${rankInfo.color}`} numberOfLines={1}>
        {rankInfo.name}
      </Text>
    </Pressable>
  );
};

interface DerkapRankExplanationModalProps {
  actionSheetRef: React.RefObject<ActionSheetRef>;
  totalDerkaps: number;
}

export const DerkapRankExplanationModal: React.FC<
  DerkapRankExplanationModalProps
> = ({ actionSheetRef, totalDerkaps }) => {
  const currentRank = getRankForCount(totalDerkaps);

  return (
    <Modal actionSheetRef={actionSheetRef}>
      <View className="flex flex-col gap-4">
        <Text className="text-white text-center font-bold text-xl">
          Ton Rang Derkap 👑
        </Text>

        <View className="flex flex-col items-center gap-3">
          <Text className="text-4xl">{currentRank.emoji}</Text>
          <Text className="text-white text-center font-bold text-lg">
            {currentRank.name}
          </Text>
          <Text className="text-white text-center text-sm">
            {currentRank.description}
          </Text>
          <Text className="text-white text-center text-xs text-gray-400">
            {totalDerkaps} derkaps postés
          </Text>
        </View>

        <View className="flex flex-col gap-3">
          <Text className="text-white text-base font-bold">
            Prochains rangs à débloquer :
          </Text>

          <View className="flex flex-col gap-2">
            {Object.entries(RANKS)
              .filter(([threshold]) => Number(threshold) > totalDerkaps)
              .sort(([a], [b]) => Number(a) - Number(b))
              .slice(0, 5) // Show only next 5 ranks
              .map(([threshold, rank]) => (
                <View key={threshold} className="flex-row items-center gap-2">
                  <Text className="text-lg">{rank.emoji}</Text>
                  <Text className="text-white text-sm">
                    {rank.name} ({threshold} derkaps)
                  </Text>
                </View>
              ))}
            {totalDerkaps >= 1000 && (
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">💎</Text>
                <Text className="text-white text-sm">
                  DIEU ABSOLU (1000+ derkaps)
                </Text>
              </View>
            )}
          </View>

          <Text className="text-white text-base font-bold text-center mt-2">
            Continue à derkapper pour monter en grade ! 🚀
          </Text>
        </View>

        <Button
          withLoader={true}
          className="flex items-center justify-center w-full gap-2 mt-4"
          onClick={() => actionSheetRef.current?.hide()}
          text="Compris !"
        />
      </View>
    </Modal>
  );
};
