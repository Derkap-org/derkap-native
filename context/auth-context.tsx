import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { TProfileDB } from "../types/types";
import { getProfile } from "../functions/profile-action";

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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setIsLoading(false);
      },
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
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
