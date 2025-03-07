import React, { useState } from "react";
import {
  Pressable,
  PressableProps,
  Text,
  ActivityIndicator,
} from "react-native";
import { cn } from "@/lib/utils";

interface ButtonProps extends PressableProps {
  text: React.ReactNode;
  isCancel?: boolean;
  textClassName?: string;
  onClick: () => Promise<any> | any;
  withLoader?: boolean;
}

export default function Button({
  text,
  isCancel,
  className,
  textClassName,
  withLoader = false,
  ...props
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleClick = async () => {
    try {
      if (withLoader) setShowLoader(true);
      await props.onClick();
    } catch (e) {
      console.error("Error in Button component:", e);
    } finally {
      if (withLoader) setShowLoader(false);
    }
  };

  return (
    <Pressable
      {...props}
      onPress={handleClick}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isCancel || props.disabled}
      style={[
        {
          backgroundColor: isCancel ? "#d1d5db" : "#9747ff",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      className={cn(
        "py-2 px-4 rounded-xl text-sm disabled:opacity-50 ",
        className,
      )}
    >
      <Text
        className={cn(
          "p-2 text-xl text-center text-white font-grotesque relative",
          { "text-gray-400": isCancel },
          { invisible: showLoader },
          textClassName,
        )}
      >
        {text}
      </Text>
      {showLoader && (
        <ActivityIndicator className="absolute inset-0" color="white" />
      )}
    </Pressable>
  );
}
