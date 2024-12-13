// import { Link } from 'expo-router'
import { Pressable, PressableProps, Text } from "react-native";
import { cn } from "@/lib/utils";

interface ButtonProps extends PressableProps {
  text: string;
  isCancel?: boolean;
  textClassName?: string;
  // asLink?: boolean;
  // url?: string;
}
export default function Button({
  text,
  // url,
  isCancel,
  // asLink,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  //todo: implement link but care Link/router.back etc
  // if (asLink) {
  //   return (
  //     <Link
  //       href={url ?? ''}
  //       className={cn(
  //         ' bg-custom-primary text-white py-2 px-4 rounded  text-sm',
  //         className,
  //         { 'bg-gray-300 text-gray-400': isCancel },
  //       )}
  //     >
  //       {' '}
  //       {text}{' '}
  //     </Link>
  //   );
  // }
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
