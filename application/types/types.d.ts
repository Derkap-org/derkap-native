import { Database } from "./supabase";

export type TFriendshipStatus =
  Database["public"]["Enums"]["friendship_status"];

// USERS
export type TProfileDB = Database["public"]["Tables"]["profile"]["Row"];

// NOTIFICATIONS
export interface TVapidDetails {
  subject: string;
  publicKey: string;
  privateKey: string;
}

// CHALLENGES
export type TChallengeDB =
  | (Database["public"]["Tables"]["challenge"]["Row"] & {
      creator: TProfileDB | null;
    })
  | null;

export type TFriendRequestDB =
  Database["public"]["Tables"]["friends_request"]["Row"] & {
    profile: TProfileDB | null;
  };

export type TUserWithFriendshipStatus =
  Database["public"]["Functions"]["search_users_friendship_status"]["Returns"];

export type TChallengeStatus = Database["public"]["Enums"]["challenge_status"];

// GROUPS
export type TGroupDB = Database["public"]["Tables"]["group"]["Row"] & {
  members: {
    profile: TProfileDB | null;
  }[];
  challengeStatus?: TChallengeStatus;
  new_activity?: boolean;
};

export type TProfileInGroup = TProfileDB & {
  alreadyInGroup: boolean;
};

export type TGroupsStatus = {
  group_id: number;
  status: TChallengeStatus;
};

// POSTS
// export type TPostDB = Database["public"]["Tables"]["post"]["Row"] & {
//   creator: TProfileDB | null;
// };

/*

*/

export type TPostDB = {
  base64img: string;
  challenge_id: number | null;
  created_at: string;
  file_path: string | null;
  id: number;
  profile_id: string | null;
  creator: {
    avatar_url: string | null;
    created_at: string;
    email: string;
    id: string;
    username: string;
  };
  caption: string;
};

// VOTES
export type TVoteDB = Database["public"]["Tables"]["vote"]["Row"];

export type UserVote = {
  voted: boolean;
  postId?: number;
} | null;

export type GroupRanking =
  Database["public"]["Functions"]["get_group_ranking"]["Returns"];

// COMMENTS
export type TCommentDB = Database["public"]["Tables"]["comment"]["Row"] & {
  creator: TProfileDB | null;
};

// DERKAPS

export type TDerkapDB = Database["public"]["Tables"]["derkap"]["Row"] & {
  creator: TProfileDB | null;
  derkap_allowed_users: TProfileDB[];
  base64img: string;
};

export type TSuggestedChallenge = Omit<
  Database["public"]["Tables"]["suggested_challenge"]["Row"],
  "created_at" | "id"
>;

export type TSuggestedChallengeCategory =
  | Database["public"]["Enums"]["suggested_challenge_category"]
  | string;
