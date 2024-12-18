import Button from "@/components/Button";
import useGroupStore from "@/store/useGroupStore";
import SwipeModal from "@birdwingo/react-native-swipe-modal/src/components/SwipeModal";
import { SwipeModalPublicMethods } from "@birdwingo/react-native-swipe-modal/src/core/dto/swipeModalDTO";
import React, { MutableRefObject, useState } from "react";
import { View, Text, TextInput } from "react-native";

export default function CreateGroupModal({
  ref,
}: {
  ref: MutableRefObject<SwipeModalPublicMethods>;
}) {
  const [groupName, setGroupName] = useState("");
  const { createGroup } = useGroupStore();

  return (
    <SwipeModal
      ref={ref}
      showBar
      maxHeight={400}
      bg="white"
      style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
      wrapInGestureHandlerRootView
    >
      <View className="flex flex-col px-10 pt-10 bg-white pb-18 gap-y-4">
        <Text className="text-2xl font-bold">Créer un groupe</Text>
        <TextInput
          className="w-full p-2 border border-gray-300 rounded-xl"
          onChangeText={setGroupName}
          value={groupName}
          placeholder="Nom du groupe"
          placeholderTextColor="#888"
        />
        <Button
          withLoader={true}
          isCancel={!groupName.length}
          onClick={() => createGroup(groupName)}
          text="Créer un groupe"
          className="w-fit"
        />
      </View>
    </SwipeModal>
  );
}
