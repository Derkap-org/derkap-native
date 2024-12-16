import React, { useState } from "react";
import { Alert, Text, View, AppState, SafeAreaView } from "react-native";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { TextInput } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import Button from "./Button";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);
    if (error) Alert.alert(error.message);
    else {
      router.push("/");
    }
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { data: { username: username } },
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View className="relative items-center justify-center flex-1 flex-col w-full gap-y-20">
      <Text className="text-5xl font-grotesque text-center">
        Bienvenue sur {"\n"} Derkap ! 👋
      </Text>

      <View className="w-96 flex flex-col gap-y-4">
        <TextInput
          // label="Email"
          // leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email"
          autoCapitalize={"none"}
          className="w-full p-2 border border-gray-300 rounded-xl bg-white h-16 placeholder:text-gray-500"
        />
        {!isSignIn && (
          <TextInput
            // label="Username"
            // leftIcon={{ type: "font-awesome", name: "user" }}
            onChangeText={(text) => setUsername(text)}
            value={username}
            placeholder="Pseudo"
            autoCapitalize={"none"}
            className="w-full p-2 border border-gray-300 rounded-xl bg-white h-16 placeholder:text-gray-500"
          />
        )}

        <TextInput
          // label="Password"
          // leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Mot de passe"
          autoCapitalize={"none"}
          className="w-full p-2 border border-gray-300 rounded-xl bg-white h-16 placeholder:text-gray-500"
        />

        <View className="">
          {isSignIn ? (
            <Button
              withLoader={true}
              text="Connexion"
              isCancel={loading}
              onClick={() => signInWithEmail()}
            />
          ) : (
            <Button
              text="Inscription"
              isCancel={loading}
              withLoader={true}
              onClick={() => signUpWithEmail()}
            />
          )}
        </View>
        <View className="flex flex-row justify-end ">
          {
            //todo: add password reset
            isSignIn && <Text>Mot de passe oublié ?</Text>
          }
        </View>
        <View className="flex flex-row justify-center ">
          {isSignIn ? (
            <Button
              text="S'inscire"
              isCancel={loading}
              onClick={() => setIsSignIn(false)}
              className="bg-gray-500 w-fit"
            />
          ) : (
            <Button
              text="Se connecter"
              isCancel={loading}
              onClick={() => setIsSignIn(true)}
              className="bg-gray-500 w-fit"
            />
          )}
        </View>
      </View>
    </View>
  );
}
