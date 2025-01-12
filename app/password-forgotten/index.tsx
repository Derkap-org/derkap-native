import React, { useState } from "react";

import Auth from "@/components/Auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/auth-context";
import { Link, Redirect, router } from "expo-router";
import { View, Text, TextInput, Alert } from "react-native";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";

export default function PasswordForgotten() {
  const { session } = useSupabase();
  const [email, setEmail] = useState("");
  const [isLoading, setLoading] = useState(false);

  async function resetPassword() {
    setLoading(true);

    const redirectUrl = Linking.createURL("update-password");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    setLoading(false);
    if (error) console.error(error);
    else {
      Alert.alert("Un email de réinitialisation a été envoyé.");
      router.push("/");
    }
  }

  if (!session) {
    return (
      <View className="relative flex-col items-center justify-center flex-1 w-full gap-y-4">
        <Text className="px-16 text-3xl text-center font-grotesque">
          Mot de passe oublié ? 🤔
        </Text>

        <View className="flex flex-col w-96 gap-y-4">
          <Text className="text-center">
            Entrez votre adresse email pour réinitialiser votre mot de passe.
          </Text>

          <TextInput
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Email"
            autoCapitalize={"none"}
            className="w-full h-16 p-2 bg-white border border-gray-300 rounded-xl placeholder:text-gray-500"
          />
          <Button
            withLoader
            text="Envoyer"
            isCancel={isLoading}
            onClick={resetPassword}
            className="bg-gray-500 w-fit"
          />
        </View>
        <Text className="">
          Mot de passe retrouvé ?{" "}
          <Link
            href={{
              pathname: "/sign-in",
            }}
            className="text-[#9747ff]"
          >
            Connectez-vous.
          </Link>
        </Text>
      </View>
    );
  }

  return <Redirect href="/" />;
}
