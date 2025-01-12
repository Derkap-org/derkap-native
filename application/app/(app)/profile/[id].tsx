import { Text, View, Image, Pressable } from "react-native";
import React, { useRef, useState } from "react";
import Button from "@/components/Button";
import { useSupabase } from "@/context/auth-context";
import ProfileHeader from "@/components/group/ProfileHeader";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import * as ImagePicker from "expo-image-picker";
import { Pencil } from "lucide-react-native";
import { updateAvatarProfile } from "@/functions/profile-action";

export default function Group() {
  const [profileImage, setNewProfileImage] = useState<string | null>(null);
  const { user, signOut, profile, updateProfileImg } = useSupabase();

  const pickImage = async () => {
    console.log("pickImage");
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
    });

    if (result.canceled) return;

    const imgUrl = result.assets[0].uri;

    setNewProfileImage(imgUrl);

    await updateAvatarProfile(imgUrl);
    updateProfileImg(imgUrl); // todo improve this, and overall the profile img update
  };

  const modalRef = useRef<SwipeModalPublicMethods>(null);
  const showModal = () => modalRef.current?.show();

  return (
    <>
      <View className="flex-1">
        <ProfileHeader showModal={showModal} />
        <View className="w-full flex flex-col items-center gap-4">
          <View className="flex flex-col items-center justify-center gap-2">
            {/* {profile.avatar_url || profileImage ? (
              <View className="relative bg-red-400">
                <Button
                  onClick={pickImage}
                  className="absolute right-0 bottom-0"
                  text={<Pencil size={32} />}
                ></Button>
                <Image
                  src={
                    profileImage ||
                    `${profile.avatar_url}?t=${user.user_metadata.avatarTimestamp}`
                  }
                  alt={profile.username ?? ""}
                  width={70}
                  height={70}
                  className="rounded-full w-24 h-24 object-cover border-2 border-custom-primary bg-custom-white"
                />
              </View>
            ) : ( */}
            <View className="relative flex items-center justify-center bg-custom-white rounded-full border-2 border-custom-primary w-24 h-24">
              <Pressable
                onPress={pickImage}
                className="absolute -right-2 -top-2 bg-custom-primary rounded-full p-2 z-10"
              >
                <Pencil size={20} color={"white"} />
              </Pressable>
              {profile.avatar_url || profileImage ? (
                <Image
                  src={
                    profileImage ||
                    `${profile.avatar_url}?t=${user.user_metadata.avatarTimestamp}`
                  }
                  alt={profile.username ?? ""}
                  width={70}
                  height={70}
                  className="rounded-full w-24 h-24 object-cover border-2 border-custom-primary bg-custom-white"
                />
              ) : (
                <Text className="uppercase">
                  {profile.username
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")}
                </Text>
              )}
            </View>
            {/* )} */}
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
        maxHeight={400}
        bg="white"
        style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        wrapInGestureHandlerRootView
      >
        <View className="flex flex-col px-10 pt-10 bg-white pb-18 gap-y-4">
          <Button
            withLoader={true}
            className="w-full bg-red-500 flex items-center justify-center gap-2"
            onClick={signOut}
            text={"Se déconnecter"}
          />
        </View>
      </SwipeModal>
    </>
  );
}
