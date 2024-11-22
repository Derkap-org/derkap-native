import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { XIcon, RefreshCcw, Timer } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [captureDelay, setCaptureDelay] = useState<0 | 3 | 5 | 10>(0);
  const [countdown, setCountdown] = useState<number | null>(null); // State to manage countdown
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center pb-2">Il nous faut ta permission pour utiliser la caméra !</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }


  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
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
      setCountdown(prev => {
        if (prev === null) return null;
        if (prev === 1) {
          clearInterval(interval);
          capture();
          return  null;
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
      console.log('Photo captured:', photo);
    } catch (error) {
      console.error('Failed to take picture:', error);
    }
  }

  const handleCapture = () => {
    if (captureDelay === 0) {
      capture();
    } else {
      startCountdown();
    }
  }

  return (
    <View className="flex-1 bg-black">
      {/* Top bar with reset button */}
      <View className="absolute top-10 left-0 right-0 z-10 p-4 flex-row items-start justify-between">
        <TouchableOpacity
          className=""
          onPress={() => {
            setCapturedPhoto(null);
          }}
        >
          <XIcon size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Countdown */}
      {countdown !== null && (
        <View className="absolute top-1/2 left-0 right-0 z-10 p-4 flex-row items-center justify-center">
          <Text className="text-white text-6xl">{countdown}</Text>
        </View>
      )}

      {/* Camera View */}
      {capturedPhoto ? (
        <Image source={{ uri: capturedPhoto }} className='flex-1' />
      ) : (
        <CameraView mirror={true} style={styles.camera} ref={cameraRef} facing={facing} />
      )}

      {/* Bottom controls */}
      <View className="absolute bottom-10 left-0 right-0 z-10 p-4 flex-row items-center justify-around">
        {/* Timer Button */}
        <TouchableOpacity 
          onPress={handleChangeDelay}
        className="flex flex-row items-center">
          <Timer size={32} color="white" />
          <Text className="text-white text-2xl">{captureDelay}s</Text>
        </TouchableOpacity>

        {/* Capture Button */}
        <TouchableOpacity
          className="h-20 w-20 rounded-full bg-white border-2 border-gray-300 items-center justify-center"
          onPress={() => {
            // Add capture functionality if needed
            handleCapture();
          }}
        >
          <View className="h-14 w-14 rounded-full bg-gray-100" />
        </TouchableOpacity>

        {/* Toggle Camera Button */}
        <TouchableOpacity className="items-center" onPress={toggleCameraFacing}>
          <RefreshCcw size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});
