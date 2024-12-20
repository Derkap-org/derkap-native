import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";
import { SupabaseProvider } from "@/context/auth-context";
import { Alert, Text, View, AppState, SafeAreaView } from "react-native";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Champ: require("../assets/fonts/champs/champs-Black.ttf"),
    Grotesque: require("../assets/fonts/grotesque/grotesque.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return (
    <SupabaseProvider>
      <SafeAreaView className="flex-1 bg-[#f1d7f3]">
        <Slot />
      </SafeAreaView>
    </SupabaseProvider>
  );
}
