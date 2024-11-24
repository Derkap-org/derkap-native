import { Redirect, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import "../../global.css";
import { useSupabase } from '../../context/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Champ': require('../../assets/fonts/champs/champs-Black.otf'),
  });

  const {session, isLoading} = useSupabase();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);
  

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/sign-in" />;
  }

  return (
      <Stack screenOptions={{
        headerShown: false,
      }} />
  );
}