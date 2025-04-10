import React, { useState } from "react";
import {
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { supabase } from "@/lib/supabase";
import Welcome from "./auth/Welcome";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";

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

type AuthScreen = "welcome" | "signin" | "signup";

export default function Auth() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>("welcome");

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <Welcome
            onSignInPress={() => setCurrentScreen("signin")}
            onSignUpPress={() => setCurrentScreen("signup")}
          />
        );
      case "signin":
        return <SignIn onSignUpPress={() => setCurrentScreen("signup")} />;
      case "signup":
        return <SignUp onSignInPress={() => setCurrentScreen("signin")} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {renderScreen()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
