import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import tutorial images
const tutorialImages = [
  require("../assets/images/tuto/tuto_1.png"),
  require("../assets/images/tuto/tuto_2.png"),
  require("../assets/images/tuto/tuto_3.png"),
  require("../assets/images/tuto/tuto_4.png"),
  require("../assets/images/tuto/tuto_5.png"),
  require("../assets/images/tuto/tuto_6.png"),
];

interface TutorialProps {
  onFinish: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onFinish }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (currentImageIndex === tutorialImages.length) {
      // Last image, finish tutorial
      AsyncStorage.setItem("tutorialSeen", "true")
        .then(() => {
          onFinish();
        })
        .catch((error) => {
          console.error("Error saving tutorial state:", error);
          onFinish();
        });
    }
  }, [currentImageIndex]);

  // Preload all images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        setIsLoading(true);
        const imagePromises = tutorialImages.map((image) => {
          return Image.prefetch(Image.resolveAssetSource(image).uri);
        });

        await Promise.all(imagePromises);
        setIsLoading(false);
      } catch (error) {
        console.error("Error preloading images:", error);
        setIsLoading(false);
      }
    };

    preloadImages();
  }, []);

  const handleNext = () => {
    // Change image immediately
    setCurrentImageIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    // Change image immediately
    setCurrentImageIndex((prev) => prev - 1);
  };

  // Calculate image dimensions to maintain aspect ratio
  const getImageDimensions = () => {
    // Get the first image to determine aspect ratio
    const imageSource = Image.resolveAssetSource(tutorialImages[0]);
    const imageAspectRatio = imageSource.width / imageSource.height;

    // Calculate dimensions based on screen size
    let width, height;

    if (screenWidth / screenHeight > imageAspectRatio) {
      // Screen is wider than image
      height = screenHeight;
      width = height * imageAspectRatio;
    } else {
      // Screen is taller than image
      width = screenWidth;
      height = width / imageAspectRatio;
    }

    // Apply 10% safety margin
    width = width * 0.9;
    height = height * 0.9;

    return { width, height };
  };

  const imageDimensions = getImageDimensions();

  return (
    <View className="absolute inset-0 z-50 flex items-center justify-center bg-black">
      <View className="w-full h-full flex items-center justify-center">
        <View className="relative w-full h-full flex items-center justify-center">
          {isLoading ? (
            <View className="flex items-center justify-center">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : (
            <>
              {/* Render all images but only show the current one */}
              {tutorialImages.map((image, index) => (
                <View
                  key={index}
                  className={`absolute items-center justify-center ${
                    index === currentImageIndex ? "z-10" : "z-0 opacity-0"
                  }`}
                  style={{
                    width: imageDimensions.width,
                    height: imageDimensions.height,
                  }}
                >
                  <Image
                    source={image}
                    className="w-full h-full"
                    style={{
                      width: imageDimensions.width,
                      height: imageDimensions.height,
                    }}
                    resizeMode="contain"
                  />
                </View>
              ))}

              {/* Left touch area for previous */}
              <Pressable
                onPress={handlePrevious}
                disabled={currentImageIndex === 0}
                className={`absolute left-0 top-0 bottom-0 w-1/2 z-20`}
              />

              {/* Right touch area for next */}
              <Pressable
                onPress={handleNext}
                className={`absolute right-0 top-0 bottom-0 w-1/2 z-20`}
              />
              {/* 
              <View className="flex flex-row justify-center gap-x-4 mb-12">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className={`h-4 w-4 rounded-full transition-colors ${
                i <= step ? "bg-[#9747ff]" : "bg-zinc-700"
              }`}
            />
          ))}
        </View>
              
              */}
              <View className="absolute z-50 top-2 left-0 right-0 flex flex-row items-center justify-center gap-x-4">
                {tutorialImages.map((_, index) => (
                  <View
                    key={index}
                    className={`h-4 w-4 rounded-full transition-colors ${
                      index <= currentImageIndex
                        ? "bg-[#9747ff]"
                        : "bg-zinc-700"
                    }`}
                  />
                ))}
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default Tutorial;
