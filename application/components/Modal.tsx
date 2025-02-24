import { View } from "react-native";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Modal = ({
  children,
  actionSheetRef,
  fullScreen = false,
}: {
  children: React.ReactNode;
  actionSheetRef: React.RefObject<ActionSheetRef>;
  fullScreen?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <ActionSheet
      useBottomSafeAreaPadding
      safeAreaInsets={insets}
      gestureEnabled
      ref={actionSheetRef}
      containerStyle={
        fullScreen
          ? {
              height: "90%",
              maxHeight: "90%",
            }
          : {
              maxHeight: "90%",
            }
      }
    >
      <View className="flex flex-col px-6 pt-4 bg-white gap-y-4">
        {children}
      </View>
    </ActionSheet>
  );
};
