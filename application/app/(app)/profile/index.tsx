import { Text, View, TextInput } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import Button from "@/components/Button";
import { useSupabase } from "@/context/auth-context";
import ProfileHeader from "@/components/profile/ProfileHeader";
import * as ImagePicker from "expo-image-picker";
import {
  updateAvatarProfile,
  updateUsername,
  isUsernameAvailableInDB,
} from "@/functions/profile-action";
import Toast from "react-native-toast-message";
import { Modal } from "@/components/modals/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import Avatar from "@/components/Avatar";
import {
  deleteAccount,
  isAccountDeleting,
  cancelDeleteAccount,
} from "@/functions/profile-action";
import { compressImage } from "@/functions/image-action";
import { Pencil } from "lucide-react-native";
import { Pressable } from "react-native";

export default function Group() {
  const { user, signOut, profile, updateProfileImg, fetchProfile } =
    useSupabase();
  const [isDeleting, setIsDeleting] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIsDeleting = async () => {
    const isDeleting = await isAccountDeleting();
    setIsDeleting(isDeleting);
  };

  useEffect(() => {
    fetchIsDeleting();
  }, []);

  const pickImage = async () => {
    try {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2,
      });

      if (result.canceled) return;

      const imgUrl = result.assets[0].uri;

      const compressedPhoto = await compressImage({
        uri: imgUrl,
        width: 200,
        compression: 0.9,
      });

      await updateAvatarProfile(compressedPhoto.uri);
      updateProfileImg(compressedPhoto.uri); // todo improve this, and overall the profile img update
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la mise à jour de l'image",
        text2: error?.message || "Une erreur inconnue est survenue",
      });
    }
  };

  const modalRef = useRef<ActionSheetRef>(null);
  const showModal = () => {
    modalRef.current?.show();
    fetchIsDeleting();
  };

  const modalDeleteAccountRef = useRef<ActionSheetRef>(null);
  const showModalDeleteAccount = () => modalDeleteAccountRef.current?.show();

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      modalDeleteAccountRef.current?.hide();
      Toast.show({
        type: "success",
        text1: "Votre compte sera supprimé dans 7 jours",
      });
      // signOut();
      await fetchIsDeleting();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la suppression du compte",
        text2: error?.message || "Une erreur inconnue est survenue",
      });
    }
  };

  const handleCancelDeleteAccount = async () => {
    try {
      await cancelDeleteAccount();
      fetchIsDeleting();
      Toast.show({
        type: "success",
        text1: "La suppression de votre compte a été annulée",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l'annulation de la suppression du compte",
        text2: error?.message || "Une erreur inconnue est survenue",
      });
    }
  };

  // Username editing functions
  const modalEditUsernameRef = useRef<ActionSheetRef>(null);
  const showModalEditUsername = () => {
    setNewUsername(profile?.username || "");
    modalEditUsernameRef.current?.show();
  };

  const checkUsernameAvailability = async () => {
    if (newUsername === profile?.username) {
      setIsUsernameAvailable(true);
      return;
    }

    const isAvailable = await isUsernameAvailableInDB(newUsername);
    setIsUsernameAvailable(isAvailable);
  };

  useEffect(() => {
    if (newUsername.length > 2 && newUsername.length < 16) {
      const isValid = /^[a-zA-Z0-9]+$/.test(newUsername);
      setIsUsernameValid(isValid);
      checkUsernameAvailability();
    } else {
      setIsUsernameValid(false);
      setIsUsernameAvailable(false);
    }
  }, [newUsername]);

  const handleUpdateUsername = async () => {
    try {
      setIsLoading(true);
      await updateUsername(newUsername);
      await fetchProfile();
      modalEditUsernameRef.current?.hide();
      // Refresh profile data
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la mise à jour du pseudo",
        text2: error?.message || "Une erreur inconnue est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View className="flex-1">
        <ProfileHeader showModal={showModal} />
        <View className="flex flex-col items-center w-full gap-4">
          <View className="flex flex-col items-center justify-center gap-2">
            <Avatar
              profile={profile}
              classNameContainer="border-2 border-custom-primary"
              user={user}
              pickImage={pickImage}
              classNameImage="w-24 h-24"
            />
            <View className="flex flex-row items-center gap-2">
              <Text className="overflow-hidden text-xl text-white tracking-wider text-center capitalize font-grotesque max-w-52 text-wrap text-ellipsis">
                {profile?.username}
              </Text>
              <Pressable onPress={showModalEditUsername}>
                <Pencil size={20} color="white" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <Modal actionSheetRef={modalRef}>
        <Button
          withLoader={true}
          className="flex items-center justify-center w-full gap-2"
          onClick={signOut}
          text={"Se déconnecter"}
        />
        {isDeleting ? (
          <View className="flex flex-col gap-2 justify-center items-center">
            <Text className="text-white text-center font-bold text-2xl">
              Votre demande de suppression de compte a été prise en compte,
              votre compte sera supprimé sous 7 jours.
            </Text>
            <Button
              withLoader={true}
              className="flex items-center justify-center gap-2"
              onClick={handleCancelDeleteAccount}
              text={"Annuler la suppression"}
            />
          </View>
        ) : (
          <View className="flex flex-row gap-2 justify-center items-center">
            <Button
              withLoader={true}
              color="danger"
              className="flex items-center justify-center gap-2"
              textClassName="text-xs"
              onClick={showModalDeleteAccount}
              text={"Supprimer mon compte"}
            />
          </View>
        )}
        <Modal actionSheetRef={modalDeleteAccountRef}>
          {isDeleting ? (
            <View className="flex flex-col gap-2 justify-center items-center">
              <Text className="text-white text-center font-bold text-2xl">
                Votre demande de suppression de compte a été prise en compte,
                votre compte sera supprimé sous 7 jours.
              </Text>
              <Button
                withLoader={true}
                className="flex items-center justify-center gap-2"
                onClick={handleCancelDeleteAccount}
                text={"Annuler la suppression"}
              />
            </View>
          ) : (
            <>
              <Text className="text-white text-center font-bold">
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action
                est irréversible.
              </Text>

              <Button
                withLoader={true}
                color="green"
                className="flex items-center justify-center gap-2"
                onClick={() => modalDeleteAccountRef.current?.hide()}
                text={"Je garde mon compte"}
              />
              <View className="flex flex-row gap-2 justify-center items-center">
                <Button
                  withLoader={true}
                  color="danger"
                  className="flex items-center justify-center gap-2"
                  textClassName="text-xs"
                  onClick={handleDeleteAccount}
                  text={"Supprimer mon compte"}
                />
              </View>
            </>
          )}
        </Modal>
      </Modal>

      {/* Username Edit Modal */}
      <Modal actionSheetRef={modalEditUsernameRef}>
        <View className="flex flex-col gap-4">
          <Text className="text-white text-center font-bold text-xl">
            Modifier votre pseudo
          </Text>

          <TextInput
            onChangeText={setNewUsername}
            value={newUsername}
            placeholder="Nouveau pseudo"
            autoCapitalize="none"
            className="w-full h-16 p-4 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl mb-2"
          />

          <Text
            className={`text-white text-sm ${
              isUsernameAvailable ? "text-[#16a34a]" : "text-[#ff4747]"
            }`}
          >
            {newUsername.length < 3 || newUsername.length > 16
              ? "Le pseudo doit contenir entre 3 et 16 caractères"
              : !isUsernameValid
                ? "Le pseudo ne doit contenir que des lettres et des chiffres"
                : isUsernameAvailable
                  ? "✅ Ce pseudo est disponible"
                  : "❌ Ce pseudo est déjà pris"}
          </Text>

          <View className="flex flex-row gap-2 justify-center items-center">
            <Button
              withLoader={true}
              color="danger"
              className="flex items-center justify-center gap-2"
              onClick={() => modalEditUsernameRef.current?.hide()}
              text={"Annuler"}
            />
            <Button
              withLoader={isLoading}
              className="flex items-center justify-center gap-2"
              onClick={handleUpdateUsername}
              isCancel={
                !isUsernameValid ||
                !isUsernameAvailable ||
                isLoading ||
                newUsername === profile?.username
              }
              text={"Mettre à jour"}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
