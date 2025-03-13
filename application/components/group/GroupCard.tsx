import { Link } from "expo-router";
import { TGroupDB } from "@/types/types";
import { View, Text, Image } from "react-native";
import StatusLabel from "@/components/group/StatusLabel";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  group: TGroupDB;
}

export default function GroupCard({ group }: GroupCardProps) {
  const formatDate = (date: string) => {
    // < 1 min => à l'instant
    // < 1 h => il y a x minutes
    // < 1 j => il y a x heures
    // < 1 mois => il y a x jours
    // < 1 an => il y a x mois
    // > 1 an => il y a x ans
    const now = new Date();
    const dateObj = new Date(date);
    const diffTime = Math.abs(now.getTime() - dateObj.getTime());
    const diffMinutes = Math.round(diffTime / (1000 * 60));
    const diffHours = Math.round(diffTime / (1000 * 60 * 60));
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30));
    const diffYears = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30 * 12));

    if (diffMinutes < 1) {
      return "à l'instant";
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    }
    if (diffHours < 24) {
      return `${diffHours} heures`;
    }
    if (diffDays < 30) {
      return `${diffDays} jours`;
    }
    if (diffMonths < 12) {
      return `${diffMonths} mois`;
    }
    return `${diffYears} ans`;
  };

  return (
    <Link
      key={group.id}
      href={{
        pathname: "/group/[id]",
        params: { id: group.id },
      }}
      className="flex items-center w-full gap-4 p-4 px-4 py-2 mb-4 "
    >
      <View className="flex-row items-center justify-between">
        <View className="w-full">
          <View className="flex-row items-center justify-between w-full">
            <View className="flex flex-row items-center gap-x-4">
              {group?.img_url ? (
                <Image
                  src={`${group?.img_url}?t=${new Date().getTime()}`}
                  alt={group?.name ?? ""}
                  width={70}
                  height={70}
                  className="object-cover w-16 h-16 rounded-full bg-custom-white"
                />
              ) : (
                <View className="flex items-center justify-center w-16 h-16 bg-black rounded-full">
                  <Text className="uppercase text-white">
                    {group?.name
                      .split(" ")
                      .map((word) => word.charAt(0))
                      .join("")}
                  </Text>
                </View>
              )}
              <View className="">
                <View className="flex flex-row items-center gap-x-2">
                  <Text
                    className={cn(
                      "text-lg  text-white",
                      group.new_activity && "font-bold",
                    )}
                  >
                    {group.name}
                  </Text>
                  {group.new_activity === true && (
                    <View className="h-5 w-5 bg-red-500 rounded-full"></View>
                  )}
                </View>

                {/* Statut du groupe */}
                <View className="w-24 text-white">
                  <StatusLabel challengeStatus={group.challengeStatus} />
                </View>
              </View>
            </View>

            <Text className="text-gray-300">
              {group.last_activity
                ? formatDate(group.last_activity)
                : "Aujourd'hui"}
            </Text>
          </View>
        </View>
      </View>
    </Link>
  );
}
