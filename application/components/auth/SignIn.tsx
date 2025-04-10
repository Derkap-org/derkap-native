import React, { useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import Button from "../Button";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import Toast from "react-native-toast-message";
import { EyeOff, Eye } from "lucide-react-native";

interface SignInProps {
  onSignUpPress: () => void;
}

export default function SignIn({ onSignUpPress }: SignInProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  async function handleSignIn() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.code === "email_not_confirmed") {
          router.push({
            pathname: "/confirm-email",
            params: { email: email, reason: "email_not_confirmed" },
          });
        } else {
          throw error;
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la connexion",
        text2: "Vérifie tes identifiants",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 px-4 pt-12">
      <View className="flex-col items-center w-full max-w-96 mx-auto">
        <Text className="text-3xl text-center font-grotesque mb-12 text-white">
          Connexion
        </Text>

        <View className="w-full gap-y-4">
          <TextInput
            onChangeText={setEmail}
            value={email}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            className="w-full h-16 p-4 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl"
          />

          <View className="flex-row items-center justify-between relative bg-zinc-800 rounded-xl">
            <TextInput
              onChangeText={setPassword}
              value={password}
              secureTextEntry={!isPasswordVisible}
              placeholder="Mot de passe"
              autoCapitalize="none"
              className="flex-1 h-16 p-4 placeholder:text-zinc-400 text-white"
            />
            <Pressable
              onPress={() => setPasswordVisible(!isPasswordVisible)}
              className="px-4"
            >
              {isPasswordVisible ? (
                <Eye size={24} color="white" />
              ) : (
                <EyeOff size={24} color="white" />
              )}
            </Pressable>
          </View>

          <View className="flex-row justify-end">
            <Link className="text-[#9747ff]" href="/password-forgotten">
              Mot de passe oublié ?
            </Link>
          </View>

          <Button
            text="Connexion"
            onClick={handleSignIn}
            withLoader={true}
            isCancel={loading}
          />

          <View className="mt-4">
            <Pressable onPress={onSignUpPress}>
              <Text className="text-white text-center">
                Pas encore de compte ?{" "}
                <Text className="text-[#9747ff]">Inscris-toi !</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
