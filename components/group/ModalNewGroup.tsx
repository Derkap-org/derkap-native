import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { X } from "lucide-react-native";

export default function ModalNewGroup({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
}) {
  const [inputText, setInputText] = useState("");
  return (
    <Modal
      animationType="slide"
      visible={modalVisible}
      presentationStyle="pageSheet"
      supportedOrientations={["portrait"]}
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableOpacity
        className="w-full h-10 "
        onPress={() => setModalVisible(false)}
      ></TouchableOpacity>
      <View style={styles.container} className="">
        <Pressable
          className="absolute top-0 right-0"
          onPress={() => setModalVisible(false)}
          style={styles.closeButton}
        >
          <X color="black" size={24} />
        </Pressable>

        <Text style={styles.title}>Modal Screen</Text>

        <TextInput
          style={styles.input}
          onChangeText={setInputText}
          value={inputText}
          placeholder="Enter your text here"
          placeholderTextColor="#888"
        />

        <Pressable
          onPress={() => {
            Alert.alert("Input Submitted", inputText);
            setModalVisible(false);
          }}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </Pressable>

        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
  },
});
