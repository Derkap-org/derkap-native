import { View, Text, Image } from "react-native";
import React from "react";

export default function Maintenance() {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <View className="bg-white flex flex-col font-grotesque gap-y-4 items-center rounded-xl p-4 w-full">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-20 h-20 rounded-xl"
        />
        <Text className="text-2xl font-bold">Maintenance</Text>
        <Text className="text-center text-gray-500">
          Derkap est actuellement en maintenance, merci de réessayer plus tard.
        </Text>
      </View>
    </View>
  );
}
