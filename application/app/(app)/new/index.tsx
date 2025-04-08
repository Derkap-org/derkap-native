import ChallengeBox from "@/components/ChallengeBox";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { View, Text, Pressable, Keyboard } from "react-native";
import { useState } from "react";
import Capture from "@/components/new-derkap/Capture";
import { generateKeys } from "@/functions/encryption-action";
import { encryptPhoto } from "@/functions/encryption-action";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { uploadDerkapToDB } from "@/functions/derkap-action";
import { UUID } from "crypto";
import { compressImage } from "@/functions/image-action";
import React from "react";
import SendTo from "@/components/new-derkap/SendTo";
export default function New() {
  const { challenge: challengeParam, followingUsers } =
    useLocalSearchParams() as {
      challenge?: string;
      followingUsers?: string[];
    };
  const [challenge, setChallenge] = useState(challengeParam || "");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isSendingDerkap, setIsSendingDerkap] = useState<boolean>(false);
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);

  const [step, setStep] = useState<"capture" | "post">("capture");
  const handleBack = () => {
    if (step === "capture") {
      router.back();
    } else {
      setStep("capture");
    }
  };

  const postDerkap = async () => {
    try {
      setIsSendingDerkap(true);
      if (!capturedPhoto) throw new Error("Aucune photo à valider");

      if (!challenge) {
        throw new Error("Aucun défi sélectionné");
      }

      if (caption.length > 35) return;

      const compressedPhoto = await compressImage({
        uri: capturedPhoto,
      });
      setCapturedPhoto(compressedPhoto.uri);

      const { encryption_key, derkap_base_key } = await generateKeys({
        challenge,
      });

      const encryptedPhoto = await encryptPhoto({
        capturedPhoto: compressedPhoto.uri,
        encryptionKey: encryption_key,
      });

      await uploadDerkapToDB({
        challenge: challenge,
        encrypted_post: encryptedPhoto,
        caption,
        allowed_users: allowedUsers as UUID[],
        derkap_base_key,
      });

      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l'envoi du Derkap",
        text2: error.message || "Une erreur est survenue",
      });
    } finally {
      setIsSendingDerkap(false);
    }
  };

  const passToPost = () => {
    try {
      if (!capturedPhoto) throw new Error("Aucune photo à valider");
      if (caption.length > 35) throw new Error("La légende est trop longue");
      if (!challenge) throw new Error("Aucun défi défini");
      setStep("post");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: error.message || "Une erreur est survenue",
      });
    }
  };

  return (
    <Pressable onPress={Keyboard.dismiss} className="flex-1">
      <View className="flex-1">
        <View className="flex-row justify-between items-center px-4 py-1 bg-[#212123 to see] mb-4">
          <View className="w-[12.5%] flex flex-row items-center justify-start">
            <Pressable onPress={() => handleBack()}>
              <ChevronLeft size={32} color={"white"} />
            </Pressable>
          </View>

          <View className="w-[75%] flex flex-row items-center justify-center">
            <Text className="text-2xl font-grotesque text-white">
              {step === "capture" ? "Nouveau Derkap" : "Envoyer à"}
            </Text>
          </View>

          <View className="w-[12.5%] flex flex-row items-center justify-end"></View>
        </View>

        {step === "capture" && (
          <View className="flex-1 justify-center">
            <ChallengeBox
              challenge={challenge}
              setChallenge={setChallenge}
              isChallengeChangeable={challengeParam === undefined}
            />
            <Capture
              canPassToPost={!!capturedPhoto && !!challenge}
              setCapturedPhoto={setCapturedPhoto}
              capturedPhoto={capturedPhoto}
              setCaption={setCaption}
              caption={caption}
              passToPost={passToPost}
            />
          </View>
        )}
        {step === "post" && (
          <SendTo
            followingUsers={followingUsers}
            isSendingDerkap={isSendingDerkap}
            allowedUsers={allowedUsers}
            setAllowedUsers={setAllowedUsers}
            postDerkap={postDerkap}
          />
        )}
      </View>
    </Pressable>
  );
}
