import { Slot, Stack } from "expo-router";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";
import { SupabaseProvider } from "@/context/auth-context";

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
      <Slot />
    </SupabaseProvider>
  );
}
