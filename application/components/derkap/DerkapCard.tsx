import {
  View,
  ViewProps,
  Text,
  Image,
  ScrollView,
  TextInput,
  Keyboard,
  Pressable,
  Animated,
  FlatList,
} from "react-native";
import { TCommentDB, TDerkapDB, TProfileDB } from "@/types/types";
import { cn } from "@/lib/utils";
import Button from "../Button";
import { ActionSheetRef } from "react-native-actions-sheet";
import { useRef, useState, useEffect } from "react";
import { Modal } from "@/components/modals/Modal";
import { Comment } from "@/components/comment/Comment";
import Toast from "react-native-toast-message";
import { createComment, getCommentsFromDB } from "@/functions/comments-action";
import React from "react";
import {
  TapGestureHandler,
  State,
  Swipeable,
} from "react-native-gesture-handler";
import ChallengeBox from "@/components/ChallengeBox";
import { Link } from "expo-router";
import { EyeIcon, Plus, Ellipsis } from "lucide-react-native";
import { useSupabase } from "@/context/auth-context";
import {
  removeAllowedUser,
  fetchAllowedUsers,
  addAllowedUser,
} from "@/functions/derkap-action";
import useFriendStore from "@/store/useFriendStore";
import { deleteDerkap } from "@/functions/derkap-action";
import useMyChallengesStore from "@/store/useMyChallengesStore";

interface DerkapCardProps extends ViewProps {
  derkap: TDerkapDB;
  alreadyMadeThisChallenge: boolean;
  removeDerkapLocally: (derkap_id: number) => void;
}

