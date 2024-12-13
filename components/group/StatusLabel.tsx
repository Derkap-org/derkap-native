import { View, Text, ViewProps } from "react-native";
import { Database } from "@/types/supabase";
import { getStatusLabel, cn } from "@/lib/utils";
interface StatusLabelProps extends ViewProps {
  challengeStatus?: Database["public"]["Tables"]["challenge"]["Row"]["status"];
}

export default function StatusLabel({
  challengeStatus,
  className,
  ...props
}: StatusLabelProps) {
  const statusColorMap: {
    [key in Database["public"]["Tables"]["challenge"]["Row"]["status"]]: string;
  } = {
    posting: "bg-orange-400",
    voting: "bg-yellow-400",
    ended: "bg-gray-400",
  };

  //todo: add skeleton
  if (!challengeStatus) return <View className="w-20 h-5 bg-gray-600" />;

  return (
    <View
      {...props}
      className={cn(
        "rounded px-2.5 py-0.5 text-xs font-semibold text-white w-fit",
        statusColorMap[challengeStatus],
        className,
      )}
    >
      <Text className="text-center">
        {getStatusLabel({ status: challengeStatus })}
      </Text>
    </View>
  );
}
