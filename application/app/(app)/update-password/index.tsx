import React, { useState } from "react";
import { useSupabase } from "@/context/auth-context";
import { Link, router } from "expo-router";
import { View, Text, TextInput } from "react-native";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";

export default function UpdatePassword() {
  const { session } = useSupabase();
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);

  async function updatePassword() {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);
    if (error) console.error(error);
    else {
      Toast.show({
        type: "success",
        text1: "Votre mot de passe a été mis à jour.",
      });
      router.push("/");
    }
  }

  if (session) {
    return (
      <View className="relative flex-col items-center justify-center flex-1 w-full gap-y-4">
        <Text className="px-16 text-4xl text-center font-grotesque text-white">
          Mettre à jour ton mot de passe 🤔
        </Text>

        <View className="flex flex-col w-96 gap-y-4">
          <Text className="text-center text-white">
            Entre ton nouveau mot de passe.
          </Text>

          <TextInput
            onChangeText={(text) => setPassword(text)}
            value={password}
            placeholder="Mot de passe"
            secureTextEntry={true}
            autoCapitalize={"none"}
            className="w-full h-16 p-2 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl"
          />
          <Button
            withLoader
            text="Envoyer"
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
