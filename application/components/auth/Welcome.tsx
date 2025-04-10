import React from "react";
import { Text, View, Image } from "react-native";
import Button from "../Button";

interface WelcomeProps {
  onSignInPress: () => void;
  onSignUpPress: () => void;
}

export default function Welcome({
  onSignInPress,
  onSignUpPress,
}: WelcomeProps) {
  return (
    <View className="flex-1 items-center justify-center px-4">
      <View className="flex-1 flex-col items-center justify-evenly w-full">
        <Text className="text-5xl text-center font-grotesque text-white">
          Bienvenue sur{"\n"}
          <Text className="text-[#9747ff]">Derkap</Text>
        </Text>

        <View className="w-full flex flex-col items-center gap-y-4">
          <Image
            source={require("../../assets/images/welcome.png")}
            className="w-72 h-72 rounded-3xl"
          />
          <Text className="text-white text-center font-bold text-lg">
            Des barres entre potes 🤣
          </Text>
        </View>

        <View className="w-full gap-y-4">
          <Button text="S'inscrire" onClick={onSignUpPress} />
          <Button
            text="Se connecter"
            color="gray-dark"
            onClick={onSignInPress}
          />
        </View>
      </View>
    </View>
  );
}
