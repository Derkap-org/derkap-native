import { View, Text, Pressable, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/auth-context";
import { getGroups, createGroup } from "@/functions/group-action";
import { TGroupDB } from "@/types/types";
import Button from "@/components/Button";

const Home = () => {
  const [groups, setGroups] = useState<TGroupDB[]>([]);
  const { user, signOut, profile } = useSupabase();

  const handleGetGroups = async () => {
    try {
      const { data, error } = await getGroups({});

      if (error) {
        console.error(error);
      }
      if (data) {
        setGroups(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetGroups();
  }, []);

  const handleCreateGroup = async () => {
    console.log("create group");
    const groupeName = "Groupe test";
    const { data, error } = await createGroup({ name: groupeName });
    if (error) return console.error(error);
    if (data) {
      setGroups([...groups, data]);
    }
  };

  return (
    <SafeAreaView className="relative items-center justify-center flex-1">
      <Text className="absolute text-sm top-20 ">Bonjour {user.email} </Text>
      {profile?.avatar_url && (
        <Image
          source={{ uri: profile.avatar_url }}
          style={{ width: 200, height: 200 }}
        />
      )}
      <Button onPress={handleCreateGroup} text="Créer un groupe" />

      {groups.map((group) => (
        <Link
          key={group.id}
          href={{
            pathname: "/group/[id]",
            params: { id: group.id },
          }}
          className="text-blue-700"
        >
          {group.name}
        </Link>
      ))}
      <Link
        href={{
          pathname: "/group/[id]",
          params: { id: "1" },
        }}
        className="text-blue-700"
      >
        Go to Group 1
      </Link>

      <Text onPress={signOut} className="absolute text-sm bottom-20 ">
        Déconnexion
      </Text>
    </SafeAreaView>
  );
};

export default Home;
