import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Import your global CSS file
import "../global.css";

export default function Layout() {
    return (
      <SafeAreaView className="flex-1">
        <Slot />
    </SafeAreaView>
    );
  }