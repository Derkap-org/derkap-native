import BackButton from "@/components/BackButton";
import { cn } from "@/lib/utils";
import useGroupStore from "@/store/useGroupStore";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  RefreshControl,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TFriendRequestDB, TUserWithFriendshipStatus } from "@/types/types";
import { useDebounce } from "use-debounce";
import ProfileLine from "@/components/profile/ProfileLine";

import useFriendStore from "@/store/useFriendStore";
import { getUserAndCheckFriendship } from "@/functions/friends-action";
import useSearchStore from "@/store/useSearchStore";
import { Modal } from "@/components/Modal";
import Button from "@/components/Button";
import { ActionSheetRef } from "react-native-actions-sheet";

export default function Friends() {
  const router = useRouter();
  const [queryUser, setQueryUser] = useState("");
  const [debouncedQuery] = useDebounce(queryUser, 400);
  const { fetchGroups } = useGroupStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"friends" | "requests">(
    "friends",
  );

  const { searchedUsers, setSearchedUsers } = useSearchStore();

  const { fetchRequests, fetchFriends } = useFriendStore();
  const inputRef = useRef<TextInput>(null);

  const handleBack = () => {
    fetchGroups();
    router.back();
  };

  const handleQueryUser = async (query: string) => {
    setIsLoading(true);
    setQueryUser(query);
  };

  const handleBlur = () => {
    setQueryUser("");
    inputRef.current?.blur();
    setIsFocused(false);
  };

  const fetchUserByUsername = async (query: string) => {
    setIsLoading(true);
    const { data } = await getUserAndCheckFriendship(query);
    setSearchedUsers(data);
    setIsLoading(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Add keyboard listeners to detect when keyboard is dismissed
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        if (isFocused) {
          setIsFocused(false);
        }
      },
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [isFocused]);

  useEffect(() => {
    if (selectedTab === "friends") {
      fetchFriends();
    } else if (selectedTab === "requests") {
      fetchRequests();
    }
  }, [selectedTab]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchUserByUsername(debouncedQuery);
    } else if (debouncedQuery === "") {
      setSearchedUsers([]);
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="">
        <View className="flex-row items-center p-4">
          <View className="flex flex-row items-center w-1/3">
            <BackButton handleBack={handleBack} />
          </View>
          <View className="flex flex-row items-center justify-center w-1/3">
            <Text className="text-2xl font-bold text-white">Amis</Text>
          </View>
        </View>
        <View className="flex flex-row items-center justify-center p-4">
          <View className="relative flex-row items-center w-full p-2 overflow-hidden bg-zinc-800 rounded-xl">
            <Ionicons name="search-outline" size={20} color="#a1a1aa" />
            <TextInput
              ref={inputRef}
              onFocus={handleFocus}
              className="w-full pr-24 ml-2 text-white placeholder:text-zinc-400"
              onChangeText={handleQueryUser}
              value={queryUser}
              placeholder="Cherche quelqu'un"
            />
            {(isFocused || queryUser.length > 0) && (
              <Pressable
                onPress={handleBlur}
                className="absolute right-0 mx-2 "
              >
                <Text className="text-gray-500">Annuler</Text>
              </Pressable>
            )}
          </View>
        </View>
        {debouncedQuery.length > 0 || isFocused ? (
          <QueryUserList isLoading={isLoading} searchedUsers={searchedUsers} />
        ) : (
          <TabList selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const TabList = ({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: "friends" | "requests";
  setSelectedTab: (tab: "friends" | "requests") => void;
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <>
        <View className="flex flex-row justify-between px-4 my-2">
          <Pressable
            className={cn(
              "w-1/2 flex justify-center items-center rounded-xl py-2",
              selectedTab === "friends" && "bg-custom-primary",
            )}
            onPress={() => setSelectedTab("friends")}
          >
            <Text
              className={cn(
                "text-gray-500",
                selectedTab === "friends" && "text-white font-bold",
              )}
            >
              Liste d'amis
            </Text>
          </Pressable>
          <Pressable
            className={cn(
              "w-1/2 flex justify-center items-center rounded-xl py-2",
              selectedTab === "requests" && "bg-custom-primary",
            )}
            onPress={() => setSelectedTab("requests")}
          >
            <Text
              className={cn(
                "text-gray-500",
                selectedTab === "requests" && "text-white font-bold",
              )}
            >
              Demandes d'amis
            </Text>
          </Pressable>
        </View>
        <View className="mt-2">
          {selectedTab === "friends" ? <FriendsList /> : <RequestsList />}
        </View>
      </>
    </TouchableWithoutFeedback>
  );
};

const FriendsList = () => {
  const {
    friends,
    rejectRequest,
    modalRequestSelected,
    isModalOpen,
    showModalConfirmDeletion,
    hideModalConfirmDeletion,
    fetchFriends,
  } = useFriendStore();
  const modalRef = useRef<ActionSheetRef>(null);

  useEffect(() => {
    if (isModalOpen) {
      modalRef.current?.show();
    } else {
      modalRef.current?.hide();
    }
  }, [isModalOpen]);

  const [refreshingFriends, setRefreshingFriends] = useState(false);

  const handleRefreshFriends = async () => {
    try {
      setRefreshingFriends(true);
      await fetchFriends();
      setRefreshingFriends(false);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshingFriends(false);
    }
  };

  return (
    <>
      <View className="flex flex-col items-center w-full px-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          className="flex flex-col w-full gap-y-4 h-full"
          refreshControl={
            <RefreshControl
              refreshing={refreshingFriends}
              onRefresh={handleRefreshFriends}
              tintColor={"#fff"}
            />
          }
        >
          {friends?.length === 0 ? (
            <Text className="mt-4 text-center text-gray-500">
              Vous n'avez pas encore d'amis
            </Text>
          ) : (
            friends?.map((request, index) => (
              <View
                className="flex flex-row items-center justify-between w-full gap-2 pt-4"
                key={index}
              >
                <ProfileLine
                  member={request.profile}
                  className="w-fit"
                  classNameText="text-md"
                />
                <View className="flex flex-row gap-2">
                  <>
                    <Button
                      color="danger"
                      className="p-2 rounded-full active:opacity-70"
                      onClick={() => showModalConfirmDeletion(request)}
                    >
                      <Ionicons name="close" size={20} color="white" />
                    </Button>
                  </>
                  {/* )} */}
                </View>
              </View>
            ))
          )}
          <View className="mb-48 h-64" />
        </ScrollView>
      </View>

      <Modal actionSheetRef={modalRef} onClose={hideModalConfirmDeletion}>
        <Text className="text-2xl font-bold text-white text-center font-grotesque">
          Supprimer cet ami
        </Text>
        <Text className="text-white">
          Es-tu sûr de vouloir supprimer cet ami ? Cette action est
          irréversible.
        </Text>
        <Button
          className="w-full bg-purple-500 font-grotesque"
          text="Supprimer"
          onClick={async () => {
            if (modalRequestSelected) {
              await rejectRequest({
                request_id: modalRequestSelected.id,
                user_id: modalRequestSelected.profile.id,
              });
              hideModalConfirmDeletion();
              fetchFriends();
            }
          }}
          withLoader={true}
        />
      </Modal>
    </>
  );
};

const RequestsList = () => {
  const { requests, rejectRequest, acceptRequest, fetchRequests } =
    useFriendStore();
  const [refreshingRequests, setRefreshingRequests] = useState(false);

  const handleRefreshRequests = async () => {
    try {
      setRefreshingRequests(true);
      await fetchRequests();
      setRefreshingRequests(false);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshingRequests(false);
    }
  };

  return (
    <View className="flex flex-col items-center w-full px-6">
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingRequests}
            onRefresh={handleRefreshRequests}
            tintColor={"#fff"}
          />
        }
        className="flex flex-col w-full gap-y-4 h-full"
      >
        {requests?.length === 0 ? (
          <Text className="mt-4 text-center text-gray-500">
            Aucune demande d'amis
          </Text>
        ) : (
          requests?.map((request, index) => (
            <View
              className="flex flex-row items-center justify-between w-full gap-2 pt-4"
              key={index}
            >
              <ProfileLine
                member={request.profile}
                className="w-fit"
                classNameText="text-md"
              />
              <View className="flex flex-row gap-2">
                <>
                  <Button
                    withLoader={true}
                    className="p-2 rounded-full bg-custom-primary active:opacity-70"
                    onClick={async () => {
                      await acceptRequest({
                        request_id: request.id,
                        user_id: request.profile.id,
                      });
                      fetchRequests();
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                  </Button>

                  <Button
                    withLoader={true}
                    color="danger"
                    className="p-2 rounded-full active:opacity-70"
                    onClick={async () => {
                      await rejectRequest({
                        request_id: request.id,
                        user_id: request.profile.id,
                      });
                      fetchRequests();
                    }}
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </Button>
                </>
                {/* )} */}
              </View>
            </View>
          ))
        )}
        <View className="mb-48 h-64" />
      </ScrollView>
    </View>
  );
};

const QueryUserList = ({
  searchedUsers,
  isLoading,
}: {
  searchedUsers: TUserWithFriendshipStatus;
  isLoading: boolean;
}) => {
  const { addRequest, acceptRequest, rejectRequest } = useFriendStore();
  return (
    <>
      {isLoading ? (
        <View className="flex flex-row items-center justify-center w-full">
          <ActivityIndicator size="small" color="white" />
        </View>
      ) : (
        <View className="flex flex-col items-center w-full px-6">
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={() => Keyboard.dismiss()}
          >
            {searchedUsers.map((user) => (
              <Pressable key={user.id} onPress={() => Keyboard.dismiss()}>
                <View className="flex flex-row items-center justify-between w-full gap-2 my-2">
                  <ProfileLine member={user} className="w-fit" />
                  {user.friendship_status === "not_friend" ? (
                    <Button
                      withLoader={true}
                      text="Ajouter"
                      className="p-2 rounded-full bg-custom-primary active:opacity-70"
                      onClick={async () => {
                        Keyboard.dismiss();
                        await addRequest({
                          user_id: user.id,
                        });
                      }}
                    />
                  ) : user.friendship_status === "pending_your_acceptance" ? (
                    <Button
                      withLoader={true}
                      text="Accepter"
                      className="p-2 rounded-full bg-custom-primary active:opacity-70"
                      onClick={async () => {
                        await acceptRequest({
                          request_id: user.friend_request_id,
                          user_id: user.id,
                        });
                      }}
                    />
                  ) : user.friendship_status === "friend" ? (
                    <Button
                      isCancel={true}
                      color="danger"
                      className="p-2 rounded-full active:opacity-70"
                      onClick={() => {}}
                      text="Amis"
                    />
                  ) : user.friendship_status === "pending_their_acceptance" ? (
                    <Button
                      withLoader={true}
                      color="gray"
                      className="p-2 rounded-full active:opacity-70"
                      onClick={async () => {
                        await rejectRequest({
                          request_id: user.friend_request_id,
                          user_id: user.id,
                        });
                      }}
                      text="Annuler"
                    />
                  ) : (
                    <Text className="px-2 py-1 text-white">
                      {user.friendship_status}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
            <View className="mb-48 h-64" />
          </ScrollView>
        </View>
      )}
    </>
  );
};
