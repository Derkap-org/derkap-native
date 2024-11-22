import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';

const GroupForm = ({ onSubmit, onCancel }) => {
  const [groupName, setGroupName] = useState('');
  const [missingName, setMissingName] = useState(false);

  const handleSubmit = () => {
    if (!groupName.trim()) {
      setMissingName(true);
      return;
    }

    onSubmit({ name: groupName.trim() });
    setGroupName('');
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }} keyboardShouldPersistTaps="handled" className="w-full">
        <View className="flex flex-col items-center justify-center gap-4">
          {/* Titre */}
          <Text className="text-3xl font-bold text-gray-800 mb-6">Créer un groupe</Text>

          {/* Champ de saisie du nom */}
          <View className="w-full max-w-sm flex flex-col gap-1.5">
            <Text className="text-lg text-gray-600">Nom du groupe *</Text>
            <TextInput
              className="w-full p-4 border rounded-lg text-gray-900 shadow-md"
              placeholder="Nom du groupe"
              value={groupName}
              onChangeText={setGroupName}
              returnKeyType="done"
              // Retirer le onSubmitEditing pour ne pas soumettre lors du retour du clavier
            />
            {missingName && (
              <Text className="text-red-500 text-xs">Vous devez remplir ce champ</Text>
            )}
          </View>

          {/* Boutons */}
          <View className="w-full flex flex-row gap-4">
            <TouchableOpacity
              className="bg-red-600 py-3 px-6 rounded-lg flex-1 shadow-lg"
              onPress={onCancel}
            >
              <Text className="text-white text-base font-medium text-center">Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-blue-600 py-3 px-6 rounded-lg flex-1 shadow-lg"
              onPress={handleSubmit}
            >
              <Text className="text-white text-base font-medium text-center">Créer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default GroupForm;
