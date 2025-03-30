import {
  View,
  Text,
  Pressable,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { Link } from "expo-router";
import { UserPlus, Plus } from "lucide-react-native";
import { useSupabase } from "@/context/auth-context";
import DerkapCard from "@/components/derkap/DerkapCard";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import Avatar from "@/components/Avatar";
import useFriendStore from "@/store/useFriendStore";
import { TDerkapDB } from "@/types/types";
import { fetchDerkaps } from "@/functions/derkap-action";
import useMyChallengesStore from "@/store/useMyChallengesStore";

const Home = () => {
  const {
    challenges,
    isLoading: isLoadingChallenges,
    refreshChallenges,
    alreadyMadeThisChallenge,
  } = useMyChallengesStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unrevealed">("all");

  const { fetchFriends } = useFriendStore();
  const { user, profile } = useSupabase();

  const [derkaps, setDerkaps] = useState<TDerkapDB[]>([]);
  const [derkapsPage, setDerkapsPage] = useState(1);
  const [hasMoreDerkaps, setHasMoreDerkaps] = useState(true);
  const [derkapsLoading, setDerkapsLoading] = useState(false);

  const fetchMoreDerkaps = async () => {
    if (hasMoreDerkaps) {
      await fetchDerkapsTimeline({ page: derkapsPage + 1, reset: false });
      setDerkapsPage(derkapsPage + 1);
    }
  };

  const fetchDerkapsTimeline = async ({
    page,
    reset,
  }: {
    page: number;
    reset: boolean;
  }) => {
    try {
      if (!user) {
        return;
      }
      setDerkapsLoading(true);
      const newDerkaps = await fetchDerkaps({ page });
      if (newDerkaps.length === 0) {
        console.log("No more derkaps");
        setHasMoreDerkaps(false);
      } else {
        setDerkaps(reset ? newDerkaps : [...derkaps, ...newDerkaps]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDerkapsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
    }, []),
  );

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshChallenges();
      await fetchDerkapsTimeline({ page: 1, reset: true });
      setDerkapsPage(1);
      setHasMoreDerkaps(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors du rafraîchissement des derkaps",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const filteredDerkaps =
    activeFilter === "all"
      ? derkaps
      : derkaps.filter((derkap) => !alreadyMadeThisChallenge(derkap.challenge));

  return (
    <View className="flex-1">
      <View className="flex-row justify-between w-full px-8 mb-4">
        <Link href={{ pathname: "/friends/[id]", params: { id: user.id } }}>
          <View className="flex-row items-center gap-x-2">
            <UserPlus size={30} color="white" />
          </View>
        </Link>
        <Link
          href={{
            pathname: "/profile/[id]",
            params: { id: user.id },
          }}
        >
          <Avatar
            profile={profile}
            index={0}
            user={user}
            classNameImage="w-12 h-12"
            classNameContainer="border-2 border-custom-primary"
          />
        </Link>
      </View>

      <View className="flex-row justify-center gap-x-4 mb-4 px-4">
        <Pressable
          onPress={() => setActiveFilter("all")}
          className={`py-2 px-4 rounded ${
            activeFilter === "all" ? "bg-custom-primary" : "bg-gray-700"
          }`}
        >
          <Text className="text-white">Mes amis</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveFilter("unrevealed")}
          className={`py-2 px-4 rounded ${
            activeFilter === "unrevealed" ? "bg-custom-primary" : "bg-gray-700"
          }`}
        >
          <Text className="text-white">Non révélés</Text>
        </Pressable>
      </View>

      {filteredDerkaps.length > 0 ? (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          data={filteredDerkaps}
          renderItem={({ item }) => (
            <DerkapCard
              alreadyMadeThisChallenge={alreadyMadeThisChallenge(
                item.challenge,
              )}
              derkap={item}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={fetchMoreDerkaps}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <View className="py-4 px-4">
              {derkapsLoading ? (
                <ActivityIndicator size="large" color="white" />
              ) : !hasMoreDerkaps && filteredDerkaps.length > 0 ? (
                <Text className="text-center text-white">
                  Il n'y a plus de derkaps
                </Text>
              ) : null}
            </View>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-center text-white">
            Aucun derkap pour le moment
          </Text>
        </View>
      )}
      <Link href="/new" asChild>
        <Pressable className="absolute bottom-6 right-6 bg-custom-primary w-20 h-20 rounded-full items-center justify-center shadow-lg">
          <Plus size={30} color="white" />
        </Pressable>
      </Link>
    </View>
  );
};

export default Home;
