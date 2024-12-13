import { Pressable, PressableProps, Text } from "react-native";
import { cn } from "@/lib/utils";

interface ButtonProps extends PressableProps {
  text: React.ReactNode;
  isCancel?: boolean;
  textClassName?: string;
}
//todo add an pressable effect (change opacity when pressed)
export default function Button({
  text,
  isCancel,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={isCancel || props.disabled}
      className={cn(
        " bg-custom-primary text-white py-2 px-4 rounded-xl text-sm disabled:opacity-50",
        className,
        { "bg-gray-300 text-gray-400": isCancel },
      )}
    >
      <Text
        className={cn(
          textClassName,
          "p-2 text-xl text-center text-white font-grotesque",
        )}
      >
        {text}
      </Text>
    </Pressable>
  );
}
