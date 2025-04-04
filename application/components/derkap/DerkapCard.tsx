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
import { Modal } from "@/components/Modal";
import { Comment } from "@/components/comment/Comment";
import Toast from "react-native-toast-message";
import { createComment, getCommentsFromDB } from "@/functions/comments-action";
import {
  TapGestureHandler,
  State,
  Swipeable,
} from "react-native-gesture-handler";
import ChallengeBox from "@/components/ChallengeBox";
import { Link } from "expo-router";
import { EyeIcon, Plus } from "lucide-react-native";
import { useSupabase } from "@/context/auth-context";
import {
  removeAllowedUser,
  fetchAllowedUsers,
  addAllowedUser,
} from "@/functions/derkap-action";
import useFriendStore from "@/store/useFriendStore";

interface DerkapCardProps extends ViewProps {
  derkap: TDerkapDB;
  alreadyMadeThisChallenge: boolean;
}

export default function DerkapCard({
  derkap,
  className,
  alreadyMadeThisChallenge,
  ...props
}: DerkapCardProps) {
  const [comments, setComments] = useState<TCommentDB[]>([]);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const modalCommentRef = useRef<ActionSheetRef>(null);
  const modalVisibilityRef = useRef<ActionSheetRef>(null);
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
          <View className="absolute w-full h-full z-20 flex items-center justify-center bg-black/50">
            <View className="flex flex-col items-center gap-y-4">
              <Text className="text-2xl font-bold text-white text-center">
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
                className="bg-custom-primary px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-bold text-lg">Capturer</Text>
              </Link>
            </View>
          </View>
        )}
        {derkap.caption && (
          <View className="absolute bottom-0 left-0 right-0 z-10 p-4 flex-row items-start justify-between">
            <View className="w-full p-4 bg-zinc-800/80 rounded-xl">
              <Text className="text-white text-center font-grotesque">
                {derkap.caption}
              </Text>
            </View>
          </View>
        )}
        <View className="absolute top-2 left-4 z-30 flex flex-row items-center justify-between py-2 px-4 bg-zinc-800/50 rounded-xl">
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

        <Pressable
          onPress={openModalVisibility}
          className="absolute top-2 right-4 z-30 flex flex-row items-center justify-between p-2 bg-zinc-800/50 rounded-full"
        >
          <EyeIcon className="w-6 h-6 text-white" color="white" />
        </Pressable>
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
            <Text className="text-9xl font-bold pt-10 text-white">🤣</Text>
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
      <View className="w-full flex flex-row items-center justify-end px-4 mt-2">
        {/* <Pressable
          className="px-4 py-2"
          onPress={() => {
            likeDerkap({ derkap_id: derkap.id });
          }}
        >
          <View className="flex relative flex-row items-center gap-x-2">
            <Text className="text-white text-center absolute -top-3 -right-2 z-10 bg-black/50 p-1 rounded-full font-grotesque">
              12
            </Text>
            <Text className="text-white font-grotesque text-4xl">🤣</Text>
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
          <Text className="text-2xl font-bold font-grotesque text-center py-4 text-white">
            Commentaires
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className="flex-1 flex-col gap-y-2"
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
          <View className="flex flex-col gap-y-2 px-4 py-4 justify-center items-center">
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              className="w-full p-2 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl"
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
