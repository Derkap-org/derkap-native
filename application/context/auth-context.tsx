import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { TProfileDB } from "../types/types";
import { getProfile } from "../functions/profile-action";
import * as Linking from "expo-linking";
import { router } from "expo-router";

type SupabaseContextType = {
  session: Session | null;
  user: User | null;
  profile: TProfileDB | null;
  isLoading: boolean;
  updateProfileImg: (newImgUrl: string) => void;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined,
);

export const SupabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<TProfileDB | null>(null);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      try {
        if (url.includes("type=recovery")) {
          const fragment = url.split("#")[1];
          if (!fragment) return;

          const params = new URLSearchParams(fragment);

          // Extract all tokens from URL
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");

          if (access_token && refresh_token) {
            console.log("Setting session with tokens");

            // Set the session with all token information
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              return;
            }

            if (data.session) {
              console.log("Session set successfully");
              setSession(data.session);
              router.push("/update-password");
            }
          }
        }
      } catch (error) {
        console.error("Error handling deep link:", error);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Check for initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Regular auth state handling
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setIsLoading(false);

        // If we receive a password recovery event, navigate to update password
        if (event === "PASSWORD_RECOVERY") {
          router.push("/update-password");
        }
      },
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
      subscription.remove();
    };
  }, []);

  const fetchProfile = async () => {
    const { data } = await getProfile();
    if (data) setProfile(data);
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const updateProfileImg = (newImgUrl: string) => {
    if (!profile || !newImgUrl) return;
    setProfile((prevData) => ({
      ...prevData,
      avatar_url: newImgUrl,
      avatarTimestamp: Date.now(),
    }));
  };

  return (
    <SupabaseContext.Provider
      value={{
        updateProfileImg,
        session,
        profile,
        user: session?.user || null,
        isLoading,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);

  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }

  return {
    ...context,
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
};
