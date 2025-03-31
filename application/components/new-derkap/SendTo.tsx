import useFriendStore from "@/store/useFriendStore";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { Users, ArrowRight } from "lucide-react-native";
import colors from "tailwindcss/colors";
import { TFriendRequestDB as Friend } from "@/types/types";

interface SendToProps {
  allowedUsers: string[];
  setAllowedUsers: (allowedUsers: string[]) => void;
  postDerkap: () => void;
  isSendingDerkap: boolean;
  followingUsers?: string[];
}

const primaryColor = colors.purple[500];

export default function SendTo({
  allowedUsers,
  setAllowedUsers,
  postDerkap,
  isSendingDerkap,
  followingUsers,
}: SendToProps) {
  const [friendsFollowingUsers, setFriendsFollowingUsers] = useState<Friend[]>(
    [],
  );
  const { friends, fetchFriends } = useFriendStore();

  useEffect(() => {
    if (followingUsers) {
      setFriendsFollowingUsers(
        friends.filter((friend) => followingUsers.includes(friend.profile.id)),
      );
    }
  }, [followingUsers, friends]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSelectFriend = (profile_id: string) => {
    const isSelected = allowedUsers.includes(profile_id);
    let newAllowedUsers: string[];
    if (isSelected) {
      newAllowedUsers = allowedUsers.filter((id) => id !== profile_id);
    } else {
      newAllowedUsers = [...allowedUsers, profile_id];
    }
    setAllowedUsers(newAllowedUsers);
  };

  const handleSelectAll = () => {
    if (allowedUsers.length === friends.length) {
      setAllowedUsers([]);
    } else {
      setAllowedUsers(friends.map((f) => f.profile.id));
    }
  };

  const handleSelectAllFollowing = () => {
    const followingIds = friendsFollowingUsers.map((f) => f.profile.id);
    const areAllFollowingSelected = followingIds.every((id) =>
      allowedUsers.includes(id),
    );

    if (areAllFollowingSelected) {
      // Deselect all following users
      setAllowedUsers(allowedUsers.filter((id) => !followingIds.includes(id)));
    } else {
      // Select all following users while keeping other selections
      const newSelection = [...new Set([...allowedUsers, ...followingIds])];
      setAllowedUsers(newSelection);
    }
  };

  const isAllSelected =
    friends.length > 0 && allowedUsers.length === friends.length;

  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = allowedUsers.includes(item.profile.id);
    return (
      <TouchableOpacity
        onPress={() => handleSelectFriend(item.profile.id)}
        className="flex-row items-center p-3 border-b border-gray-700"
      >
        {item.profile.avatar_url ? (
          <Image
            source={{ uri: item.profile.avatar_url }}
            className="w-10 h-10 rounded-full mr-4"
          />
        ) : (
          <View className="w-10 h-10 rounded-full mr-4 bg-gray-700" />
        )}
        <Text
          className={`flex-1 text-lg font-grotesque ${isSelected ? "font-bold" : "font-normal"}`}
          style={{ color: isSelected ? primaryColor : colors.white }}
        >
          {item.profile.username}
        </Text>
        <View
          className={`w-6 h-6 rounded-full border-2 ${isSelected ? "" : "border-gray-500"}`}
          style={{ backgroundColor: isSelected ? primaryColor : "transparent" }}
        />
      </TouchableOpacity>
    );
  };

  const ListHeader = () => {
    const areAllFollowingSelected =
      friendsFollowingUsers.length > 0 &&
      friendsFollowingUsers.every((f) => allowedUsers.includes(f.profile.id));

    return (
      <View>
        <TouchableOpacity
          onPress={handleSelectAll}
          className="flex-row items-center p-3 border-b border-gray-700 mb-2"
        >
          <View className="w-10 h-10 rounded-full bg-gray-700 mr-4 items-center justify-center">
            <Users size={24} color={colors.white} />
          </View>
          <Text
            className={`flex-1 text-lg font-grotesque ${isAllSelected ? "font-bold" : "font-normal"}`}
            style={{ color: isAllSelected ? primaryColor : colors.white }}
          >
            Tous mes amis
          </Text>
          <View
            className={`w-6 h-6 rounded-full border-2 ${isAllSelected ? "" : "border-gray-500"}`}
            style={{
              backgroundColor: isAllSelected ? primaryColor : "transparent",
            }}
          />
        </TouchableOpacity>

        {friendsFollowingUsers.length > 0 && (
          <View className="border-b border-gray-700 mb-2">
            <TouchableOpacity
              onPress={handleSelectAllFollowing}
              className="flex-row items-center p-3"
            >
              <View className="w-10 h-10 rounded-full bg-gray-700 mr-4 items-center justify-center">
                <Users size={24} color={colors.white} />
              </View>
              <Text
                className={`flex-1 text-lg font-grotesque ${areAllFollowingSelected ? "font-bold" : "font-normal"}`}
                style={{
                  color: areAllFollowingSelected ? primaryColor : colors.white,
                }}
              >
                Utilisateurs pertinents ({friendsFollowingUsers.length})
              </Text>
              <View
                className={`w-6 h-6 rounded-full border-2 ${areAllFollowingSelected ? "" : "border-gray-500"}`}
                style={{
                  backgroundColor: areAllFollowingSelected
                    ? primaryColor
                    : "transparent",
                }}
              />
            </TouchableOpacity>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="ml-14 mb-3"
            >
              {friendsFollowingUsers.map((friend, index) => (
                <Text
                  key={friend.profile.id}
                  className="text-gray-400 text-sm mr-2"
                >
                  {friend.profile.username}
                  {index < friendsFollowingUsers.length - 1 ? "," : ""}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  // Get selected friend names
  const selectedFriendsNames = friends
    .filter((friend) => allowedUsers.includes(friend.profile.id))
    .map((friend) => friend.profile.username);

  return (
    <View className="flex-1">
      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item, index) => `${item.profile.id}-${index}`}
        ListHeaderComponent={ListHeader}
        className="flex-1 px-4 pt-5"
        contentContainerStyle={{
          paddingBottom: allowedUsers.length > 0 ? 70 : 0,
        }}
      />
      {allowedUsers.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 h-[60px] bg-custom-primary flex-row items-center px-[15px] justify-between">
          <View className="flex-1 mr-[10px] overflow-hidden flex-row items-center">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text
                className="text-white text-base font-bold"
                numberOfLines={1}
              >
                {selectedFriendsNames.join(", ")}
              </Text>
            </ScrollView>
          </View>
          {isSendingDerkap ? (
            <ActivityIndicator size="large" color={colors.white} />
          ) : (
            <TouchableOpacity className="p-[5px]" onPress={postDerkap}>
              <ArrowRight size={48} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
