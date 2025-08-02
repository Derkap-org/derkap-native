import { View, Text, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { TDerkapDB } from "@/types/types";
import { useSupabase } from "@/context/auth-context";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { fetchDerkapById } from "@/functions/derkap-action";
import useMyChallengesStore from "@/store/useMyChallengesStore";
import DerkapCard from "@/components/derkap/DerkapCard";

export default function DerkapPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSupabase();
  const { alreadyMadeThisChallenge } = useMyChallengesStore();

  // State
  const [derkap, setDerkap] = useState<TDerkapDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch derkap data
  const fetchDerkap = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const derkapData = await fetchDerkapById({ derkapId: parseInt(id) });
      setDerkap(derkapData);
    } catch (error) {
      console.error("Error fetching derkap:", error);
      setError(error.message || "Erreur lors du chargement du derkap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDerkap();
  }, [id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Derkap",
          headerShown: true,
          headerStyle: { backgroundColor: "#000" },
          headerTintColor: "#fff",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </Pressable>
          ),
        }}
      />

      {loading ? (
        <View className="flex-1 justify-center items-center bg-black">
          <ActivityIndicator size="large" color="white" />
        </View>
      ) : error || !derkap ? (
        <View className="flex-1 justify-center items-center bg-black px-4">
          <Text className="text-white text-xl mb-4">
            {error || "Derkap introuvable"}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="px-6 py-3 bg-custom-primary rounded-xl"
          >
            <Text className="text-white font-bold">Retour</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1 bg-black">
          <DerkapCard
            derkap={derkap}
            alreadyMadeThisChallenge={alreadyMadeThisChallenge(
              derkap.challenge,
            )}
            isStandalone={true}
            onBack={() => router.back()}
          />
        </View>
      )}
    </>
  );
}
