module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.expo/"],
  collectCoverageFrom: [
    "functions/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "store/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(expo|@expo|react-native|@react-native|@react-navigation|@unimodules|nativewind|@react-native-async-storage|@react-native-community|@react-navigation|@react-native-picker|@react-native-svg|@react-native-masked-view|@react-native-segmented-control|@react-native-clipboard|@react-native-firebase|@react-native-google-signin|@react-native-camera|@react-native-image-picker|@react-native-reanimated|@react-native-safe-area-context|@react-native-screens|@react-native-vector-icons|@react-navigation/.*|@react-native/.*|@react-native-async-storage/async-storage|expo-file-system|expo-constants|expo-crypto|expo-notifications|expo-camera|expo-image-picker|expo-image-manipulator|expo-asset|expo-font|expo-blur|expo-status-bar|expo-splash-screen|expo-system-ui|expo-web-browser|expo-linking|expo-router)/)",
  ],
};
