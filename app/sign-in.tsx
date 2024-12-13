import React from "react";

import Auth from "@/components/Auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/auth-context";
import { Redirect } from "expo-router";
export default function SignIn() {
  const { session } = useSupabase();

  if (!session) {
    return (
      <SafeAreaView className="flex-1">
        <Auth />
      </SafeAreaView>
    );
  }

  return <Redirect href="/" />;
}
