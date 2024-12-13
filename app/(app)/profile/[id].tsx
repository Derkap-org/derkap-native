import { Text, Pressable, View, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/auth-context";
import ProfileHeader from "@/components/group/ProfileHeader";
export default function Group() {
  const { user, signOut, profile } = useSupabase();

  return (
    <SafeAreaView className="flex-1">
      <ProfileHeader profile={profile} />
      <View className="w-full flex flex-col items-center gap-4">
        <View className="flex flex-col items-center justify-center gap-2">
          {profile.avatar_url ? (
            <Image
              src={`${profile.avatar_url}?t=${user.user_metadata.avatarTimestamp}`}
              alt={profile.username ?? ""}
              width={70}
              height={70}
              className="rounded-full w-24 h-24 object-cover border-2 border-custom-primary bg-custom-white"
            />
          ) : (
            <View className="flex items-center justify-center bg-custom-white rounded-full border border-custom-black w-24 h-24">
              <Text className="uppercase">
                {profile.username
                  .split(" ")
                  .map((word) => word.charAt(0))
                  .join("")}
              </Text>
            </View>
          )}
          <Text className="font-champ text-xl tracking-wider capitalize max-w-52 text-wrap overflow-hidden text-ellipsis text-center">
            {profile.username}
          </Text>
        </View>
      </View>
      <Text onPress={signOut} className="text-sm">
        Déconnexion
      </Text>
    </SafeAreaView>
  );
}
