import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { TDerkapDB } from "@/types/types";
import useMyChallengesStore from "@/store/useMyChallengesStore";

interface DerkapGridProps {
  derkaps: TDerkapDB[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  emptyMessage?: string;
}

export default function DerkapGrid({
  derkaps,
  loading,
  refreshing,
  hasMore,
  onRefresh,
  onLoadMore,
  emptyMessage = "Aucun derkap pour le moment",
}: DerkapGridProps) {
  const { alreadyMadeThisChallenge } = useMyChallengesStore();

  const handleDerkapPress = (derkapId: number) => {
    router.push(`/derkap/${derkapId}`);
  };

  const renderDerkap = ({ item }: { item: TDerkapDB }) => {
    const hasAccess = alreadyMadeThisChallenge(item.challenge);

    return (
      <Pressable
        onPress={() => handleDerkapPress(item.id)}
        className="flex-1 aspect-square m-0.5 relative"
      >
        {/* Derkap Image */}
        <Image
          src={item.base64img}
          className="w-full h-full rounded-lg"
          blurRadius={!hasAccess ? 20 : 0}
        />

        {/* Overlay for locked derkaps */}
        {!hasAccess && (
          <View className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <Text className="text-white text-xs font-bold text-center px-1">
              🔒
            </Text>
          </View>
        )}

        {/* Challenge indicator */}
        <View className="absolute top-1 left-1 bg-black/70 rounded px-1 py-0.5">
          <Text className="text-white text-xs font-bold" numberOfLines={1}>
            {item.challenge.length > 15 
              ? `${item.challenge.substring(0, 15)}...` 
              : item.challenge}
          </Text>
        </View>

        {/* Comments count */}
        {/* We could add comments count here if we fetch it */}
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center py-12">
      <Text className="text-white text-center text-lg">
        {emptyMessage}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="white" />
      </View>
    );
  };

  return (
    <View className="flex-1">
      <FlatList
        data={derkaps}
        renderItem={renderDerkap}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ padding: 4 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
        onEndReached={() => {
          if (hasMore && !loading) {
            onLoadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      />
    </View>
  );
}