import { Text, View, Image, TextInput } from "react-native";
import React, { useRef } from "react";
import Button from "@/components/Button";
import { useSupabase } from "@/context/auth-context";
import ProfileHeader from "@/components/group/ProfileHeader";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import { LogOut } from "lucide-react-native";

export default function Group() {
  const { user, signOut, profile } = useSupabase();

  const modalRef = useRef<SwipeModalPublicMethods>(null);
  const showModal = () => modalRef.current?.show();

  return (
    <>
      <View className="flex-1">
        <ProfileHeader showModal={showModal} />
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
            <Text
              // style={{ fontFamily: "Grotesque" }}
              className="font-grotesque text-xl tracking-wider capitalize max-w-52 text-wrap overflow-hidden text-ellipsis text-center"
            >
              {profile.username}
            </Text>
          </View>
        </View>
      </View>
      <SwipeModal
        ref={modalRef}
        showBar
        maxHeight={200}
        bg="white"
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col px-10 pt-10 bg-white pb-18 gap-y-4">
          <Button
            className="w-full bg-red-500 flex items-center justify-center gap-2"
            onPress={signOut}
            text={"Se déconnecter"}
          />
        </View>
      </SwipeModal>
    </>
  );
}
