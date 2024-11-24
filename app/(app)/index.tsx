import { View, Text, Pressable, Image } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/auth-context";
const Home = () => {
  const { user, signOut, profile } = useSupabase();

  return (
    <SafeAreaView className="relative items-center justify-center flex-1">
      <Text className="absolute text-sm top-20 ">Bonjour {user.email} </Text>
      {profile?.avatar_url && (
        <Image
          source={{ uri: profile.avatar_url }}
          style={{ width: 200, height: 200 }}
        />
      )}

      <Text className="text-3xl text-red-700">Home</Text>

      <Link href="/sign-in" className="text-blue-700">
        Go to Login (should not be possible if already logged in)
      </Link>
      <Link
        href={{
          pathname: "/group/[id]",
          params: { id: "1" },
        }}
        className="text-blue-700"
      >
        Go to Group 1
      </Link>
      <Link
        href={{
          pathname: "/group/[id]",
          params: { id: "2" },
        }}
        className="text-blue-700"
      >
        Go to Group 2
      </Link>

      <Text onPress={signOut} className="absolute text-sm bottom-20 ">
        Déconnexion
      </Text>
    </SafeAreaView>
  );
};

export default Home;
