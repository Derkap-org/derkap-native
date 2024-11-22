import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Champ': require('../assets/fonts/champs/champs-Black.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return (
      <Stack screenOptions={{
        headerShown: false,
      }} />
  );
}