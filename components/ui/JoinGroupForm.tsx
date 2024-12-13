import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";

const JoinGroupForm = ({ onSubmit, onCancel }) => {
  const [groupId, setGroupId] = useState("");
  const [missingId, setMissingId] = useState(false);

  const handleJoin = () => {
    if (!groupId.trim()) {
      setMissingId(true);
      return;
    }

    onSubmit(groupId.trim()); // Soumettre l'ID du groupe
    setGroupId("");
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 16,
        }}
        keyboardShouldPersistTaps="handled"
        className="w-full"
      >
        <View className="flex flex-col items-center justify-center gap-4">
          {/* Titre */}
          <Text className="text-3xl font-bold text-gray-800 mb-6">
            Rejoindre un groupe
          </Text>

          {/* Champ de saisie pour l'ID du groupe */}
          <View className="w-full max-w-sm flex flex-col gap-1.5">
            <Text className="text-lg text-gray-600">ID du groupe *</Text>
            <TextInput
              className="w-full p-4 border rounded-lg text-gray-900 shadow-md"
              placeholder="Entrez l'ID du groupe"
              value={groupId}
              onChangeText={setGroupId}
              keyboardType="number-pad"
              returnKeyType="done"
            />
            {missingId && (
              <Text className="text-red-500 text-xs">
                Vous devez remplir ce champ
              </Text>
            )}
          </View>

          {/* Boutons */}
          <View className="w-full flex flex-row gap-4">
            <TouchableOpacity
              className="bg-red-600 py-3 px-6 rounded-lg flex-1 shadow-lg"
              onPress={onCancel}
            >
              <Text className="text-white text-base font-medium text-center">
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-600 py-3 px-6 rounded-lg flex-1 shadow-lg"
              onPress={handleJoin}
            >
              <Text className="text-white text-base font-medium text-center">
                Rejoindre
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default JoinGroupForm;
