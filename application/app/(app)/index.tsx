import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  RefreshControl,
} from "react-native";
import React, { useState, useRef, useCallback } from "react";
import { Link } from "expo-router";
import { Plus, User } from "lucide-react-native";
import { useSupabase } from "@/context/auth-context";
import Button from "@/components/Button";
import StatusLabel from "@/components/group/StatusLabel";

import useGroupStore from "@/store/useGroupStore";
import { useFocusEffect } from "@react-navigation/native";
import { Modal } from "@/components/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";

import Toast from "react-native-toast-message";

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [groupName, setGroupName] = useState("");

  const { user } = useSupabase();

  const { groups, fetchGroups, createGroup } = useGroupStore();

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, []),
  );

  const actionSheetRef = useRef<ActionSheetRef>(null);

  const showModal = () => actionSheetRef.current?.show();
  const hideModal = () => actionSheetRef.current?.hide();

  const handleCreateGroup = async () => {
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
          <Text className="text-2xl font-bold">Mes groupes</Text>
          <Link
            href={{
              pathname: "/profile/[id]",
              params: { id: user.id },
            }}
          >
            <User size={30} color="black" />
          </Link>
        </View>
        <View className="flex-row items-center justify-between w-full py-4">
          <Pressable
            className="p-2 rounded-full bg-custom-primary"
            onPress={showModal}
          >
            <Plus color={"white"} />
          </Pressable>
        </View>
        {groups.length === 0 ? (
          <View className="flex flex-col items-center justify-center flex-1">
            <View className="flex flex-col items-center justify-center gap-2">
              <Text className="text-xs">Pas de groupe pour le moment...</Text>
              <Text className="text-4xl text-center font-grotesque">
                Crée en un dès maintenant !
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            className="w-full"
          >
            {groups.map((group) => (
              <Link
                key={group.id}
                href={{
                  pathname: "/group/[id]",
                  params: { id: group.id },
                }}
                className="flex items-center w-full gap-4 p-4 px-4 py-2 mb-4 bg-white border shadow-element border-custom-black rounded-xl text-custom-black"
              >
                <View className="flex-row items-center justify-between">
                  <View className="w-full">
                    <View className="flex-row items-center justify-between w-full">
                      <View className="">
                        <Text className="text-lg font-semibold">
                          {group.name}
                        </Text>

                        {/* Statut du groupe */}
                        <View className="w-24 text-white">
                          <StatusLabel
                            challengeStatus={group.challengeStatus}
                          />
                        </View>
                      </View>

                      {group.hasNewStatus === true && (
                        <Text className="flex flex-col text-center pt-[1px] items-center justify-center text-white rounded-full aspect-square h-5 w-5 bg-red-500 text-xs">
                          1
                        </Text>
                      )}
                    </View>

                    {/* Barre de statut */}
                    <View className="my-2">
                      <View className="h-[2px] bg-gray-300 w-full rounded-full" />
                    </View>

                    {/* Photos des membres */}
                    <View className="flex-row">
                      {group.members?.slice(0, 5).map((member, index) => {
                        if (!member.profile) return;
                        return (
                          <View
                            key={member.profile.id}
                            className={`border-2 border-white rounded-full overflow-hidden ${
                              index !== 0 ? "-ml-3" : ""
                            }`}
                          >
                            {member.profile?.avatar_url ? (
                              <Image
                                source={{
                                  uri: `${member.profile?.avatar_url}?t=${user.user_metadata.avatarTimestamp}`,
                                }}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <View className="items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                                <Text className="text-sm text-white">
                                  {member.profile?.username?.charAt(0) || "?"}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      })}

                      {/* Nombre de membres supplémentaires */}
                      {(group.members?.length || 0) > 5 && (
                        <View className="items-center justify-center w-10 h-10 -ml-3 bg-gray-300 border-2 border-white rounded-full">
                          <Text className="text-sm text-white">
                            +{(group.members?.length || 0) - 5}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </Link>
            ))}
          </ScrollView>
        )}
      </View>
      <Modal actionSheetRef={actionSheetRef}>
        <View className="flex flex-col gap-y-4">
          <Text className="text-2xl font-bold">Créer un groupe</Text>
          <TextInput
            className="w-full p-2 border border-gray-300 rounded-xl"
            onChangeText={setGroupName}
            value={groupName}
            placeholder="Entre le nom de groupe ici"
            placeholderTextColor="#888"
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
