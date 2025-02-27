import {
  View,
  Text,
  StyleSheet,
  Linking,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";
import Button from "./Button";

export default function UpdateApp() {
  //   const handleUpdate = () => {
  //     console.log("handleUpdate");
  //     //     // TODO: Replace these URLs with your actual App Store and Play Store URLs
  //     //     const storeUrl =
  //     //       Platform.OS === "ios"
  //     //         ? "https://apps.apple.com/app/YOUR_APP_ID" // Replace with your App Store URL
  //     //         : "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME"; // Replace with your Play Store URL
  //     //     Linking.openURL(storeUrl);
  //   };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <View className="bg-white flex flex-col font-grotesque gap-y-4 items-center rounded-xl p-4 w-full">
        <Image
          source={require("@/assets/images/icon.png")}
          className="w-20 h-20 rounded-xl"
        />
        <Text className="text-2xl font-bold">Mise à jour requise</Text>
        <Text className="text-center text-gray-500">
          Une nouvelle version de Derkap est disponible et requise pour
          continuer, merci de mettre à jour l'application.
        </Text>
        {/* <Button
          className="w-full"
          text="Mettre à jour"
          onClick={handleUpdate}
        /> */}
      </View>
    </View>
  );
}
