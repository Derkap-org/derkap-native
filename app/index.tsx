import { View, Text, Pressable, Modal } from "react-native";
import React, { useState } from "react";
import GroupList from "../components/ui/GroupList";
import GroupForm from "../components/ui/GroupForm";
import JoinGroupForm from "../components/ui/JoinGroupForm";

const Home = () => {
  const [formType, setFormType] = useState<string | null>(null);
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Group A",
      status: "En votes",
      members: [
        { profile: { id: 1, username: "Alice", avatar_url: null } },
        { profile: { id: 2, username: "Bob", avatar_url: null } },
      ],
    },
    {
      id: 2,
      name: "Group B",
      status: "En cours",
      members: [
        { profile: { id: 3, username: "Charlie", avatar_url: null } },
        { profile: { id: 4, username: "David", avatar_url: null } },
      ],
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateGroup = (groupData: { name: string; status: string }) => {
    const newGroup = {
      id: groups.length + 1,
      ...groupData,
      members: [],
    };
    setGroups([...groups, newGroup]);
    setModalVisible(false);
  };

  const handleJoinGroup = (groupId: number) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      group.members.push({
        profile: {
          id: Date.now(),
          username: `User_${group.members.length + 1}`,
          avatar_url: null,
        },
      });
      setGroups([...groups]);
      setModalVisible(false);
    } else {
      alert("Groupe introuvable");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="w-full flex-row justify-between p-4">
        <Pressable
          onPress={() => setModalVisible(true)}
          className="bg-gray-700 p-6 rounded-full"
        >
          <Text className="text-white text-2xl">+</Text>
        </Pressable>
      </View>

      <GroupList
        groups={groups}
        isLoading={false}
        setIsCreateGroupDrawerOpen={() => setModalVisible(true)}
      />

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-gray-500/50">
          <View className="bg-white p-6 rounded-lg w-80 relative">
            <Pressable
              onPress={() => setModalVisible(false)}
              className="absolute top-2 right-2 p-2"
            >
              <Text className="text-xl font-bold text-gray-600">×</Text>
            </Pressable>

            <Text className="text-lg font-medium text-center mb-4">
              Que voulez-vous faire ?
            </Text>
            <Pressable
              onPress={() => {
                setFormType("create");
                setModalVisible(false);
              }}
              className="bg-blue-500 py-3 px-6 rounded-lg mb-4"
            >
              <Text className="text-white text-base font-medium">
                Créer un groupe
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setFormType("join");
                setModalVisible(false);
              }}
              className="bg-green-500 py-3 px-6 rounded-lg"
            >
              <Text className="text-white text-base font-medium">
                Rejoindre un groupe
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {formType === "create" && (
        <GroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setFormType(null)}
        />
      )}

      {formType === "join" && (
        <JoinGroupForm
          onSubmit={handleJoinGroup}
          onCancel={() => setFormType(null)}
        />
      )}
    </View>
  );
};

export default Home;
