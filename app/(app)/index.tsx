import { View, Text, Pressable, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { Link } from "expo-router";
import { User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabase } from "@/context/auth-context";
import { getGroups, createGroup } from "@/functions/group-action";
import { TGroupDB } from "@/types/types";
import Button from "@/components/Button";

const Home = () => {
  const [groups, setGroups] = useState<TGroupDB[]>([]);
  const { user, profile } = useSupabase();

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
    const groupeName = "Groupe Test";
    const { data, error } = await createGroup({ name: groupeName });
    if (error) return console.error(error);
    if (data) {
      setGroups([...groups, data]);
    }
  };

  return (
    <SafeAreaView className="relative items-center justify-start flex-1">
      <View className="w-full flex-row justify-end px-4">
        <Link
          href={{
            pathname: "/profile/[id]",
            params: { id: user.id },
          }}
        >
          <User size={30} color="black" />
        </Link>
      </View>
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
    </SafeAreaView>
  );
};

export default Home;
