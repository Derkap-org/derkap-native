import { Text, View, Image, Pressable } from "react-native";
import React, { useRef, useState } from "react";
import Button from "@/components/Button";
import { useSupabase } from "@/context/auth-context";
import ProfileHeader from "@/components/group/ProfileHeader";
import * as ImagePicker from "expo-image-picker";
import { Pencil } from "lucide-react-native";
import { updateAvatarProfile } from "@/functions/profile-action";
import Toast from "react-native-toast-message";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";

export default function Group() {
  const [profileImage, setNewProfileImage] = useState<string | null>(null);
  const { user, signOut, profile, updateProfileImg } = useSupabase();

  const pickImage = async () => {
    try {
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
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la mise à jour de l'image",
        text2: error?.message || "Une erreur inconnue est survenue",
      });
    }
  };

  const modalRef = useRef<ActionSheetRef>(null);
  const showModal = () => modalRef.current?.show();

  return (
    <>
      <View className="flex-1">
        <ProfileHeader showModal={showModal} />
        <View className="flex flex-col items-center w-full gap-4">
          <View className="flex flex-col items-center justify-center gap-2">
            {/* {profile.avatar_url || profileImage ? (
              <View className="relative bg-red-400">
                <Button
                  onClick={pickImage}
                  className="absolute bottom-0 right-0"
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
                  className="object-cover w-24 h-24 border-2 rounded-full border-custom-primary bg-custom-white"
                />
              </View>
            ) : ( */}
            <View className="relative flex items-center justify-center w-24 h-24 border-2 rounded-full bg-custom-white border-custom-primary">
              <Pressable
                onPress={pickImage}
                className="absolute z-10 p-2 rounded-full -right-2 -top-2 bg-custom-primary"
              >
                <Pencil size={20} color={"white"} />
              </Pressable>
              {profile?.avatar_url || profileImage ? (
                <Image
                  src={
                    profileImage ||
                    `${profile?.avatar_url}?t=${user.user_metadata.avatarTimestamp}`
                  }
                  alt={profile?.username ?? ""}
                  width={70}
                  height={70}
                  className="object-cover w-24 h-24 border-2 rounded-full border-custom-primary bg-custom-white"
                />
              ) : (
                <Text className="uppercase">
                  {profile?.username
                    .split(" ")
                    .map((word) => word.charAt(0))
                    .join("")}
                </Text>
              )}
            </View>
            {/* )} */}
            <Text
              // style={{ fontFamily: "Grotesque" }}
              className="overflow-hidden text-xl tracking-wider text-center capitalize font-grotesque max-w-52 text-wrap text-ellipsis"
            >
              {profile?.username}
            </Text>
          </View>
        </View>
      </View>
      <Modal actionSheetRef={modalRef}>
        <Button
          withLoader={true}
          className="flex items-center justify-center w-full gap-2 bg-red-500"
          onClick={signOut}
          text={"Se déconnecter"}
        />
      </Modal>
    </>
  );
}
