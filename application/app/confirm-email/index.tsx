import React, { useState, useEffect } from "react";

import { useSupabase } from "@/context/auth-context";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import OtpInput from "@/components/OTPInput";
import { Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import Toast from "react-native-toast-message";
export default function ConfirmEmail() {
  const { session } = useSupabase();
  const { email: emailLocal, reason } = useLocalSearchParams();

  const [isLoading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [email, setEmail] = useState((emailLocal as string) ?? "");
  const [timer, setTimer] = useState(60);

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

  async function resendOtp() {
    try {
      const { error } = await supabase.auth.resend({
        email,
        type: "signup",
      });
      if (error) throw new Error(error?.message || "Une erreur est survenue");
      setTimer(60);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la ré-envoi du code",
        text2: error?.message || "Une erreur est survenue",
      });
    }
  }

  const handleTimer = () => {
    if (timer > 0) {
      setTimeout(() => setTimer(timer - 1), 1000);
    }
  };

  useEffect(() => {
    handleTimer();
  }, [timer]);

  useEffect(() => {
    if (reason === "email_not_confirmed") {
      resendOtp();
    }
  }, [reason]);

  // Add keyboard listener to handle keyboard dismissal
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // You can add any additional logic here if needed when keyboard is dismissed
      },
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  if (!session) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="h-full p-4">
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={32} color={"white"} />
          </Pressable>
          <View className="relative flex-col items-center justify-center flex-1 w-full gap-y-4">
            <Text className="px-16 text-2xl text-center font-grotesque text-white">
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
                className="w-fit"
              />
              <Button
                withLoader
                disabled={isLoading || timer > 0}
                text={
                  timer > 0
                    ? `Renvoyer le code dans ${timer}`
                    : "Renvoyer le code"
                }
                isCancel={isLoading || timer > 0}
                onClick={resendOtp}
                className="w-fit"
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return <Redirect href="/" />;
}
