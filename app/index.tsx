import { View, Text, Pressable } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import GroupList from '../components/ui/GroupList';
import GroupForm from '../components/ui/GroupForm';
import JoinGroupForm from '../components/ui/JoinGroupForm';

const Home = () => {
  const [formType, setFormType] = useState(null); // État pour savoir quel formulaire afficher
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Group A',
      members: [
        { profile: { id: 1, username: 'Alice', avatar_url: null } },
        { profile: { id: 2, username: 'Bob', avatar_url: null } },
      ],
    },
    {
      id: 2,
      name: 'Group B',
      members: [
        { profile: { id: 3, username: 'Charlie', avatar_url: null } },
        { profile: { id: 4, username: 'David', avatar_url: null } },
      ],
    },
  ]);

  // Fonction pour gérer l'ajout d'un groupe
  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: groups.length + 1,
      ...groupData,
      members: [],
    };
    setGroups([...groups, newGroup]);
    setFormType(null); // Ferme le formulaire après la création
  };

  // Fonction pour gérer l'adhésion à un groupe
  const handleJoinGroup = (groupId) => {
    const group = groups.find(g => g.id === parseInt(groupId)); // Trouver le groupe par ID
    if (group) {
      // Ajouter l'utilisateur comme membre du groupe
      group.members.push({ profile: { id: Date.now(), username: `User_${group.members.length + 1}`, avatar_url: null } });
      setGroups([...groups]); // Mettre à jour la liste des groupes
      setFormType(null); // Ferme le formulaire
    } else {
      alert('Groupe introuvable');
    }
  };

  return (
    <View className="items-center justify-center flex-1">
      <Text className="text-3xl text-red-700">Home</Text>
      <Link href="/sign-in" asChild>
        <Pressable>
          <Text>Sign in</Text>
        </Pressable>
      </Link>
      <Link href="/camera" className="text-blue-700">
        Go to Camera
      </Link>

      {/* Liste des groupes */}
      <GroupList
        groups={groups}
        isLoading={false}
        setIsCreateGroupDrawerOpen={setFormType}
      />

      {/* Boutons pour ouvrir les formulaires */}
      <View className="flex flex-row gap-4 mt-6">
        <Pressable
          onPress={() => setFormType('create')}
          className="bg-blue-500 py-3 px-6 rounded-lg flex-1"
        >
          <Text className="text-white text-base font-medium">Créer un groupe</Text>
        </Pressable>

        <Pressable
          onPress={() => setFormType('join')}
          className="bg-green-500 py-3 px-6 rounded-lg flex-1"
        >
          <Text className="text-white text-base font-medium">Rejoindre un groupe</Text>
        </Pressable>
      </View>

      {/* Afficher le formulaire pour créer un groupe */}
      {formType === 'create' && (
        <GroupForm onSubmit={handleCreateGroup} onCancel={() => setFormType(null)} />
      )}

      {/* Afficher le formulaire pour rejoindre un groupe */}
      {formType === 'join' && (
        <JoinGroupForm onSubmit={handleJoinGroup} onCancel={() => setFormType(null)} />
      )}
    </View>
  );
};

export default Home;
