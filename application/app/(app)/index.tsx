import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
} from "react-native";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "expo-router";
import { Plus, User, Users } from "lucide-react-native";
import { useSupabase } from "@/context/auth-context";
import Button from "@/components/Button";
import StatusLabel from "@/components/group/StatusLabel";
import GroupCard from "@/components/group/GroupCard";

import useGroupStore from "@/store/useGroupStore";
import { useFocusEffect } from "@react-navigation/native";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import { MAX_GROUP_NAME_LENGTH } from "@/functions/group-action";
import Toast from "react-native-toast-message";
import Avatar from "@/components/Avatar";
import useFriendStore from "@/store/useFriendStore";
const Home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [groupName, setGroupName] = useState("");
  const { fetchFriends } = useFriendStore();
  const { user, profile } = useSupabase();

  const { groups, fetchGroups, createGroup } = useGroupStore();

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, []),
  );

  useEffect(() => {
    fetchFriends();
  }, []);

  const actionSheetRef = useRef<ActionSheetRef>(null);

  const showModal = () => actionSheetRef.current?.show();
  const hideModal = () => actionSheetRef.current?.hide();

  const handleCreateGroup = async () => {
    if (groupName.length > MAX_GROUP_NAME_LENGTH) {
      Toast.show({
        type: "error",
        text1: `Le nom du groupe ne doit pas dépasser ${MAX_GROUP_NAME_LENGTH} caractères`,
      });
      return;
    }
    const { succes } = await createGroup(groupName);
    if (succes) {
      hideModal();
      setGroupName("");
    } else {
      Toast.show({
        type: "error",
        text1: "Erreur lors de la création du groupe",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchGroups();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors du rafraîchissement des groupes",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <View className="relative flex flex-col items-center justify-start flex-1 gap-4 p-4">
        <View className="flex-row justify-between w-full px-4">
          <Link href={{ pathname: "/friends/[id]", params: { id: user.id } }}>
            <View className="flex-row items-center gap-x-2">
              <Users size={30} color="white" />
            </View>
          </Link>
          <Link
            href={{
              pathname: "/profile/[id]",
              params: { id: user.id },
            }}
          >
            <Avatar
              profile={profile}
              index={0}
              user={user}
              classNameImage="w-12 h-12"
              classNameContainer="border-2 border-custom-primary"
            />
          </Link>
        </View>
        <View className="flex-row items-center justify-center w-full">
          <Pressable className="p-2" onPress={showModal}>
            <Text className="text-gray-300">Créer un groupe</Text>
          </Pressable>
        </View>
        {groups.length === 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={"#fff"}
              />
            }
          >
            <View className="flex flex-col items-center justify-center gap-2">
              <Text className="text-xs text-white">
                Pas de groupe pour le moment...
              </Text>
              <Text className="text-4xl text-center font-grotesque text-white">
                Crée en un dès maintenant !
              </Text>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={"#fff"}
              />
            }
            className="w-full"
            // {
            //   //todo check if multiple group is sccroll ok
            // }
          >
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </ScrollView>
        )}
      </View>
      <Modal actionSheetRef={actionSheetRef}>
        <View className="flex flex-col gap-y-4">
          <Text className="text-2xl font-bold text-white font-grotesque text-center">
            Créer un groupe
          </Text>
          <TextInput
            className="w-full p-2 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl"
            onChangeText={setGroupName}
            value={groupName}
            placeholder="Entre le nom de groupe ici"
            maxLength={20}
          />
          <Button
            withLoader={true}
            isCancel={!groupName.length}
            onClick={handleCreateGroup}
            text="Créer"
            className="w-fit"
          />
        </View>
      </Modal>
    </>
  );
};

export default Home;
