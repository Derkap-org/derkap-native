import { supabase } from "@/lib/supabase";
import Constants from "expo-constants";
/*
create table
  public.app_version (
    id serial not null,
    version text not null,
    min_supported_version text not null,
    created_at timestamp with time zone null default now(),
    updated_at timestamp with time zone null default now(),
    notes text null,
    constraint app_version_pkey primary key (id)
  ) tablespace pg_default;
*/

export const getAppVersionDB = async () => {
  try {
    const { data, error } = await supabase
      .from("app_version")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("No data found");
    }

    return data[0];
  } catch (error) {
    console.error("Error getting app version:", error);
    return {
      version: "0.0.0",
      min_supported_version: "0.0.0",
    };
  }
};

export const getCurrentAppVersion = (): string => {
  const appVersion = Constants.expoConfig?.version;
  if (!appVersion) {
    console.warn("Could not determine app version from Constants");
    return "0.0.0";
  }
  return appVersion;
};

// Parse version string into components
const parseVersion = (version: string): number[] => {
  return version.split(".").map((part) => parseInt(part, 10) || 0);
};

// Compare two version strings
const compareVersions = (version1: string, version2: string): number => {
  const parts1 = parseVersion(version1);
  const parts2 = parseVersion(version2);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }

  return 0; // Versions are equal
};

export const mustUpdateApp = async () => {
  try {
    const appVersion = getCurrentAppVersion();
    const { min_supported_version } = await getAppVersionDB();

    console.log("Current app version:", appVersion);
    console.log("Minimum supported version:", min_supported_version);

    // Compare full version (X.Y.Z) instead of just major version
    return compareVersions(appVersion, min_supported_version) < 0;
  } catch (error) {
    console.error("Error checking if app needs update:", error);
    // Default to not requiring update if there's an error
    return false;
  }
};
