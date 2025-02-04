import React, { useState } from "react";

import Auth from "@/components/Auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/auth-context";
import { Link, Redirect, router, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, Alert } from "react-native";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import OtpInput from "@/components/OTPInput";
import ProfileHeader from "@/components/group/ProfileHeader";
import { Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";

export default function ConfirmEmail() {
  const { session } = useSupabase();
  const { email: emailLocal } = useLocalSearchParams();

  const [isLoading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [email, setEmail] = useState((emailLocal as string) ?? "");

  async function signInOtp() {
    setLoading(true);
    if (!otp || !email) {
      setLoading(false);
      Alert.alert("Le code ou l'adresse email est manquant");
      return;
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
    if (error) Alert.alert("Le code est éronné");
    if (error) console.error(error);
    else {
      router.push("/");
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
