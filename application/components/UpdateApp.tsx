import { View, Text, Image, Linking } from "react-native";
import React from "react";
import Button from "./Button";
export default function UpdateApp() {
  const appLink = "https://apps.apple.com/fr/app/derkap/id6741578374";

  const handleUpdate = () => {
    Linking.openURL(appLink);
  };

  return (
    <View className="items-center justify-center flex-1 p-4">
      <View className="flex flex-col items-center w-full p-4 bg-white font-grotesque gap-y-4 rounded-xl">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-20 h-20 rounded-xl"
        />
        <Text className="text-2xl font-bold">Mise à jour requise</Text>
        <Text className="text-center text-gray-500">
          Une nouvelle version de Derkap est disponible et requise pour
          continuer, merci de mettre à jour et relancer l'application
        </Text>
        <Button
          className="w-full"
          text="Mettre à jour"
          onClick={handleUpdate}
        />
      </View>
    </View>
  );
}
