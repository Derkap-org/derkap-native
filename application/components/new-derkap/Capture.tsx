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
import { XIcon, Timer, Zap, ZapOff } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { Image } from "react-native";
import Button from "@/components/Button";
import Toast from "react-native-toast-message";
import { Modal } from "../modals/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import React from "react";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { useSupabase } from "@/context/auth-context";

interface CameraProps extends ViewProps {
  setCapturedPhoto: (photo: string | null) => void;
  capturedPhoto: string | null;
  setCaption: (caption: string) => void;
  caption: string;
  passToPost: () => void;
  canPassToPost: boolean;
}

export default function Capture({
  setCapturedPhoto,
  capturedPhoto,
  setCaption,
  caption,
  passToPost,
  canPassToPost,
  ...props
}: CameraProps) {
  const [facing, setFacing] = useState<CameraType>("front");
  const [permission, requestPermission] = useCameraPermissions();

  const [captureDelay, setCaptureDelay] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null); // State to manage countdown

  const [flash, setFlash] = useState<"on" | "off">("off");
  const cameraRef = useRef<CameraView>(null);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const { user } = useSupabase();

  // Reference for double tap gesture handler
  const doubleTapRef = useRef(null);

  // Zoom state
  const scale = useSharedValue(1);
  const zoomLevel = useSharedValue(0);
  // Regular state for camera zoom (0-1)
  const [cameraZoom, setCameraZoom] = useState(0);
  const MAX_ZOOM = 0.25; // Reduced maximum zoom level (0.25 = 25% zoom)
  const lastScale = useSharedValue(1);

  // useEffect(() => {
  //   console.log("zoom", cameraZoom);
  //   console.log("zoomLevel", zoomLevel.value);
  //   console.log("scale", scale.value);
  //   console.log("lastScale", lastScale.value);
  // }, [zoomLevel, cameraZoom, scale, lastScale]);

  const showModal = () => actionSheetRef.current?.show();
  const hideModal = () => actionSheetRef.current?.hide();

  const screenWidth = Dimensions.get("window").width;
  const cameraHeight = (screenWidth * 5) / 4;

  // Create pinch gesture using the new Gesture API
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      // Store the current scale as starting point
      lastScale.value = scale.value;
    })
    .onUpdate((event) => {
      // Calculate new scale based on pinch gesture with greatly reduced sensitivity (1/4)
      const newScale = Math.max(
        1,
        Math.min(
          lastScale.value * (1 + (event.scale - 1) * 0.05),
          1 + MAX_ZOOM,
        ),
      );
      scale.value = newScale;

      // Convert scale to zoom (0-1 range)
      zoomLevel.value = (newScale - 1) / MAX_ZOOM;

      // Update the regular state for camera zoom
      runOnJS(setCameraZoom)(zoomLevel.value);
    })
    .onEnd(() => {
      // Optional: Add a small animation when releasing the pinch
      scale.value = withTiming(scale.value, { duration: 100 });
      lastScale.value = scale.value;
    });

  // Double tap gesture for toggling camera facing
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(toggleCameraFacing)();
    });

  // Combine gestures
  const combinedGestures = Gesture.Exclusive(pinchGesture, doubleTapGesture);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex flex-col h-full w-full gap-y-4">
        <Text className="text-center pb-2 text-white">
          Il nous faut ta permission pour utiliser la caméra !
        </Text>
        <Button onClick={requestPermission} text="Autoriser" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
    // Reset zoom values when camera facing changes
    scale.value = 1;
    zoomLevel.value = 0;
    lastScale.value = 1;
    setCameraZoom(0);
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

  const toggleFlash = () => {
    setFlash(flash === "off" ? "on" : "off");
    scale.value = 1;
    zoomLevel.value = 0;
    lastScale.value = 1;
    setCameraZoom(0);
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
    <>
      <View className="flex flex-col h-full w-full gap-y-2">
        <View style={{ height: cameraHeight }} className="">
          {/* Top bar with reset button */}

          <View className="absolute top-2 left-0 right-0 z-10 p-4 flex-row items-start justify-between">
            <Pressable
              className=""
              onPress={() => {
                if (capturedPhoto) {
                  setCapturedPhoto(null);
                }
              }}
            >
              {capturedPhoto && <XIcon size={40} color="white" />}
            </Pressable>

            {!capturedPhoto && (
              <View className="flex flex-row items-center gap-x-4">
                {/* Timer Button */}
                <Pressable
                  onPress={handleChangeDelay}
                  className="flex flex-row items-center"
                >
                  <Text className="text-white text-2xl">{captureDelay}s</Text>
                  <Timer size={28} color="white" />
                </Pressable>
                {/* Flash Button */}
                <Pressable
                  onPress={toggleFlash}
                  className="flex flex-row items-center"
                >
                  {flash === "off" ? (
                    <ZapOff size={28} color="white" />
                  ) : (
                    <Zap size={28} color="white" />
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {capturedPhoto && (
            <View className="absolute bottom-0 left-0 right-0 z-10 p-4 flex-row items-start justify-between">
              <Pressable
                className="w-full p-4 bg-zinc-800/90 rounded-xl"
                onPress={showModal}
              >
                <Text className="text-zinc-400 text-center">
                  {caption || "Une légende pour ton oeuvre d'art ?"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Countdown */}
          {countdown !== null && (
            <View className="absolute top-1/2 left-0 right-0 z-10 p-4 flex-row items-center justify-center">
              <Text className="text-white text-6xl">{countdown}</Text>
            </View>
          )}

          <GestureHandlerRootView
            style={{ height: cameraHeight }}
            className=" overflow-hidden"
          >
            {/* Camera View */}
            {capturedPhoto ? (
              <Image source={{ uri: capturedPhoto }} className="flex-1" />
            ) : (
              <GestureDetector gesture={combinedGestures}>
                <Animated.View style={{ flex: 1 }}>
                  <CameraView
                    mirror={true}
                    style={[styles.camera]}
                    ref={cameraRef}
                    facing={facing}
                    zoom={cameraZoom}
                    flash={flash}
                  />
                </Animated.View>
              </GestureDetector>
            )}
          </GestureHandlerRootView>

          {/* Bottom controls */}
          {!capturedPhoto && (
            <View className="absolute bottom-2 left-0 right-0 z-10 p-4 flex-row items-center justify-around">
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
            </View>
          )}
        </View>
        {capturedPhoto && (
          <View className="px-2">
            <Button
              isCancel={!canPassToPost}
              withLoader={true}
              onClick={passToPost}
              text="Envoyer à"
              className=" mx-auto w-full font-grotesque text-xl"
            />
          </View>
        )}
      </View>
      <Modal actionSheetRef={actionSheetRef}>
        <View className="flex flex-col gap-y-2 items-center justify-center w-full">
          <TextInput
            value={caption}
            onChangeText={setCaption}
            className="w-full p-4 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl"
            autoFocus={true}
            placeholder="Une légende pour ton oeuvre d'art ?"
            maxLength={35}
          />
          <Button
            isCancel={!canPassToPost}
            withLoader={true}
            onClick={passToPost}
            text="Envoyer à"
            className=" mx-auto w-full font-grotesque text-xl"
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    borderColor: "red",
  },
});
