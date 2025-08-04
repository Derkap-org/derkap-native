import React, { useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { Modal } from "@/components/modals/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import Button from "@/components/Button";

interface StreakModalProps {
  streakCount: number;
  onPress: () => void;
}

export const StreakDisplay: React.FC<StreakModalProps> = ({
  streakCount,
  onPress,
}) => {
  const getStreakEmoji = (count: number) => {
    if (count === 0) return "⭐";
    if (count < 3) return "🔥";
    if (count < 7) return "🚀";
    if (count < 14) return "💎";
    if (count < 30) return "👑";
    return "🏆";
  };

  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-1">
      <Text className="text-white text-lg font-bold">{streakCount}</Text>
      <Text className="text-lg">{getStreakEmoji(streakCount)}</Text>
    </Pressable>
  );
};

interface StreakExplanationModalProps {
  actionSheetRef: React.RefObject<ActionSheetRef>;
}

export const StreakExplanationModal: React.FC<StreakExplanationModalProps> = ({
  actionSheetRef,
}) => {
  return (
    <Modal actionSheetRef={actionSheetRef}>
      <View className="flex flex-col gap-4">
        <Text className="text-white text-center font-bold text-xl">
          Comment fonctionnent les streaks ? 🔥
        </Text>

        <View className="flex flex-col gap-3">
          <Text className="text-white text-base">
            Un <Text className="font-bold text-custom-primary">streak</Text>{" "}
            c'est le nombre de jours consécutifs où tu as posté au moins un
            derkap.
          </Text>

          <Text className="text-white text-base">
            • Si tu postes aujourd'hui, hier et avant-hier, tu as un streak de 3
            🔥
          </Text>

          <Text className="text-white text-base">
            • Si tu rates une journée, ton streak retombe à 0 ⭐
          </Text>

          <Text className="text-white text-base">
            • Plus ton streak est long, plus l'emoji évolue :
          </Text>

          <View className="flex flex-col gap-1 ml-4">
            <Text className="text-white text-sm">⭐ 0 jour</Text>
            <Text className="text-white text-sm">🔥 1-2 jours</Text>
            <Text className="text-white text-sm">🚀 3-6 jours</Text>
            <Text className="text-white text-sm">💎 7-13 jours</Text>
            <Text className="text-white text-sm">👑 14-29 jours</Text>
            <Text className="text-white text-sm">🏆 30+ jours</Text>
          </View>

          <Text className="text-white text-base font-bold text-center mt-2">
            Continue à derkapper chaque jour pour maintenir ton streak ! 💪
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
