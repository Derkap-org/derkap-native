import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { TCommentDB, TDerkapDB } from "@/types/types";
import { useSupabase } from "@/context/auth-context";
import {
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";
import { ArrowLeft, EyeIcon, Ellipsis } from "lucide-react-native";
import Toast from "react-native-toast-message";
import Button from "@/components/Button";
import { Modal } from "@/components/modals/Modal";
import { Comment } from "@/components/comment/Comment";
import ProfilePicture from "@/components/ProfilePicture";
import ChallengeBox from "@/components/ChallengeBox";
import { ActionSheetRef } from "react-native-actions-sheet";
import { createComment, getCommentsFromDB } from "@/functions/comments-action";
import {
  removeAllowedUser,
  fetchAllowedUsers,
  addAllowedUser,
  deleteDerkap,
} from "@/functions/derkap-action";
import useFriendStore from "@/store/useFriendStore";
import useMyChallengesStore from "@/store/useMyChallengesStore";
import { reportContent } from "@/functions/reporting-action";
import { TProfileDB } from "@/types/types";

export default function DerkapPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSupabase();
  const { friends, fetchFriends } = useFriendStore();
  const { alreadyMadeThisChallenge } = useMyChallengesStore();

  // State
  const [derkap, setDerkap] = useState<TDerkapDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<TCommentDB[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState<TProfileDB[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Animation
  const heartScale = useRef(new Animated.Value(0)).current;

  // Modal refs
  const modalCommentRef = useRef<ActionSheetRef>(null);
  const modalVisibilityRef = useRef<ActionSheetRef>(null);
  const modalActionsRef = useRef<ActionSheetRef>(null);
  const modalDeleteRef = useRef<ActionSheetRef>(null);
  const modalAddUserRef = useRef<ActionSheetRef>(null);

  // Fetch derkap data
  const fetchDerkap = async () => {
    if (!id) return;

    try {
      setLoading(true);
      // We'll use the existing fetchDerkaps function and filter by id
      // This ensures we only get derkaps the user is allowed to see
      const { supabase } = await import("@/lib/supabase");
      
      const user_session = await supabase.auth.getUser();
      const user_id = user_session.data.user?.id;
      
      if (!user_session || !user_id) {
        throw new Error("Not authorized");
      }

      // Query the specific derkap
      const { data, error } = await supabase
        .from("derkap_allowed_users")
        .select(
          `
          *,
          derkap(
            id,
            created_at,
            challenge,
            caption,
            file_path,
            base_key,
            creator_id,
            derkap_allowed_users(
              profile(*)
            ),
            creator:creator_id(
              id,
              username,
              avatar_url,
              created_at,
              email
          )
        )
        `,
        )
        .eq("allowed_user_id", user_id)
        .eq("derkap.id", parseInt(id))
        .single();

      if (error) {
        throw new Error("Derkap introuvable ou accès non autorisé");
      }

      if (!data?.derkap) {
        throw new Error("Derkap introuvable");
      }

      // Get the encrypted photo and decrypt it
      const filePath = data.derkap.file_path;
      
      const { data: file, error: errorDownload } = await supabase.storage
        .from("derkap_photos")
        .download(filePath);
        
      if (errorDownload) {
        throw new Error("Erreur lors du chargement de l'image");
      }

      // Import encryption functions
      const { decryptPhoto, getEncryptionKey } = await import("@/functions/encryption-action");
      
      const encryptionKey = await getEncryptionKey({
        derkap_id: data.derkap.id,
      });

      const decryptedPost = await decryptPhoto({
        encryptedBlob: file,
        encryptionKey,
      });

      const photo = `data:image/jpeg;base64,${decryptedPost}`;

      const derkapWithPhoto: TDerkapDB = {
        ...data.derkap,
        base64img: photo,
        derkap_allowed_users: data.derkap.derkap_allowed_users.map(
          (user) => user.profile,
        ),
      };

      setDerkap(derkapWithPhoto);
      setAllowedUsers(derkapWithPhoto.derkap_allowed_users);
    } catch (error) {
      console.error("Error fetching derkap:", error);
      setError(error.message || "Erreur lors du chargement du derkap");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments
  const handleFetchComments = async () => {
    if (!id) return;
    try {
      const comments = await getCommentsFromDB({ derkap_id: parseInt(id) });
      setComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Create comment
  const handleCreateComment = async () => {
    if (!newComment.trim() || !derkap) return;

    try {
      setPostingComment(true);
      await createComment({
        derkap_id: derkap.id,
        comment: newComment.trim(),
      });
      setNewComment("");
      await handleFetchComments();
      Toast.show({
        type: "success",
        text1: "Commentaire ajouté",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l'ajout du commentaire",
      });
    } finally {
      setPostingComment(false);
    }
  };

  // Double tap animation
  const handleDoubleTap = () => {
    setShowHeart(true);
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHeart(false);
    });
  };

  // Modal handlers
  const openModalComment = () => modalCommentRef.current?.show();
  const openModalVisibility = () => {
    handleFetchAllowedUsers();
    modalVisibilityRef.current?.show();
  };
  const openModalActions = () => modalActionsRef.current?.show();
  const openModalDelete = () => modalDeleteRef.current?.show();

  // Visibility management
  const handleFetchAllowedUsers = async () => {
    if (!derkap) return;
    try {
      const users = await fetchAllowedUsers({ derkap_id: derkap.id });
      setAllowedUsers(users);
    } catch (error) {
      console.error("Error fetching allowed users:", error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!derkap) return;
    try {
      await removeAllowedUser({
        derkap_id: derkap.id,
        allowed_user_id: userId,
      });
      await handleFetchAllowedUsers();
      Toast.show({
        type: "success",
        text1: "Utilisateur retiré",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors du retrait",
      });
    }
  };

  const handleAddUsers = async () => {
    if (!derkap || selectedUsers.length === 0) return;
    try {
      await Promise.all(
        selectedUsers.map((userId) =>
          addAllowedUser({
            derkap_id: derkap.id,
            allowed_user_id: userId,
          }),
        ),
      );
      setSelectedUsers([]);
      await handleFetchAllowedUsers();
      modalAddUserRef.current?.hide();
      Toast.show({
        type: "success",
        text1: "Utilisateurs ajoutés",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l'ajout",
      });
    }
  };

  // Delete derkap
  const handleDeleteDerkap = async () => {
    if (!derkap) return;
    try {
      await deleteDerkap({ derkap_id: derkap.id });
      Toast.show({
        type: "success",
        text1: "Derkap supprimé",
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la suppression",
      });
    }
  };

  // Report derkap
  const handleReportDerkap = async () => {
    if (!derkap) return;
    try {
      await reportContent({
        derkap_id: derkap.id,
        reason: "Derkap inapproprié",
      });
      Toast.show({
        text1: "Derkap signalé",
        type: "success",
      });
      modalActionsRef.current?.hide();
    } catch (error) {
      console.error("Error reporting derkap:", error);
    }
  };

  useEffect(() => {
    fetchDerkap();
    fetchFriends();
  }, [id]);

  useEffect(() => {
    if (derkap) {
      handleFetchComments();
    }
  }, [derkap]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Chargement du derkap...</Text>
      </View>
    );
  }

  if (error || !derkap) {
    return (
      <View className="flex-1 justify-center items-center bg-black px-4">
        <Text className="text-white text-xl mb-4">{error || "Derkap introuvable"}</Text>
        <Button
          text="Retour"
          onClick={() => router.back()}
          className="bg-custom-primary"
        />
      </View>
    );
  }

  const isOwner = user?.id === derkap.creator_id;
  const hasAccess = alreadyMadeThisChallenge(derkap.challenge);

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
      
      <ScrollView className="flex-1 bg-black">
        <View className="flex flex-col items-center justify-center w-full p-4">
          {/* Challenge Box */}
          <ChallengeBox
            challenge={derkap.challenge}
            setChallenge={() => {}}
            isChallengeChangeable={false}
          />

          {/* Image Container */}
          <View className="w-full aspect-[4/5] relative mt-4">
            {!hasAccess && (
              <View className="absolute z-20 flex items-center justify-center w-full h-full bg-black/50">
                <View className="flex flex-col items-center gap-y-4">
                  <Text className="text-2xl font-bold text-center text-white">
                    Révèle son Derkap !
                  </Text>
                  <Pressable
                    onPress={() => router.push({
                      pathname: "/new",
                      params: {
                        challenge: derkap.challenge,
                        followingUsers: derkap.derkap_allowed_users.map(
                          (user) => user.id,
                        ),
                      },
                    })}
                    className="px-6 py-3 bg-custom-primary rounded-xl"
                  >
                    <Text className="text-lg font-bold text-white">Capturer</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Caption */}
            {derkap.caption && (
              <View className="absolute bottom-0 left-0 right-0 z-10 flex-row items-start justify-between p-4">
                <View className="w-full p-4 bg-zinc-800/80 rounded-xl">
                  <Text className="text-center text-white font-grotesque">
                    {derkap.caption}
                  </Text>
                </View>
              </View>
            )}

            {/* Creator Info */}
            <View className="absolute z-30 flex flex-row items-center justify-between px-4 py-2 top-2 left-4 bg-zinc-800/50 rounded-xl">
              <View className="flex flex-row items-center gap-x-2">
                <ProfilePicture
                  avatar_url={derkap.creator.avatar_url}
                  username={derkap.creator.username}
                  userId={derkap.creator.id}
                />
                <Pressable onPress={() => router.push(`/profile/${derkap.creator.username}`)}>
                  <Text className="text-lg font-bold text-white">
                    {derkap.creator.username}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="absolute z-30 flex flex-row items-center justify-between gap-x-3 top-2 right-4">
              <Pressable
                onPress={openModalVisibility}
                className="p-2 rounded-full bg-zinc-800/50"
              >
                <EyeIcon className="w-6 h-6 text-white" color="white" />
              </Pressable>
              <Pressable onPress={openModalActions}>
                <Ellipsis className="w-6 h-6 text-white" color="white" />
              </Pressable>
            </View>

            {/* Heart Animation */}
            {showHeart && (
              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 20,
                  transform: [{ scale: heartScale }],
                }}
              >
                <Text className="pt-10 font-bold text-white text-9xl">🤣</Text>
              </Animated.View>
            )}

            {/* Image */}
            <TapGestureHandler
              numberOfTaps={2}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.ACTIVE) {
                  handleDoubleTap();
                }
              }}
            >
              <Image
                src={derkap.base64img}
                className="w-full h-full rounded-xl"
                blurRadius={!hasAccess ? 30 : 0}
              />
            </TapGestureHandler>
          </View>

          {/* Comments Section */}
          <View className="flex flex-row items-center justify-end w-full px-4 mt-2">
            <Pressable className="px-4 py-2" onPress={openModalComment}>
              <Text className="text-white font-grotesque">
                {comments?.length || 0} commentaires
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Comments Modal */}
      <Modal fullScreen={true} actionSheetRef={modalCommentRef}>
        <View className="flex flex-col h-full">
          <Text className="py-4 text-2xl font-bold text-center text-white font-grotesque">
            Commentaires
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className="flex-col flex-1 gap-y-2"
          >
            {comments?.length > 0 ? (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  refreshComments={handleFetchComments}
                />
              ))
            ) : (
              <Text className="text-center text-gray-500">
                Aucun commentaire pour le moment
              </Text>
            )}
          </ScrollView>
          {hasAccess ? (
            <View className="flex flex-col items-center justify-center px-4 py-4 gap-y-2">
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                className="w-full p-2 text-white bg-zinc-800 placeholder:text-zinc-400 rounded-xl"
                placeholder="Ajouter un commentaire"
              />
              <Button
                className="w-full rounded-xl"
                isCancel={
                  postingComment || !newComment || newComment.length === 0
                }
                text="Envoyer"
                onClick={handleCreateComment}
                withLoader={true}
              />
            </View>
          ) : (
            <View className="p-4">
              <Text className="text-center text-gray-500">
                Vous devez révéler votre Derkap pour commenter
              </Text>
            </View>
          )}
        </View>
      </Modal>

      {/* Visibility Modal - Similar to DerkapCard but simplified for this context */}
      <Modal actionSheetRef={modalVisibilityRef}>
        {/* ... visibility modal content similar to DerkapCard ... */}
      </Modal>

      {/* Actions Modal */}
      <Modal actionSheetRef={modalActionsRef}>
        {isOwner ? (
          <>
            <Button
              text="Supprimer le Derkap"
              onClick={openModalDelete}
              color="danger"
            />
          </>
        ) : (
          <Button
            text="Signaler le Derkap"
            onClick={handleReportDerkap}
            color="danger"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal actionSheetRef={modalDeleteRef}>
        <Text className="text-white text-center font-bold mb-4">
          Êtes-vous sûr de vouloir supprimer ce Derkap ?
        </Text>
        <View className="flex flex-row gap-2">
          <Button
            text="Annuler"
            onClick={() => modalDeleteRef.current?.hide()}
            color="green"
            className="flex-1"
          />
          <Button
            text="Supprimer"
            onClick={handleDeleteDerkap}
            color="danger"
            className="flex-1"
          />
        </View>
      </Modal>
    </>
  );
}