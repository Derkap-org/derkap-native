import React, { useState } from "react";
import { useSupabase } from "@/context/auth-context";
import { Link, router } from "expo-router";
import { View, Text, TextInput } from "react-native";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import { EyeOff } from "lucide-react-native";
import { Eye } from "lucide-react-native";

export default function UpdatePassword() {
  const { session } = useSupabase();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordConfirmationVisible, setIsPasswordConfirmationVisible] =
    useState(false);
  const [isLoading, setLoading] = useState(false);

  async function updatePassword() {
    try {
      setLoading(true);
      if (password !== passwordConfirmation) {
        Toast.show({
          type: "error",
          text1: "Les mots de passe ne correspondent pas.",
        });
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password,
      });

      setLoading(false);
      if (error) throw error;
      else {
        Toast.show({
          type: "success",
          text1: "Votre mot de passe a été mis à jour.",
        });
        router.push("/");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Une erreur est survenue",
        text2: error?.message || "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  }

  if (session) {
    return (
      <View className="relative flex-col items-center justify-start pt-12 flex-1 w-full gap-y-4">
        <Text className="px-16 text-4xl text-center font-grotesque text-white">
          Met à jour ton mot de passe
        </Text>

        <View className="flex flex-col w-96 gap-y-4">
          <View className="flex flex-row items-center justify-between relative bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl w-full pr-2">
            <TextInput
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={!isPasswordVisible}
              placeholder="Nouveau mot de passe"
              autoCapitalize={"none"}
              className="w-10/12 h-16 p-2 placeholder:text-zinc-400 text-white"
            />
            {isPasswordVisible ? (
              <Eye
                size={24}
                className=""
                color={"white"}
                onPress={() => setIsPasswordVisible(false)}
              />
            ) : (
              <EyeOff
                size={24}
                color={"white"}
                className=""
                onPress={() => setIsPasswordVisible(true)}
              />
            )}
          </View>

          <View className="flex flex-row items-center justify-between relative w-full bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl pr-2">
            <TextInput
              onChangeText={(text) => setPasswordConfirmation(text)}
              value={passwordConfirmation}
              secureTextEntry={!isPasswordConfirmationVisible}
              placeholder="Confirmer le mot de passe"
              autoCapitalize={"none"}
              className="w-10/12 h-16 p-2 placeholder:text-zinc-400 text-white"
            />
            {isPasswordConfirmationVisible ? (
              <Eye
                size={24}
                className=""
                color={"white"}
                onPress={() => setIsPasswordConfirmationVisible(false)}
              />
            ) : (
              <EyeOff
                size={24}
                color={"white"}
                className=""
                onPress={() => setIsPasswordConfirmationVisible(true)}
              />
            )}
          </View>

          <Button
            withLoader
            text="Confirmer"
            isCancel={isLoading}
            onClick={updatePassword}
            className="w-fit"
          />
        </View>
        <Text className="text-white">
          Mot de passe retrouvé ?{" "}
          <Link
            href={{
              pathname: "/sign-in",
            }}
            className="text-[#9747ff]"
          >
            Connecte-toi !
          </Link>
        </Text>
      </View>
    );
  }
}
