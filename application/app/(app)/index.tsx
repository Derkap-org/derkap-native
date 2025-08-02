import {
  View,
  Text,
  Pressable,
  RefreshControl,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { Link, router } from "expo-router";
import { UserPlus, Plus, ChevronDown } from "lucide-react-native";
import { useSupabase } from "@/context/auth-context";
import DerkapCard from "@/components/derkap/DerkapCard";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import Avatar from "@/components/Avatar";
import useFriendStore from "@/store/useFriendStore";
import { TDerkapDB } from "@/types/types";
import {
  fetchDerkaps,
  fetchAllowedChallenges,
  fetchDerkapsByChallenge,
} from "@/functions/derkap-action";
import useMyChallengesStore from "@/store/useMyChallengesStore";
import Button from "@/components/Button";
import Tutorial from "@/components/Tutorial";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = () => {
  const { refreshMyChallenges, alreadyMadeThisChallenge } =
    useMyChallengesStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unrevealed">("all");
  const [showTutorial, setShowTutorial] = useState(false);

  // Challenge selector state
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(
    null,
  );
  const [availableChallenges, setAvailableChallenges] = useState<string[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [showChallengeSelector, setShowChallengeSelector] = useState(false);
  const [challengesPage, setChallengesPage] = useState(1);
  const [hasMoreChallenges, setHasMoreChallenges] = useState(true);

  const { requests, fetchRequests } = useFriendStore();
  const { user, profile, fetchFriendsCount, friendsCount } = useSupabase();

  const [derkaps, setDerkaps] = useState<TDerkapDB[]>([]);
  const [derkapsPage, setDerkapsPage] = useState(1);
  const [hasMoreDerkaps, setHasMoreDerkaps] = useState(true);
  const [derkapsLoading, setDerkapsLoading] = useState(false);
  const [friendsRequestsCount, setFriendsRequestsCount] = useState(0);

  // Fetch challenges function
  const fetchChallenges = async (page: number = 1, reset: boolean = true) => {
    try {
      setChallengesLoading(true);
      const { challenges, hasMore } = await fetchAllowedChallenges({ page });

      if (reset) {
        setAvailableChallenges(challenges);
        setChallengesPage(1);
      } else {
        setAvailableChallenges((prev) => [...prev, ...challenges]);
      }

      setHasMoreChallenges(hasMore);
      if (!reset) {
        setChallengesPage(page);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
      Toast.show({
        type: "error",
        text1: "Erreur lors du chargement des défis",
      });
    } finally {
      setChallengesLoading(false);
    }
  };

  const fetchMoreDerkaps = async () => {
    if (hasMoreDerkaps) {
      if (selectedChallenge) {
        await fetchDerkapsForChallenge({
          challenge: selectedChallenge,
          page: derkapsPage + 1,
          reset: false,
        });
      } else {
        await fetchDerkapsTimeline({ page: derkapsPage + 1, reset: false });
      }
      setDerkapsPage(derkapsPage + 1);
    }
  };

  useEffect(() => {
    setFriendsRequestsCount(
      requests.filter((friend) => friend.status === "pending").length,
    );
  }, [requests]);

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
        setHasMoreDerkaps(false);
      } else {
        setDerkaps(reset ? newDerkaps : [...derkaps, ...newDerkaps]);
      }
    } catch (error) {
      //console.error(error);
    } finally {
      setDerkapsLoading(false);
    }
  };

  const fetchDerkapsForChallenge = async ({
    challenge,
    page,
    reset,
  }: {
    challenge: string;
    page: number;
    reset: boolean;
  }) => {
    try {
      if (!user) {
        return;
      }
      setDerkapsLoading(true);
      const newDerkaps = await fetchDerkapsByChallenge({ challenge, page });
      if (newDerkaps.length === 0) {
        setHasMoreDerkaps(false);
      } else {
        setDerkaps(reset ? newDerkaps : [...derkaps, ...newDerkaps]);
      }
    } catch (error) {
      console.error("Error fetching derkaps for challenge:", error);
      Toast.show({
        type: "error",
        text1: "Erreur lors du chargement des derkaps",
      });
    } finally {
      setDerkapsLoading(false);
    }
  };

  const removeDerkapLocally = (derkap_id: number) => {
    setDerkaps(derkaps.filter((derkap) => derkap.id !== derkap_id));
  };

  const handleChallengeSelect = async (challenge: string | null) => {
    setSelectedChallenge(challenge);
    setShowChallengeSelector(false);
    setDerkapsPage(1);
    setHasMoreDerkaps(true);

    if (challenge) {
      await fetchDerkapsForChallenge({
        challenge,
        page: 1,
        reset: true,
      });
    } else {
      await fetchDerkapsTimeline({ page: 1, reset: true });
    }
  };

  // Check if tutorial has been seen
  const checkTutorialSeen = async () => {
    try {
      const tutorialSeen = await AsyncStorage.getItem("tutorialSeen");
      if (tutorialSeen !== "true") {
        setShowTutorial(true);
      }
    } catch (error) {
      console.error("Error checking tutorial state:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleRefresh();
      checkTutorialSeen();
    }, []),
  );

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchFriendsCount();
      await refreshMyChallenges();
      await fetchChallenges(1, true);

      if (selectedChallenge) {
        await fetchDerkapsForChallenge({
          challenge: selectedChallenge,
          page: 1,
          reset: true,
        });
      } else {
        await fetchDerkapsTimeline({ page: 1, reset: true });
      }

      await fetchRequests();
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

  const handleTutorialFinish = () => {
    setShowTutorial(false);
  };

  // If tutorial is showing, only render the tutorial
  if (showTutorial) {
    return <Tutorial onFinish={handleTutorialFinish} />;
  }

  const ChallengeSelector = () => (
    <View className="mb-4 px-4 relative z-10">
      <Pressable
        onPress={() => setShowChallengeSelector(!showChallengeSelector)}
        className="flex-row items-center justify-between p-3 bg-gray-700 rounded"
      >
        <Text className="text-white flex-1 mr-2" numberOfLines={1}>
          {selectedChallenge || "Tous les défis"}
        </Text>
        <ChevronDown size={20} color="white" />
      </Pressable>

      {showChallengeSelector && (
        <View className="absolute top-full left-4 right-4 mt-1 bg-gray-800 rounded max-h-48 shadow-lg border border-gray-600">
          <ScrollView
            onScrollEndDrag={({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } =
                nativeEvent;
              const isCloseToBottom =
                layoutMeasurement.height + contentOffset.y >=
                contentSize.height - 20;

              if (isCloseToBottom && hasMoreChallenges && !challengesLoading) {
                fetchChallenges(challengesPage + 1, false);
              }
            }}
          >
            <Pressable
              onPress={() => handleChallengeSelect(null)}
              className={`p-3 border-b border-gray-600 ${!selectedChallenge ? "bg-custom-primary" : ""}`}
            >
              <Text className="text-white">Tous les défis</Text>
            </Pressable>

            {availableChallenges.map((challenge, index) => (
              <Pressable
                key={index}
                onPress={() => handleChallengeSelect(challenge)}
                className={`p-3 border-b border-gray-600 ${selectedChallenge === challenge ? "bg-custom-primary" : ""}`}
              >
                <Text className="text-white" numberOfLines={2}>
                  {challenge}
                </Text>
              </Pressable>
            ))}

            {challengesLoading && (
              <View className="p-3">
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1">
      <View className="flex-row justify-between w-full px-8 mb-4">
        <Link href="/friends">
          <View className="relative flex-row items-center gap-x-2">
            <UserPlus size={30} color="white" />
            {friendsRequestsCount > 0 && (
              <View className="absolute flex items-center justify-center w-4 h-4 bg-red-500 rounded-full -top-0 -left-3">
                <Text className="text-xs text-white font-grotesque">
                  {friendsRequestsCount}
                </Text>
              </View>
            )}
          </View>
        </Link>
        <Link
          href={{
            pathname: "/profile",
          }}
        >
          <Avatar
            profile={profile}
            user={user}
            classNameImage="w-12 h-12"
            classNameContainer="border-2 border-custom-primary"
          />
        </Link>
      </View>

      <ChallengeSelector />

      <View className="flex-row justify-center px-4 mb-4 gap-x-4">
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
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <DerkapCard
              selectChallenge={handleChallengeSelect}
              removeDerkapLocally={removeDerkapLocally}
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
            <View className="px-4 py-4">
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
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {friendsCount === 0 ? (
            <View className="items-center justify-center gap-4 flex-1">
              <Text className="text-3xl text-center text-white font-grotesque">
                T'as pas d'amis ou quoi ?
              </Text>
              <Text className="text-lg text-center text-white font-grotesque">
                Ajoute des amis pour Derkapper
              </Text>
              <Button className="mt-4" onClick={() => router.push("/friends")}>
                <Text className="text-xl text-center text-white font-grotesque">
                  Ajouter des amis
                </Text>
              </Button>
            </View>
          ) : (
            <View className="items-center justify-center flex-1">
              <Text className="text-center text-white">
                {selectedChallenge
                  ? `Aucun derkap pour le défi "${selectedChallenge}"`
                  : "Aucun derkap pour le moment"}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      {friendsCount > 0 && (
        <Link href="/new" asChild>
          <Pressable className="absolute items-center justify-center w-20 h-20 rounded-full shadow-lg bottom-6 right-6 bg-custom-primary">
            <Plus size={30} color="white" />
          </Pressable>
        </Link>
      )}
    </View>
  );
};

export default Home;
