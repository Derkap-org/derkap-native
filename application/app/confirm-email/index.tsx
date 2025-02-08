import React, { useState } from "react";

import { useSupabase } from "@/context/auth-context";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { View, Text, Alert } from "react-native";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import OtpInput from "@/components/OTPInput";
import { Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
export default function ConfirmEmail() {
  const { session } = useSupabase();
  const { email: emailLocal } = useLocalSearchParams();

  const [isLoading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [email, setEmail] = useState((emailLocal as string) ?? "");

  async function signInOtp() {
    try {
      setLoading(true);
      if (!otp || !email) {
        setLoading(false);
        throw new Error("Le code ou l'adresse email est manquant");
      }
      const redirectUrl = Linking.createURL("/");

      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp.join(""),
        type: "signup",
        options: {
          redirectTo: redirectUrl,
        },
      });
      setLoading(false);
      if (error) throw new Error(error?.message || "Le code est éronné");
      router.push("/");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la confirmation",
        text2: error?.message || "Une erreur est survenue",
      });
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <View className="h-full p-4">
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={32} color={"black"} />
        </Pressable>
        <View className="relative flex-col items-center justify-center flex-1 w-full gap-y-4">
          <Text className="px-16 text-2xl text-center font-grotesque">
            Entre ici le code de confirmation que tu as reçu par email.
          </Text>
          <OtpInput otp={otp} length={6} setOtp={setOtp} />

          <View className="flex flex-col w-96 gap-y-4">
            <Button
              withLoader
              disabled={otp.length < 5}
              text="Confirmer"
              isCancel={isLoading}
              onClick={signInOtp}
              className="bg-gray-500 w-fit"
            />
          </View>
        </View>
      </View>
    );
  }

  return <Redirect href="/" />;
}
