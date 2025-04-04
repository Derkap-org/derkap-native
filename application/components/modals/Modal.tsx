import { View } from "react-native";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Modal = ({
  children,
  actionSheetRef,
  fullScreen = false,
  onClose,
}: {
  children: React.ReactNode;
  actionSheetRef: React.RefObject<ActionSheetRef>;
  fullScreen?: boolean;
  onClose?: () => void;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <ActionSheet
      useBottomSafeAreaPadding
      safeAreaInsets={insets}
      gestureEnabled
      ref={actionSheetRef}
      onClose={onClose}
      containerStyle={
        fullScreen
          ? {
              height: "90%",
              maxHeight: "90%",
              backgroundColor: "#0E0E10",
            }
          : {
              maxHeight: "90%",
              backgroundColor: "#0E0E10",
            }
      }
    >
      <View className="flex flex-col px-6 py-4 gap-y-4">{children}</View>
    </ActionSheet>
  );
};
