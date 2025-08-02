import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useSupabase } from "@/context/auth-context";

export default function ProfileIndex() {
  const { profile } = useSupabase();

  useEffect(() => {
    if (profile?.username) {
      // Redirect to the dynamic profile route with the current user's username
      router.replace(`/profile/${profile.username}`);
    }
  }, [profile?.username]);

  // Show loading while we redirect
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}
