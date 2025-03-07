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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/Button";
import { getProfileByUsername } from "@/functions/profile-action";
import { TProfileDB, TUserWithFriendshipStatus } from "@/types/types";
import { useDebounce } from "use-debounce";
import ProfileLine from "@/components/profile/ProfileLine";

import useFriendStore from "@/store/useFriendStore";
import { getUserAndCheckFriendship } from "@/functions/friends-action";

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
  const [searchedUsers, setSearchedUsers] = useState<TUserWithFriendshipStatus>(
    [],
  );

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
    }
  }, [debouncedQuery]);

  return (
    <View>
      <View className="flex-row items-center p-4">
        <View className="flex flex-row items-center w-1/3">
          <BackButton handleBack={handleBack} />
        </View>
        <View className="flex flex-row items-center justify-center w-1/3">
          <Text className="text-2xl font-bold">Amis</Text>
        </View>
      </View>
      <View className="flex flex-row items-center justify-center p-4">
        <View className="relative flex-row items-center w-full p-2 overflow-hidden bg-white border border-gray-300 rounded-xl">
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            ref={inputRef}
            onFocus={handleFocus}
            className="w-full pr-24 ml-2 "
            onChangeText={handleQueryUser}
            value={queryUser}
            placeholder="Cherche quelqu'un"
            placeholderTextColor="#888"
          />
          {isFocused && (
            <Pressable onPress={handleBlur} className="absolute right-0 mx-2 ">
              <Text className="text-gray-500">Annuler</Text>
            </Pressable>
          )}
        </View>
      </View>
      {debouncedQuery.length > 0 ? (
        <QueryUserList isLoading={isLoading} searchedUsers={searchedUsers} />
      ) : (
        <TabList selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      )}
    </View>
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
    <>
      <View className="flex flex-row justify-between px-4 my-2">
        <Pressable
          className={cn(
            "w-1/2 flex justify-center items-center rounded-xl py-4",
            selectedTab === "friends" && "bg-custom-primary/50",
          )}
          onPress={() => setSelectedTab("friends")}
        >
          <Text
            className={cn(
              "text-gray-500",
              selectedTab === "friends" && "text-black font-bold",
            )}
          >
            Liste d'amis
          </Text>
        </Pressable>
        <Pressable
          className={cn(
            "w-1/2 flex justify-center items-center rounded-xl py-4",
            selectedTab === "requests" && "bg-custom-primary/50",
          )}
          onPress={() => setSelectedTab("requests")}
        >
          <Text
            className={cn(
              "text-gray-500",
              selectedTab === "requests" && "text-black font-bold",
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
  );
};

const FriendsList = () => {
  const { friends, loadingFriendId, handleRequest } = useFriendStore();
  return (
    <View className="flex items-center justify-center w-full ">
      <View className="flex flex-col items-center w-full px-6 ">
        <Text className="text-2xl font-bold">Amis</Text>
        <View className="flex flex-col w-full mt-2 gap-y-4">
          {friends?.map((friend) => (
            <View
              className="flex flex-row items-center justify-between w-full gap-2 pt-4"
              key={friend.id}
            >
              <ProfileLine
                member={friend.profile}
                className="w-fit"
                classNameText="text-md"
              />
              <View className="flex flex-row gap-2">
                {loadingFriendId === friend.id ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Pressable
                      className="p-2 bg-red-500 rounded-full active:opacity-70"
                      onPress={() => handleRequest(friend.id, "rejected")}
                    >
                      <Ionicons name="close" size={20} color="white" />
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const RequestsList = () => {
  const { requests, loadingRequestId, handleRequest } = useFriendStore();

  return (
    <View className="flex items-center justify-center w-full ">
      <View className="flex flex-col items-center w-full px-6 ">
        <Text className="text-2xl font-bold">Demande d'amis</Text>
        <View className="flex flex-col w-full mt-2 gap-y-4">
          {requests?.map((request) => (
            <View
              className="flex flex-row items-center justify-between w-full gap-2 pt-4"
              key={request.id}
            >
              <ProfileLine
                member={request.profile}
                className="w-fit"
                classNameText="text-md"
              />
              <View className="flex flex-row gap-2">
                {loadingRequestId === request.id ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <>
                    <Pressable
                      className="p-2 rounded-full bg-custom-primary active:opacity-70"
                      onPress={() => {
                        handleRequest(request.id, "accepted");
                      }}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                    </Pressable>
                    <Pressable
                      className="p-2 bg-red-500 rounded-full active:opacity-70"
                      onPress={() => {
                        handleRequest(request.id, "rejected");
                      }}
                    >
                      <Ionicons name="close" size={20} color="white" />
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
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
  const { addFriend } = useFriendStore();
  return (
    <>
      {isLoading ? (
        <View className="flex flex-row items-center justify-center w-full">
          <ActivityIndicator size="small" color="#000" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "100%",
            paddingHorizontal: 10,
          }}
        >
          <View className="flex flex-col w-full gap-y-4">
            {searchedUsers.map((user) => (
              <View
                className="flex flex-row items-center justify-between w-full gap-2"
                key={user.id}
              >
                <ProfileLine member={user} className="w-fit" />
                <Pressable
                  className="p-2 rounded-full bg-custom-primary active:opacity-70"
                  onPress={() => {
                    addFriend(user.id);
                  }}
                >
                  <Text className="text-white">
                    {user.friendship_status === "not_friend"
                      ? "Ajouter"
                      : user.friendship_status === "pending_your_acceptance"
                        ? "Accepter"
                        : user.friendship_status === "friend"
                          ? "Supprimer"
                          : user.friendship_status ===
                              "pending_their_acceptance"
                            ? "Annuler"
                            : user.friendship_status}
                  </Text>
                  {/* {user.friendship_status === "pending" ? (
                    <Ionicons name="add" size={20} color="white" />
                  ) : (
                    <Ionicons name="close" size={20} color="white" />
                  )} */}
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </>
  );
};
