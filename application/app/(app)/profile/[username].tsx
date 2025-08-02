import { Text, View, TextInput } from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { useLocalSearchParams, router } from "expo-router";
import Button from "@/components/Button";
import { useSupabase } from "@/context/auth-context";
import ProfileHeader from "@/components/profile/ProfileHeader";
import * as ImagePicker from "expo-image-picker";
import {
  updateAvatarProfile,
  updateUsername,
  isUsernameAvailableInDB,
  deleteAccount,
  isAccountDeleting,
  cancelDeleteAccount,
} from "@/functions/profile-action";
import { getUserAndCheckFriendship } from "@/functions/friends-action";
import { getFeedbackLink } from "@/functions/feedback-action";
import { compressImage } from "@/functions/image-action";
import Toast from "react-native-toast-message";
import { Modal } from "@/components/modals/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import Avatar from "@/components/Avatar";
import { Pencil } from "lucide-react-native";
import { Pressable, ActivityIndicator } from "react-native";
import Tutorial from "@/components/Tutorial";
import { ExternalPathString, Link } from "expo-router";
import useFriendStore from "@/store/useFriendStore";
import { TUserWithFriendshipStatus } from "@/types/types";
import FriendActionButtons from "@/components/FriendActionButtons";

export default function ProfilePage() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const { user, signOut, profile, updateProfileImg, fetchProfile } = useSupabase();
  
  // State for current user's profile functionality
  const [isDeleting, setIsDeleting] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [feedbackLink, setFeedbackLink] = useState<ExternalPathString | null>(null);
  
  // State for other user's profile
  const [otherUserProfile, setOtherUserProfile] = useState<TUserWithFriendshipStatus[0] | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Check if this is the current user's profile
  const isOwnProfile = profile?.username === username;

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!username) return;
    
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      if (isOwnProfile) {
        // For own profile, we already have the data
        setProfileLoading(false);
        return;
      }
      
      // For other users, fetch their profile with friendship status
      const { data } = await getUserAndCheckFriendship(username);
      if (data && data.length > 0) {
        setOtherUserProfile(data[0]);
      } else {
        setProfileError("Utilisateur introuvable");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileError("Erreur lors du chargement du profil");
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchIsDeleting = async () => {
    if (isOwnProfile) {
      const isDeleting = await isAccountDeleting();
      setIsDeleting(isDeleting);
    }
  };

  const fetchFeedbackLink = async () => {
    if (isOwnProfile) {
      const link = await getFeedbackLink();
      setFeedbackLink(link as ExternalPathString);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchIsDeleting();
    fetchFeedbackLink();
  }, [username, profile?.username]);

  // Profile editing functions (only for own profile)
  const pickImage = async () => {
    if (!isOwnProfile) return;
    
    try {
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
      updateProfileImg(compressedPhoto.uri);
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
    if (isOwnProfile) {
      modalRef.current?.show();
      fetchIsDeleting();
    }
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
    if (isOwnProfile) {
      setNewUsername(profile?.username || "");
      modalEditUsernameRef.current?.show();
    }
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

  const handleShowTutorial = () => {
    setShowTutorial(true);
    modalRef.current?.hide();
  };

  const handleTutorialFinish = () => {
    setShowTutorial(false);
  };

  // If tutorial is showing, only render the tutorial
  if (showTutorial) {
    return <Tutorial onFinish={handleTutorialFinish} />;
  }

  // Loading state
  if (profileLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Chargement du profil...</Text>
      </View>
    );
  }

  // Error state
  if (profileError) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-white text-xl mb-4">{profileError}</Text>
        <Button
          text="Retour"
          onClick={() => router.back()}
          className="bg-custom-primary"
        />
      </View>
    );
  }

  // Get display data based on profile type
  const displayProfile = isOwnProfile ? profile : otherUserProfile;
  const displayUser = isOwnProfile ? user : null;

  if (!displayProfile) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-white text-xl mb-4">Profil introuvable</Text>
        <Button
          text="Retour"
          onClick={() => router.back()}
          className="bg-custom-primary"
        />
      </View>
    );
  }

  return (
    <>
      <View className="flex-1">
        <ProfileHeader showModal={isOwnProfile ? showModal : undefined} />
        <View className="flex flex-col items-center w-full gap-4">
          <View className="flex flex-col items-center justify-center gap-2">
            <Avatar
              profile={displayProfile}
              classNameContainer="border-2 border-custom-primary"
              user={displayUser}
              pickImage={isOwnProfile ? pickImage : undefined}
              classNameImage="w-24 h-24"
            />
            <View className="flex flex-row items-center gap-2">
              <Text className="overflow-hidden text-xl text-white tracking-wider text-center capitalize font-grotesque max-w-52 text-wrap text-ellipsis">
                {displayProfile.username}
              </Text>
              {isOwnProfile && (
                <Pressable onPress={showModalEditUsername}>
                  <Pencil size={20} color="white" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Friend action buttons for other users */}
          {!isOwnProfile && otherUserProfile && (
            <FriendActionButtons userProfile={otherUserProfile} onUpdate={fetchUserProfile} />
          )}

          {/* Feedback link only for own profile */}
          {isOwnProfile && feedbackLink && (
            <Link href={feedbackLink} target="_blank">
              <Text className="text-zinc-400 text-center font-bold underline">
                Aide-nous à amélorier Derkap en nous envoyant tes suggestions !
              </Text>
            </Link>
          )}
        </View>
      </View>

      {/* Settings modal only for own profile */}
      {isOwnProfile && (
        <>
          <Modal actionSheetRef={modalRef}>
            <Button
              withLoader={true}
              className="flex items-center justify-center w-full gap-2"
              onClick={handleShowTutorial}
              text={"Tutoriel"}
            />
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
                    Es-tu sûr de vouloir supprimer ton compte ? Cette action est
                    irréversible.
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
      )}
    </>
  );
}