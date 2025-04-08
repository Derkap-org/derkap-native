import React, { useState } from "react";
import {
  Pressable,
  PressableProps,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import { cn } from "@/lib/utils";

interface ButtonProps extends PressableProps {
  text?: React.ReactNode;
  isCancel?: boolean;
  textClassName?: string;
  onClick: () => Promise<any> | any;
  withLoader?: boolean;
  color?: "primary" | "danger" | "gray" | "green" | "gray-dark";
  children?: React.ReactNode;
}

export default function Button({
  text,
  isCancel,
  className,
  textClassName,
  color = "primary",
  withLoader = false,
  children,
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
          backgroundColor: isCancel
            ? "#9ca3af"
            : color === "primary"
              ? "#9747ff"
              : color === "gray"
                ? "#9ca3af"
                : color === "danger"
                  ? "#ff4747"
                  : color === "green"
                    ? "#16a34a"
                    : color === "gray-dark"
                      ? "#212123"
                      : "transparent",

          opacity: pressed ? 0.7 : 1,
        },
      ]}
      className={cn(
        "rounded-xl text-sm disabled:opacity-50",
        // Apply default padding only if not explicitly overridden in className
        !className?.includes("py-") && "py-2",
        !className?.includes("px-") && "px-4",
        className,
      )}
    >
      {text && (
        <Text
          className={cn(
            "p-2 text-xl text-center text-white font-grotesque relative",
            { "text-gray-500": isCancel },
            { invisible: showLoader },
            textClassName,
          )}
        >
          {text}
        </Text>
      )}
      {children && (
        <View className={cn({ "opacity-0": showLoader })}>{children}</View>
      )}
      {showLoader && (
        <ActivityIndicator className="absolute inset-0" color="white" />
      )}
    </Pressable>
  );
}
