import React, {
  View,
  ViewProps,
  Text,
  Pressable,
  // FlatList,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import ChallengeBox from "../ChallengeBox";
import CapturePhoto from "./CapturePhoto";
import { Modal } from "@/components/modals/Modal";
import { ActionSheetRef } from "react-native-actions-sheet";
import { useEffect, useRef, useState } from "react";
import {
  TSuggestedChallenge,
  TSuggestedChallengeCategory,
} from "@/types/types";
import { getSuggestedChallenges } from "@/functions/suggested_challenges-action";

interface CaptureScreenProps extends ViewProps {
  challenge: string;
  setChallenge: (challenge: string) => void;
  challengeParam: string | undefined;
  capturedPhoto: string | null;
  setCaption: (caption: string) => void;
  passToPost: () => void;
  caption: string;
  setCapturedPhoto: (photo: string | null) => void;
}

export default function CaptureScreen({
  challenge,
  setChallenge,
  challengeParam,
  capturedPhoto,
  setCaption,
  caption,
  passToPost,
  setCapturedPhoto,
  ...props
}: CaptureScreenProps) {
  const [challengeCategories, setChallengeCategories] = useState<
    TSuggestedChallengeCategory[]
  >([]);
  const [suggestedChallenges, setSuggestedChallenges] = useState<
    TSuggestedChallenge[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<
    TSuggestedChallengeCategory | "Toutes"
  >("Toutes");
  const modalSuggestedChallengesRef = useRef<ActionSheetRef>(null);

  const fetchSuggestedChallenges = async () => {
    const { categories, challenges } = await getSuggestedChallenges();
    setChallengeCategories(categories);
    setSuggestedChallenges(challenges);
  };

  useEffect(() => {
    fetchSuggestedChallenges();
  }, []);

  const filteredChallenges =
    selectedCategory === "Toutes"
      ? suggestedChallenges
      : suggestedChallenges.filter(
          (challenge) => challenge.category === selectedCategory,
        );

  const handleCategorySelect = (
    category: TSuggestedChallengeCategory | "Toutes",
  ) => {
    setSelectedCategory(category);
  };

  const handleChallengeSelect = (selectedChallenge: string) => {
    setChallenge(selectedChallenge);
    modalSuggestedChallengesRef.current?.hide();
  };

  // Generate a color based on the category's index
  const getCategoryColor = (
    category: TSuggestedChallengeCategory | "Toutes",
  ) => {
    if (category === "Toutes") return "#B8A1FF"; // Default pastel purple for "Toutes"

    const index = challengeCategories.indexOf(category);
    if (index === -1) return "#B8A1FF"; // Default pastel purple if category not found

    // Generate a pastel color using HSL with lower saturation and higher lightness
    const hue = (index * 137.508) % 360; // Using golden angle for good distribution
    return `hsl(${hue}, 40%, 85%)`; // Lower saturation (40%) and higher lightness (85%) for pastel effect
  };

  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <>
      <View className="flex-1 justify-center">
        {!capturedPhoto && challengeParam === undefined && (
          <Pressable
            className="self-center gap-2 mb-4 bg-custom-primary rounded-xl py-2 px-4"
            onPress={() => modalSuggestedChallengesRef.current?.show()}
          >
            <Text className="text-white text-center  font-grotesque">
              Voir des idées de défis
            </Text>
          </Pressable>
        )}
        <ChallengeBox
          challenge={challenge}
          setChallenge={setChallenge}
          isChallengeChangeable={challengeParam === undefined}
        />
        <CapturePhoto
          canPassToPost={!!capturedPhoto && !!challenge}
          setCapturedPhoto={setCapturedPhoto}
          capturedPhoto={capturedPhoto}
          setCaption={setCaption}
          caption={caption}
          passToPost={passToPost}
        />
      </View>
      <Modal fullScreen={true} actionSheetRef={modalSuggestedChallengesRef}>
        <View className="flex flex-col h-full">
          <Text className="py-4 text-2xl font-bold text-center text-white font-grotesque">
            Idées de défis
          </Text>

          {/* Categories horizontal scroll */}
          <View className="mb-4">
            <FlatList
              horizontal
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              data={["Toutes", ...challengeCategories]}
              keyExtractor={(item) => item}
              renderItem={({ item: category }) => (
                <Pressable
                  onPress={() => handleCategorySelect(category)}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    selectedCategory === category ? "" : "bg-zinc-700"
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory === category
                        ? getCategoryColor(category)
                        : undefined,
                  }}
                >
                  <Text
                    className={`font-grotesque ${
                      selectedCategory === category
                        ? "text-black"
                        : "text-white"
                    }`}
                  >
                    {capitalizeFirstLetter(category)}
                  </Text>
                </Pressable>
              )}
            />
          </View>

          {/* Challenges vertical scroll */}
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={filteredChallenges}
            keyExtractor={(item) => item.challenge}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleChallengeSelect(item.challenge)}
                className="px-4 py-2 mb-2 rounded-xl bg-zinc-800"
              >
                <View className="">
                  <View
                    className="px-2 py-1 rounded-full self-center mb-1"
                    style={{
                      backgroundColor: getCategoryColor(item.category),
                    }}
                  >
                    <Text className="text-black text-xs font-grotesque">
                      {capitalizeFirstLetter(item.category)}
                    </Text>
                  </View>
                  <Text className="text-white text-center font-grotesque text-lg">
                    {item.challenge}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </>
  );
}
