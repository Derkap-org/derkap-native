import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Database } from "@/types/supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusLabel = ({
  status,
}: {
  status: Database["public"]["Tables"]["challenge"]["Row"]["status"];
}) => {
  if (status === "posting") return "En cours";
  else if (status === "voting") return "En votes";
  else if (status === "ended") return "Terminé";
  return "Pas de défi";
};