export default function DerkapCard({
  derkap,
  className,
  alreadyMadeThisChallenge,
  removeDerkapLocally,
  ...props
}: DerkapCardProps) {
  const [comments, setComments] = useState<TCommentDB[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const modalAddUserRef = useRef<ActionSheetRef>(null);

  const [showHeart, setShowHeart] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const { user } = useSupabase();
  const { friends, fetchFriends } = useFriendStore();
  const [allowedUsers, setAllowedUsers] = useState<TProfileDB[]>(
    derkap.derkap_allowed_users,
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    setAllowedUsers(derkap.derkap_allowed_users);
  }, [derkap]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleFetchAllowedUsers = async () => {
    const allowedUsers = await fetchAllowedUsers({ derkap_id: derkap.id });
    setAllowedUsers(allowedUsers);
  };

  const modalCommentRef = useRef<ActionSheetRef>(null);
  const modalVisibilityRef = useRef<ActionSheetRef>(null);
  const modalActionsRef = useRef<ActionSheetRef>(null);
  const modalDeleteRef = useRef<ActionSheetRef>(null);

  const handleFetchComments = async () => {
    const comments = await getCommentsFromDB({ derkap_id: derkap.id });
    setComments(comments);
  };

  useEffect(() => {
    handleFetchComments();
  }, []);

  const likeDerkap = async ({ derkap_id }: { derkap_id: number }) => {
    console.log("like derkap", derkap_id);
  };

  const handleLike = async () => {
    await likeDerkap({ derkap_id: derkap.id });
  };

  const handleRemoveAllowedUser = async (userId: string) => {
    await removeAllowedUser({ derkap_id: derkap.id, allowed_user_id: userId });
    await handleFetchAllowedUsers();
  };

  const handleAddAllowedUser = async (userId: string) => {
    await addAllowedUser({ derkap_id: derkap.id, allowed_user_id: userId });
  };

  const animateHeart = () => {
    setShowHeart(true);
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(heartScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowHeart(false);
    });
  };

  const handleDoubleTap = async () => {
    animateHeart();
    await handleLike();
  };

  const handleCreateComment = async () => {
    if (!newComment) return;
    Keyboard.dismiss();
    try {
      setPostingComment(true);
      await createComment({
        derkap_id: derkap.id,
        content: newComment,
      });
      await handleFetchComments();
      setNewComment("");
    } catch (error) {
      console.log("error", error);
      Toast.show({
        text1: "Erreur lors de la création du commentaire",
        type: "error",
      });
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteDerkap = async () => {
    await deleteDerkap({ derkap_id: derkap.id });
    removeDerkapLocally(derkap.id);
    modalDeleteRef.current?.hide();
  };

  const openModalComment = async () => {
    modalCommentRef.current?.show();
    await handleFetchComments();
  };
  const openModalVisibility = async () => {
    modalVisibilityRef.current?.show();
    await handleFetchAllowedUsers();
  };

  const openModalAddUser = () => {
    setSelectedUsers([]);
    modalAddUserRef.current?.show();
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleConfirmSelection = async () => {
    for (const userId of selectedUsers) {
      await handleAddAllowedUser(userId);
    }
    await handleFetchAllowedUsers();
    modalAddUserRef.current?.hide();
  };

  const openModalActions = async () => {
    modalActionsRef.current?.show();
  };

  const openModalDelete = async () => {
    modalDeleteRef.current?.show();
  };

  return (
    <View
      className={cn(
        "flex flex-col items-center justify-center w-full my-6",
        className,
      )}
      {...props}
    >
      <Link
        disabled={derkap.creator_id === user.id}
        href={{
          pathname: "/new",
          params: {
            challenge: derkap.challenge,
            followingUsers: derkap.derkap_allowed_users.map((user) => user.id),
          },
        }}
      >
        <ChallengeBox
          challenge={derkap.challenge}
          setChallenge={() => {}}
          isChallengeChangeable={false}
        />
      </Link>

      <View className="w-full aspect-[4/5] relative">
        {!alreadyMadeThisChallenge && (
          <View className="absolute z-20 flex items-center justify-center w-full h-full bg-black/50">
            <View className="flex flex-col items-center gap-y-4">
              <Text className="text-2xl font-bold text-center text-white">
                Révèle son Derkap !
              </Text>
              <Link
                href={{
                  pathname: "/new",
                  params: {
                    challenge: derkap.challenge,
                    followingUsers: derkap.derkap_allowed_users.map(
                      (user) => user.id,
                    ),
                  },
                }}
                className="px-6 py-3 bg-custom-primary rounded-xl"
              >
                <Text className="text-lg font-bold text-white">Capturer</Text>
              </Link>
            </View>
          </View>
        )}
        {derkap.caption && (
          <View className="absolute bottom-0 left-0 right-0 z-10 flex-row items-start justify-between p-4">
            <View className="w-full p-4 bg-zinc-800/80 rounded-xl">
              <Text className="text-center text-white font-grotesque">
                {derkap.caption}
              </Text>
            </View>
          </View>
        )}
        <View className="absolute z-30 flex flex-row items-center justify-between px-4 py-2 top-2 left-4 bg-zinc-800/50 rounded-xl">
          <View className="flex flex-row items-center gap-x-2">
            <View className={`rounded-full overflow-hidden`}>
              {derkap.creator.avatar_url ? (
                <Image
                  source={{
                    uri: `${derkap.creator.avatar_url}?t=${new Date().getTime()}`,
                  }}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <View className="items-center justify-center w-10 h-10 bg-black rounded-full">
                  <Text className="text-sm text-gray-300">
                    {derkap.creator.username?.charAt(0) || "?"}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-lg font-bold text-white">
              {derkap.creator.username}
            </Text>
          </View>
        </View>

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
            className="w-full h-full"
            blurRadius={!alreadyMadeThisChallenge ? 10 : 0}
          />
        </TapGestureHandler>
      </View>
      <View className="flex flex-row items-center justify-end w-full px-4 mt-2">
        {/* <Pressable
          className="px-4 py-2"
          onPress={() => {
            likeDerkap({ derkap_id: derkap.id });
          }}
        >
          <View className="relative flex flex-row items-center gap-x-2">
            <Text className="absolute z-10 p-1 text-center text-white rounded-full -top-3 -right-2 bg-black/50 font-grotesque">
              12
            </Text>
            <Text className="text-4xl text-white font-grotesque">🤣</Text>
          </View>
        </Pressable> */}
        <Pressable className="px-4 py-2" onPress={openModalComment}>
          <Text className="text-white font-grotesque">
            {comments?.length || 0} commentaires
          </Text>
        </Pressable>
      </View>
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
        </View>
      </Modal>
      <Modal fullScreen={true} actionSheetRef={modalVisibilityRef}>
        <View className="flex flex-col h-full">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-2xl font-bold font-grotesque text-center py-4 text-white">
              Qui peut voir ce Derkap ?
            </Text>
            <Pressable
              onPress={openModalAddUser}
              className="p-2 bg-custom-primary rounded-full"
            >
              <Plus size={24} color="white" />
            </Pressable>
          </View>
          <Text className="py-4 text-2xl font-bold text-center text-white font-grotesque">
            Qui peut voir ce Derkap ?
          </Text>
          <FlatList
            data={allowedUsers}
            renderItem={({ item }) => (
              <AllowedUser
                profile={item}
                userIdConnected={user.id}
                onRemove={handleRemoveAllowedUser}
              />
            )}
          />
        </View>
        <Modal fullScreen={true} actionSheetRef={modalAddUserRef}>
          <View className="flex flex-col h-full">
            <Text className="text-2xl font-bold font-grotesque text-center py-4 text-white">
              Ajouter des amis
            </Text>
            <FlatList
              data={friends}
              renderItem={({ item }) => {
                const isAlreadyAllowed = allowedUsers.some(
                  (user) => user.id === item.profile.id,
                );
                const isSelected = selectedUsers.includes(item.profile.id);
                return (
                  <Pressable
                    onPress={() => {
                      if (!isAlreadyAllowed) {
                        handleSelectUser(item.profile.id);
                      }
                    }}
                    className={`flex-row items-center p-3 border-b border-gray-700 ${
                      isAlreadyAllowed ? "opacity-50" : ""
                    }`}
                  >
                    {item.profile.avatar_url ? (
                      <Image
                        source={{ uri: item.profile.avatar_url }}
                        className="w-10 h-10 rounded-full mr-4"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full mr-4 bg-gray-700" />
                    )}
                    <Text className="flex-1 text-lg font-grotesque text-white">
                      {item.profile.username}
                    </Text>
                    {isAlreadyAllowed ? (
                      <Text className="text-custom-primary">Déjà ajouté</Text>
                    ) : (
                      <View
                        className={`w-6 h-6 rounded-full border-2 ${
                          isSelected
                            ? "border-custom-primary"
                            : "border-gray-500"
                        }`}
                        style={{
                          backgroundColor: isSelected
                            ? "#9333EA"
                            : "transparent",
                        }}
                      />
                    )}
                  </Pressable>
                );
              }}
            />
            {selectedUsers.length > 0 && (
              <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#0E0E10] border-t border-gray-700">
                <Button
                  text="Confirmer"
                  withLoader={true}
                  onClick={handleConfirmSelection}
                  className="w-full"
                />
              </View>
            )}
          </View>
        </Modal>
      </Modal>
      <Modal actionSheetRef={modalActionsRef}>
        <View className="flex flex-col">
          <View className="flex flex-col gap-y-4">
            <Button text="Signaler le contenu" onClick={() => {}} />
            {derkap.creator_id === user.id && (
              <Button
                color="danger"
                text="Supprimer"
                onClick={openModalDelete}
              />
            )}
          </View>
        </View>
        <Modal actionSheetRef={modalDeleteRef}>
          <>
            <Text className="font-bold text-center text-white">
              Êtes-vous sûr de vouloir supprimer ce Derkap ? Cette action est
              irréversible.
            </Text>

            <Button
              withLoader={true}
              color="green"
              className="flex items-center justify-center gap-2"
              onClick={() => {
                modalDeleteRef.current?.hide();
                modalActionsRef.current?.hide();
              }}
              text={"Annuler"}
            />
            <View className="flex flex-row items-center justify-center gap-2">
              <Button
                withLoader={true}
                color="danger"
                className="flex items-center justify-center gap-2"
                textClassName="text-xs"
                onClick={handleDeleteDerkap}
                text={"Supprimer le Derkap"}
              />
            </View>
          </>
        </Modal>
      </Modal>
    </View>
  );
}

const AllowedUser = ({
  profile,
  userIdConnected,
  onRemove,
}: {
  profile: TProfileDB;
  userIdConnected: string;
  onRemove: (userId: string) => Promise<void>;
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  if (profile.id === userIdConnected) return null;

  const renderRightActions = () => {
    return (
      <View className="flex-1 bg-red-500 justify-center items-end rounded-xl">
        <View className="h-full w-fit justify-center items-center px-4">
          <Text className="text-white font-bold text-center">Supprimer</Text>
        </View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => {
        onRemove(profile.id);
        swipeableRef.current?.close();
      }}
    >
      <View className="flex-row items-center p-3 border-b border-gray-700 bg-[#0E0E10]">
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="w-10 h-10 rounded-full mr-4"
          />
        ) : (
          <View className="w-10 h-10 rounded-full mr-4 bg-gray-700" />
        )}
        <Text className={`flex-1 text-lg font-grotesque text-white`}>
          {profile.username}
        </Text>
      </View>
    </Swipeable>
  );
};
