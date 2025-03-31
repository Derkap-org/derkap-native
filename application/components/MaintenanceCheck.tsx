import React, { useEffect, useState, ReactNode } from "react";
import { getIsMaintenance } from "@/functions/maintenance-action";
import { View, ActivityIndicator } from "react-native";
import Maintenance from "./Maintenance";

interface MaintenanceCheckProps {
  children: ReactNode;
}

export default function MaintenanceCheck({ children }: MaintenanceCheckProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isInMaintenance, setIsInMaintenance] = useState(false);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        setIsChecking(true);
        const isInMaintenance = await getIsMaintenance();
        if (isInMaintenance) {
          setIsInMaintenance(true);
        }
      } catch (error) {
        console.error("Error checking maintenance:", error);
        // Continue with the app if there's an error checking version
      } finally {
        setIsChecking(false);
      }
    };

    checkMaintenance();
  }, []);

  // Show loading indicator while checking version
  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  // If needs update, render the update screen directly
  if (isInMaintenance) {
    return <Maintenance />;
  }

  // Otherwise, render children
  return <>{children}</>;
}
