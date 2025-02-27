import React, { useEffect, useState, ReactNode } from "react";
import { mustUpdateApp } from "@/functions/version-action";
import { View, ActivityIndicator } from "react-native";
import UpdateApp from "./UpdateApp";

interface VersionCheckProps {
  children: ReactNode;
}

export default function VersionCheck({ children }: VersionCheckProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        setIsChecking(true);
        const updateRequired = await mustUpdateApp();

        if (updateRequired) {
          setNeedsUpdate(true);
        }
      } catch (error) {
        console.error("Error checking app version:", error);
        // Continue with the app if there's an error checking version
      } finally {
        setIsChecking(false);
      }
    };

    checkAppVersion();
  }, []);

  // Show loading indicator while checking version
  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#8C4BF5" />
      </View>
    );
  }

  // If needs update, render the update screen directly
  if (needsUpdate) {
    return <UpdateApp />;
  }

  // Otherwise, render children
  return <>{children}</>;
}
