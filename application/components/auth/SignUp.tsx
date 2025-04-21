import React, { useEffect, useState } from "react";
import { Text, View, TextInput, Pressable } from "react-native";
import Button from "../Button";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import Toast from "react-native-toast-message";
import { EyeOff, Eye, ChevronLeft } from "lucide-react-native";
import { isUsernameAvailableInDB } from "@/functions/profile-action";
interface SignUpProps {
  onSignInPress: () => void;
}

export default function SignUp({ onSignInPress }: SignUpProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isBirthdateValid, setIsBirthdateValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);

  const checkUsernameAvailability = async () => {
    const isAvailable = await isUsernameAvailableInDB(username);
    setIsUsernameAvailable(isAvailable);
  };

  useEffect(() => {
    if (username.length > 2 && username.length < 16) {
      checkUsernameAvailability();
    }
  }, [username]);

  useEffect(() => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setIsEmailValid(isEmailValid);
  }, [email]);

  useEffect(() => {
    const isUsernameValid =
      username.length > 2 &&
      username.length < 16 &&
      /^[a-zA-Z0-9]+$/.test(username);
    setIsUsernameValid(isUsernameValid);
  }, [username]);

  useEffect(() => {
    const isPasswordValid =
      password.length >= 8 &&
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d\s\S]{8,}$/.test(
        password,
      );
    setIsPasswordValid(isPasswordValid);
  }, [password]);

  const formatBirthdate = (input: string) => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, "");

    // Format the date as DD/MM/YYYY
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const handleBirthdateChange = (text: string) => {
    const formatted = formatBirthdate(text);
    setBirthdate(formatted);
  };

  useEffect(() => {
    const validateBirthdate = () => {
      if (birthdate.length !== 10) return false; // DD/MM/YYYY format

      const [day, month, year] = birthdate.split("/").map(Number);
      const today = new Date();
      const birthDate = new Date(year, month - 1, day);
      const age = today.getFullYear() - birthDate.getFullYear();

      // check day and month are valid
      if (day < 1 || day > 31 || month < 1 || month > 12) return false;

      // Check if birthday has occurred this year
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 15;
      }
      console.log({ birthdate, age });
      return age >= 15;
    };

    setIsBirthdateValid(validateBirthdate());
  }, [birthdate]);

  useEffect(() => {
    if (step === 1) {
      setIsButtonDisabled(!isEmailValid);
    } else if (step === 2) {
      setIsButtonDisabled(
        !isEmailValid || !isUsernameValid || !isUsernameAvailable,
      );
    } else if (step === 3) {
      setIsButtonDisabled(
        !isEmailValid || !isUsernameValid || !isBirthdateValid,
      );
    } else if (step === 4) {
      setIsButtonDisabled(
        !isEmailValid ||
          !isUsernameValid ||
          !isBirthdateValid ||
          !isPasswordValid,
      );
    }
  }, [
    isEmailValid,
    isUsernameValid,
    isBirthdateValid,
    isPasswordValid,
    step,
    isUsernameAvailable,
  ]);

  async function handleSignUp() {
    try {
      if (!isUsernameValid) {
        throw new Error("Le pseudo doit contenir entre 3 et 16 caractères.");
      }

      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { username: username, birthdate: birthdate } },
      });

      if (error) throw error;
      router.push({
        pathname: "/confirm-email",
        params: { email: email },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erreur lors de l'inscription",
        text2: error?.message || "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleContinue = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      await handleSignUp();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <View className="flex-1 px-4 pt-12">
      <View className="flex-col items-center w-full max-w-96 mx-auto">
        <View className="relative w-full flex-row items-center justify-center mb-4">
          {step > 1 && (
            <Pressable onPress={handleBack} className="absolute left-0 p-2">
              <ChevronLeft size={24} color="white" />
            </Pressable>
          )}
          <Text className="text-3xl text-center font-grotesque text-white">
            Inscription
          </Text>
        </View>

        <View className="flex flex-row justify-center gap-x-4 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={`h-4 w-4 rounded-full transition-colors ${
                i <= step ? "bg-[#9747ff]" : "bg-zinc-700"
              }`}
            />
          ))}
        </View>

        <View className="w-full">
          {step === 1 && (
            <>
              <View className="flex flex-col justify-between mb-4">
                <Text className="text-white text-lg font-bold">
                  Quel est ton email ?
                </Text>
                <Text className="text-zinc-400 text-sm">
                  Tu vas recevoir un code de vérification pour valider ton email
                </Text>
              </View>

              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                className="w-full h-16 p-4 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl mb-2"
              />
            </>
          )}

          {step === 2 && (
            <>
              <View className="flex flex-col justify-between mb-4">
                <Text className="text-white text-lg font-bold">
                  Comment doit-on t'appeler ?
                </Text>
                <Text className="text-zinc-400 text-sm">
                  Ce pseudo est public, partage le avec tes amis pour les
                  retrouver plus facilement
                </Text>
              </View>
              <TextInput
                onChangeText={setUsername}
                value={username}
                placeholder="Pseudo"
                autoCapitalize="none"
                className="w-full h-16 p-4 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl mb-2"
              />
            </>
          )}

          {step === 3 && (
            <>
              <View className="flex flex-col justify-between mb-4">
                <Text className="text-white text-lg font-bold">
                  Quelle est ta date de naissance ?
                </Text>
                <Text className="text-zinc-400 text-sm">
                  Tu dois avoir au moins 15 ans pour t'inscrire sur Derkap
                </Text>
              </View>
              <TextInput
                onChangeText={handleBirthdateChange}
                value={birthdate}
                placeholder="JJ/MM/AAAA"
                keyboardType="numeric"
                maxLength={10}
                className="w-full h-16 p-4 bg-zinc-800 placeholder:text-zinc-400 text-white rounded-xl mb-2"
              />

              <Text className="text-[#ff4747] text-sm ">
                {birthdate.length === 10 && !isBirthdateValid
                  ? "Tu dois avoir au moins 15 ans minimum"
                  : ""}
              </Text>
            </>
          )}

          {step === 4 && (
            <>
              <View className="flex flex-col justify-between mb-4">
                <Text className="text-white text-lg font-bold">
                  Choisi un mot de passe
                </Text>
                <Text className="text-zinc-400 text-sm">
                  8 caractères minimum, lettres et chiffres, au moins une
                  majuscule, un caractère spécial
                </Text>
              </View>
              <View className="flex-row items-center justify-between relative bg-zinc-800 rounded-xl mb-2">
                <TextInput
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="Mot de passe"
                  autoCapitalize="none"
                  className="flex-1 h-16 p-4 placeholder:text-zinc-400 text-white"
                />
                <Pressable
                  onPress={() => setPasswordVisible(!isPasswordVisible)}
                  className="px-4"
                >
                  {isPasswordVisible ? (
                    <Eye size={24} color="white" />
                  ) : (
                    <EyeOff size={24} color="white" />
                  )}
                </Pressable>
              </View>
            </>
          )}

          <View className="mb-4">
            <Text
              className={`text-white text-sm ${
                isUsernameAvailable ? "text-[#16a34a]" : "text-[#ff4747]"
              }`}
            >
              {username.length < 3 || username.length > 16 || step !== 2
                ? ""
                : isUsernameAvailable
                  ? "✅ Ce pseudo est disponible"
                  : "❌ Ce pseudo est déjà pris"}
            </Text>
          </View>

          <Button
            text={step === 4 ? "Confirmer" : "Continuer"}
            onClick={handleContinue}
            withLoader={true}
            isCancel={loading || isButtonDisabled}
          />

          <View className="mt-4">
            <Pressable onPress={onSignInPress}>
              <Text className="text-white text-center">
                Déjà un compte ?{" "}
                <Text className="text-[#9747ff]">Connecte-toi !</Text>
              </Text>
            </Pressable>
          </View>

          {step === 4 && (
            <Text className="text-zinc-400 text-center text-sm mt-6">
              En t'inscrivant sur Derkap, tu acceptes de respecter{"\n"}
              les{" "}
              <Link href="https://derkap.fr/cgu" className="underline">
                conditions générales d'utilisation de l'application
              </Link>
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
