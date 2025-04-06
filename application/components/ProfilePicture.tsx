import { View, Image, Text } from "react-native";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AVATAR_CACHE_PREFIX = "avatar_cache_";
const AVATAR_CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function ProfilePicture({
  avatar_url,
  username,
  imgClassName,
  userId,
}: {
  avatar_url: string | null;
  username: string | null;
  imgClassName?: string;
  userId: string;
}) {
  const [cachedAvatarUri, setCachedAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const loadCachedAvatar = async () => {
      if (!avatar_url) return;

      try {
        const cacheKey = `${AVATAR_CACHE_PREFIX}${userId}`;
        const cached = await AsyncStorage.getItem(cacheKey);

        if (cached) {
          const { uri, timestamp } = JSON.parse(cached);

          // Check if cache is still valid
          if (Date.now() - timestamp < AVATAR_CACHE_EXPIRY) {
            setCachedAvatarUri(uri);
            return;
          }
        }

        // If no cache or expired, fetch and cache
        const response = await fetch(avatar_url);
        const blob = await response.blob();

        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        // Cache the new image
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({
            uri: base64Data,
            timestamp: Date.now(),
          }),
        );

        setCachedAvatarUri(base64Data);
      } catch (error) {
        setCachedAvatarUri(avatar_url); // Fallback to original URL
      }
    };

    loadCachedAvatar();
  }, [avatar_url, userId]);

  return (
    <View className={`rounded-full overflow-hidden`}>
      {avatar_url ? (
        <Image
          source={{
            uri: cachedAvatarUri || avatar_url,
          }}
          className={cn("w-10 h-10 rounded-full", imgClassName)}
        />
      ) : (
        <View
          className={cn(
            "items-center justify-center w-10 h-10 bg-black rounded-full",
            imgClassName,
          )}
        >
          <Text className="text-sm text-gray-300">
            {username?.charAt(0) || "?"}
          </Text>
        </View>
      )}
    </View>
  );
}
