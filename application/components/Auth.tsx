import React, { useState, useRef } from "react";
import {
  Alert,
  Text,
  View,
  AppState,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Link, router } from "expo-router";
import { TextInput } from "react-native";
import Checkbox from "expo-checkbox";
import Button from "./Button";
import SwipeModal, {
  SwipeModalPublicMethods,
} from "@birdwingo/react-native-swipe-modal";
import { EyeOff, Eye } from "lucide-react-native";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [username, setUsername] = useState("");
  const [cguChecked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isPasswordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false);

  const modalCGURef = useRef<SwipeModalPublicMethods>(null);

  const showCGUModal = () => modalCGURef.current?.show();

  async function signInWithEmail() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      setLoading(false);
      if (error) console.error(error);
      else {
        router.push("/");
      }
    } catch (error) {
      Alert.alert("Erreur", "Email ou mot de passe incorrect.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function signUpWithEmail() {
    try {
      if (!cguChecked) {
        Alert.alert("Erreur", "Veuillez accepter les CGU pour continuer.");
        return;
      }

      setLoading(true);

      if (password !== passwordConfirmation) {
        Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
        return;
      }
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { username: username } },
      });

      if (error) console.error(error);
      router.push({
        pathname: "/confirm-email",
        params: { email: email },
      });
    } catch (error) {
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="relative flex-col items-center justify-center flex-1 w-full gap-y-20">
        <Text className="text-5xl text-center font-grotesque">
          Bienvenue sur {"\n"} Derkap ! 👋
        </Text>

        <View className="flex flex-col w-96 gap-y-4">
          <TextInput
            // label="Email"
            // leftIcon={{ type: "font-awesome", name: "envelope" }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="Email"
            autoCapitalize={"none"}
            className="w-full h-16 p-2 bg-white border border-gray-300 rounded-xl placeholder:text-gray-500"
          />
          {!isSignIn && (
            <TextInput
              // label="Username"
              // leftIcon={{ type: "font-awesome", name: "user" }}
              onChangeText={(text) => setUsername(text)}
              value={username}
              placeholder="Pseudo"
              autoCapitalize={"none"}
              className="w-full h-16 p-2 bg-white border border-gray-300 rounded-xl placeholder:text-gray-500"
            />
          )}

          <View className="flex flex-row items-center justify-between relative w-full bg-white border border-gray-300 rounded-xl pr-2">
            <TextInput
              // label="Password"
              // leftIcon={{ type: "font-awesome", name: "lock" }}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={!isPasswordVisible}
              placeholder="Mot de passe"
              autoCapitalize={"none"}
              className="w-10/12 h-16 p-2 placeholder:text-gray-500"
            />
            {isPasswordVisible ? (
              <Eye
                size={24}
                className=""
                color={"#000"}
                onPress={() => setPasswordVisible(false)}
              />
            ) : (
              <EyeOff
                size={24}
                color={"#000"}
                className=""
                onPress={() => setPasswordVisible(true)}
              />
            )}
          </View>

          {!isSignIn && (
            <View className="flex flex-row items-center justify-between relative w-full bg-white border border-gray-300 rounded-xl pr-2">
              <TextInput
                onChangeText={(text) => setPasswordConfirmation(text)}
                value={passwordConfirmation}
                secureTextEntry={!isPasswordConfirmationVisible}
                placeholder="Confirmer le mot de passe"
                autoCapitalize={"none"}
                className="w-10/12 h-16 p-2 placeholder:text-gray-500"
              />
              {isPasswordConfirmationVisible ? (
                <Eye
                  size={24}
                  className=""
                  color={"#000"}
                  onPress={() => setPasswordConfirmationVisible(false)}
                />
              ) : (
                <EyeOff
                  size={24}
                  color={"#000"}
                  className=""
                  onPress={() => setPasswordConfirmationVisible(true)}
                />
              )}
            </View>
          )}

          {!isSignIn && (
            <View className="flex flex-row items-center gap-x-2">
              <Checkbox
                value={cguChecked}
                onValueChange={setChecked}
                style={{ height: 16, width: 16, borderRadius: "100%" }}
              />
              <Text>
                J'accepte les{" "}
                <Text onPress={showCGUModal} className="underline">
                  CGU
                </Text>
              </Text>
            </View>
          )}

          <View className="flex flex-row justify-end">
            {isSignIn && (
              <Link
                className="text-[#9747ff]"
                href={{
                  pathname: "/password-forgotten",
                }}
              >
                Mot de passe oublié ?
              </Link>
            )}
          </View>

          <View className="">
            {isSignIn ? (
              <Button
                withLoader={true}
                text="Connexion"
                isCancel={loading}
                onClick={signInWithEmail}
              />
            ) : (
              <Button
                text="Inscription"
                isCancel={loading}
                withLoader={true}
                onClick={signUpWithEmail}
              />
            )}
          </View>

          <View className="flex flex-row justify-start">
            {isSignIn ? (
              <Pressable
                onPress={() => setIsSignIn(false)}
                className="cursor-pointer"
              >
                <Text>
                  Pas encore de compte ?{" "}
                  <Text className="text-[#9747ff]">Inscris-toi !</Text>
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => setIsSignIn(true)}
                className="cursor-pointer "
              >
                <Text>
                  Déjà un compte ?{" "}
                  <Text className="text-[#9747ff]">Connecte-toi !</Text>
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <SwipeModal
          ref={modalCGURef}
          showBar
          maxHeight={600}
          bg="white"
          style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          wrapInGestureHandlerRootView
        >
          <ScrollView className="flex flex-col px-10 py-10 bg-white gap-y-4">
            <Text className="text-2xl font-bold">
              Conditions Générales d'Utilisation (CGU) de Derkap {"\n"}
            </Text>
            <Text>
              1. Présentation de l'Application {"\n"}
              Derkap est une application mobile permettant aux utilisateurs de
              créer et de participer à des challenges photo entre amis. Editeur
              : Derkap Siège social : Paris, France Contact :
              contact.derkap@gmail.com L'utilisation de l'application implique
              l'acceptation sans réserve des présentes Conditions Générales
              d'Utilisation (CGU). {"\n"} {"\n"}
              2. Accès et Utilisation de l'Application {"\n"}
              L'application est accessible uniquement aux utilisateurs âgés d'au
              moins 16 ans. L'utilisateur est seul responsable du contenu qu'il
              publie et doit respecter les lois en vigueur. Les défis ne sont
              pas modérés par Derkap avant leur publication. Les utilisateurs
              s'engagent à ne pas proposer ou réaliser des défis dangereux,
              illégaux, discriminatoires, violents ou portant atteinte à la
              dignité d'autrui. {"\n"} {"\n"}
              3. Contenus Autorisés et Responsabilité {"\n"}
              Sont interdits : contenus à caractère violent, haineux,
              diffamatoire, discriminatoire, incitant à la haine ou portant
              atteinte à la vie privée. Aucune nudité ou contenu sexuellement
              explicite n'est toléré. Derkap ne peut être tenu responsable des
              publications des utilisateurs. Un système de signalement est en
              place pour notifier les abus. Derkap se réserve le droit de
              supprimer un contenu ou de bannir un utilisateur ne respectant pas
              ces règles. {"\n"} {"\n"}
              4. Protection des Données Personnelles {"\n"}
              Données collectées : email, photos partagées dans les groupes. Les
              photos sont chiffrées pour garantir la vie privée des
              utilisateurs. Derkap ne vend ni ne partage les données des
              utilisateurs avec des tiers. L'utilisateur peut demander la
              suppression de son compte et de ses données en envoyant un email à
              contact.derkap@gmail.com. Derkap ne peut être tenu responsable en
              cas de piratage ou de fuite de données. {"\n"} {"\n"}
              5. Monétisation {"\n"}
              Derkap ne contient ni publicité ni achats intégrés à sa création,
              mais se réserve le droit d'en inclure à l'avenir. {"\n"} {"\n"}
              6. Sanctions et Résiliation {"\n"}
              En cas de non-respect des règles, Derkap se réserve le droit de
              suspendre ou supprimer le compte de l'utilisateur sans préavis.{" "}
              {"\n"} {"\n"}
              7. Responsabilités {"\n"}
              Derkap ne peut être tenu responsable des comportements abusifs des
              utilisateurs. L'application est fournie "en l'état" sans garantie
              de fonctionnement continu. Les utilisateurs sont responsables de
              leur propre utilisation et des conséquences de leurs publications.{" "}
              {"\n"} {"\n"}
              8. Modification des CGU Derkap {"\n"}
              se réserve le droit de modifier ces CGU à tout moment. Les
              utilisateurs en seront informés via l'application. {"\n"} {"\n"}
              En utilisant Derkap, vous reconnaissez avoir lu et accepté ces
              CGU. En cas de non-respect, votre accès à l'application pourra
              être restreint ou supprimé. {"\n"}
              Dernière mise à jour : 03/02/2025
            </Text>
          </ScrollView>
        </SwipeModal>
      </View>
    </TouchableWithoutFeedback>
  );
}
