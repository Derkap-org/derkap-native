import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  Text,
  Pressable,
  View,
  ViewProps,
  Dimensions,
  TextInput,
} from "react-native";
import { XIcon, RefreshCcw, Timer, ChevronLeft } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { Image } from "react-native";
import Button from "@/components/Button";
import { uploadPostToDB } from "@/functions/post-action";
import { TChallengeDB } from "@/types/types";
import Toast from "react-native-toast-message";
import { encryptPhoto, getEncryptionKey } from "@/functions/encryption-action";
import { compressImage } from "@/functions/image-action";
interface CameraProps extends ViewProps {
  challenge: TChallengeDB;
  setIsCapturing: (isCapturing: boolean) => void;
  refreshChallengeData: () => Promise<void>;
}

export default function Capture({
  setIsCapturing,
  challenge,
  refreshChallengeData,
  ...props
}: CameraProps) {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [captureDelay, setCaptureDelay] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null); // State to manage countdown
  const [isValidatingFile, setIsValidatingFile] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>("");
  const cameraRef = useRef<CameraView>(null);

  const screenWidth = Dimensions.get("window").width;
  const cameraHeight = (screenWidth * 5) / 4;

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex flex-col h-full w-full gap-y-4">
        <Text className="text-center pb-2">
          Il nous faut ta permission pour utiliser la caméra !
        </Text>
        <Button onClick={requestPermission} text="Autoriser" />
      </View>
    );
  }

  const validatePhoto = async () => {
    try {
      setIsValidatingFile(true);
      if (!capturedPhoto) throw new Error("Aucune photo à valider");

      if (!challenge) {
        throw new Error("Aucun défi sélectionné");
      }

      const compressedPhoto = await compressImage(capturedPhoto);
      setCapturedPhoto(compressedPhoto.uri);

      const encryptionKey = await getEncryptionKey({
        challenge_id: challenge?.id,
        group_id: challenge?.group_id,
      });

      const encryptedPhoto = await encryptPhoto({
        capturedPhoto: compressedPhoto.uri,
        encryptionKey,
      });

      await uploadPostToDB({
        group_id: challenge.group_id,
        challenge_id: challenge.id,
        encrypted_post: encryptedPhoto,
        caption,
      });

      setIsCapturing(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l'envoi du Derkap",
        text2: error.message || "Une erreur est survenue",
      });
    } finally {
      setIsValidatingFile(false);
      refreshChallengeData();
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleChangeDelay = () => {
    switch (captureDelay) {
      case 0:
        setCaptureDelay(3);
        break;
      case 3:
        setCaptureDelay(5);
        break;
      case 5:
        setCaptureDelay(10);
        break;
      case 10:
        setCaptureDelay(0);
        break;
    }
  };

  const startCountdown = () => {
    setCountdown(captureDelay); // Set the countdown to the current delay

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev === 1) {
          clearInterval(interval);
          capture();
          return null;
        }
        return prev - 1; // Decrement countdown
      });
    }, 1000);
  };

  const capture = async () => {
    if (!cameraRef.current) return;
    try {
      // Take a picture and save the result
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8, // Adjust quality as needed
        base64: false, // Set true if you want base64 data
      });

      setCapturedPhoto(photo.uri); // Save the photo URI
    } catch (error) {
      console.error("Failed to take picture:", error);
      Toast.show({
        type: "error",
        text1: "Erreur lors de la capture",
        text2: error.message || "Une erreur est survenue",
      });
    }
  };

  const handleCapture = () => {
    if (captureDelay === 0) {
      capture();
    } else {
      startCountdown();
    }
  };

  return (
    <View className="flex flex-col h-full w-full gap-y-2">
      <View style={{ height: cameraHeight }} className="rounded-2xl">
        {/* Top bar with reset button */}
        <View className="absolute top-2 left-0 right-0 z-10 p-4 flex-row items-start justify-between">
          <Pressable
            className=""
            onPress={() => {
              if (capturedPhoto) {
                setCapturedPhoto(null);
              } else {
                setIsCapturing(false);
              }
            }}
          >
            {capturedPhoto ? (
              <XIcon size={40} color="white" />
            ) : (
              <ChevronLeft size={40} color="white" />
            )}
          </Pressable>
        </View>

        {/* Countdown */}
        {countdown !== null && (
          <View className="absolute top-1/2 left-0 right-0 z-10 p-4 flex-row items-center justify-center">
            <Text className="text-white text-6xl">{countdown}</Text>
          </View>
        )}

        <View
          style={{ height: cameraHeight }}
          className="rounded-2xl overflow-hidden"
        >
          {/* Camera View */}
          {capturedPhoto ? (
            <Image source={{ uri: capturedPhoto }} className="flex-1" />
          ) : (
            <CameraView
              mirror={true}
              style={[styles.camera]}
              ref={cameraRef}
              facing={facing}
            />
          )}
        </View>

        {/* Bottom controls */}
        {!capturedPhoto && (
          <View className="absolute bottom-2 left-0 right-0 z-10 p-4 flex-row items-center justify-around">
            {/* Timer Button */}
            <Pressable
              onPress={handleChangeDelay}
              className="flex flex-row items-center"
            >
              <Timer size={32} color="white" />
              <Text className="text-white text-2xl">{captureDelay}s</Text>
            </Pressable>

            {/* Capture Button */}
            <Pressable
              className="h-20 w-20 rounded-full bg-white border-2 border-gray-300 items-center justify-center"
              onPress={() => {
                // Add capture functionality if needed
                handleCapture();
              }}
            >
              <View className="h-14 w-14 rounded-full bg-gray-100" />
            </Pressable>

            {/* Toggle Camera Button */}
            <Pressable className="items-center" onPress={toggleCameraFacing}>
              <RefreshCcw size={32} color="white" />
            </Pressable>
          </View>
        )}
      </View>
      {capturedPhoto && (
        <View className="flex flex-col gap-y-2 items-center justify-center w-full">
          <TextInput
            value={caption}
            onChangeText={setCaption}
            className="w-full p-4 bg-white rounded-xl"
            placeholder="Une légende pour ton oeuvre d'art ?"
          />
          <Button
            isCancel={isValidatingFile}
            withLoader={true}
            onClick={validatePhoto}
            text="Poster mon derkap de fou"
            className="mb-32 mx-auto w-full font-grotesque text-xl"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    borderColor: "red",
  },
});
