export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      "app_ maintenance": {
        Row: {
          created_at: string;
          id: number;
          maintenance_active: boolean;
        };
        Insert: {
          created_at?: string;
          id?: number;
          maintenance_active?: boolean;
        };
        Update: {
          created_at?: string;
          id?: number;
          maintenance_active?: boolean;
        };
        Relationships: [];
      };
      app_feedback: {
        Row: {
          created_at: string;
          id: number;
          link: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          link?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          link?: string | null;
        };
        Relationships: [];
      };
      app_version: {
        Row: {
          created_at: string | null;
          id: number;
          min_supported_version: string;
          notes: string | null;
          updated_at: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          min_supported_version: string;
          notes?: string | null;
          updated_at?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          min_supported_version?: string;
          notes?: string | null;
          updated_at?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      challenge: {
        Row: {
          base_key: string | null;
          created_at: string;
          creator_id: string | null;
          description: string;
          group_id: number;
          id: number;
          status: Database["public"]["Enums"]["challenge_status"];
        };
        Insert: {
          base_key?: string | null;
          created_at?: string;
          creator_id?: string | null;
          description: string;
          group_id: number;
          id?: number;
          status: Database["public"]["Enums"]["challenge_status"];
        };
        Update: {
          base_key?: string | null;
          created_at?: string;
          creator_id?: string | null;
          description?: string;
          group_id?: number;
          id?: number;
          status?: Database["public"]["Enums"]["challenge_status"];
        };
        Relationships: [
          {
            foreignKeyName: "challenge_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "challenge_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "challenge_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
        ];
      };
      comment: {
        Row: {
          content: string | null;
          created_at: string;
          creator_id: string | null;
          derkap_id: number | null;
          id: number;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          creator_id?: string | null;
          derkap_id?: number | null;
          id?: number;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          creator_id?: string | null;
          derkap_id?: number | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "comment_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "comment_derkap_id_fkey";
            columns: ["derkap_id"];
            referencedRelation: "derkap";
            referencedColumns: ["id"];
          },
        ];
      };
      delete_account: {
        Row: {
          created_at: string;
          id: number;
          profile_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          profile_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "delete_account_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "delete_account_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      derkap: {
        Row: {
          base_key: string | null;
          caption: string | null;
          challenge: string | null;
          created_at: string;
          creator_id: string | null;
          file_path: string | null;
          id: number;
        };
        Insert: {
          base_key?: string | null;
          caption?: string | null;
          challenge?: string | null;
          created_at?: string;
          creator_id?: string | null;
          file_path?: string | null;
          id?: number;
        };
        Update: {
          base_key?: string | null;
          caption?: string | null;
          challenge?: string | null;
          created_at?: string;
          creator_id?: string | null;
          file_path?: string | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "derkap_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "derkap_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      derkap_allowed_users: {
        Row: {
          allowed_user_id: string;
          created_at: string;
          derkap_id: number;
        };
        Insert: {
          allowed_user_id: string;
          created_at?: string;
          derkap_id: number;
        };
        Update: {
          allowed_user_id?: string;
          created_at?: string;
          derkap_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "derkap_allowed_users_derkap_id_fkey";
            columns: ["derkap_id"];
            referencedRelation: "derkap";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_user";
            columns: ["allowed_user_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_user";
            columns: ["allowed_user_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      friends_request: {
        Row: {
          created_at: string | null;
          id: string;
          receiver_id: string;
          sender_id: string;
          status: Database["public"]["Enums"]["friend_request_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          receiver_id: string;
          sender_id: string;
          status?: Database["public"]["Enums"]["friend_request_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          receiver_id?: string;
          sender_id?: string;
          status?: Database["public"]["Enums"]["friend_request_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "friends_request_receiver_id_fkey";
            columns: ["receiver_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friends_request_receiver_id_fkey";
            columns: ["receiver_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "friends_request_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friends_request_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      group: {
        Row: {
          created_at: string;
          creator_id: string | null;
          id: number;
          img_url: string | null;
          invite_code: string | null;
          last_activity: string | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          creator_id?: string | null;
          id?: number;
          img_url?: string | null;
          invite_code?: string | null;
          last_activity?: string | null;
          name: string;
        };
        Update: {
          created_at?: string;
          creator_id?: string | null;
          id?: number;
          img_url?: string | null;
          invite_code?: string | null;
          last_activity?: string | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      group_profile: {
        Row: {
          created_at: string;
          group_id: number;
          id: number;
          profile_id: string | null;
        };
        Insert: {
          created_at?: string;
          group_id: number;
          id?: number;
          profile_id?: string | null;
        };
        Update: {
          created_at?: string;
          group_id?: number;
          id?: number;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "group_profile_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_profile_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_profile_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      notification_subscription: {
        Row: {
          created_at: string;
          expo_push_token: string | null;
          id: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expo_push_token?: string | null;
          id?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          expo_push_token?: string | null;
          id?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_subscription_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_subscription_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      post: {
        Row: {
          caption: string | null;
          challenge_id: number | null;
          created_at: string;
          file_path: string | null;
          id: number;
          profile_id: string | null;
        };
        Insert: {
          caption?: string | null;
          challenge_id?: number | null;
          created_at?: string;
          file_path?: string | null;
          id?: number;
          profile_id?: string | null;
        };
        Update: {
          caption?: string | null;
          challenge_id?: number | null;
          created_at?: string;
          file_path?: string | null;
          id?: number;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "post_challenge_id_fkey";
            columns: ["challenge_id"];
            referencedRelation: "challenge";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      profile: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          id: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          id: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reporting: {
        Row: {
          comment_id: number | null;
          created_at: string | null;
          derkap_id: number | null;
          id: number;
          reported_by: string | null;
        };
        Insert: {
          comment_id?: number | null;
          created_at?: string | null;
          derkap_id?: number | null;
          id?: number;
          reported_by?: string | null;
        };
        Update: {
          comment_id?: number | null;
          created_at?: string | null;
          derkap_id?: number | null;
          id?: number;
          reported_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reporting_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "comment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reporting_derkap_id_fkey";
            columns: ["derkap_id"];
            referencedRelation: "derkap";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reporting_reported_by_fkey";
            columns: ["reported_by"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reporting_reported_by_fkey";
            columns: ["reported_by"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      suggested_challenge: {
        Row: {
          category: Database["public"]["Enums"]["suggested_challenge_category"];
          challenge: string;
          created_at: string;
          id: number;
        };
        Insert: {
          category: Database["public"]["Enums"]["suggested_challenge_category"];
          challenge: string;
          created_at?: string;
          id?: number;
        };
        Update: {
          category?: Database["public"]["Enums"]["suggested_challenge_category"];
          challenge?: string;
          created_at?: string;
          id?: number;
        };
        Relationships: [];
      };
      vote: {
        Row: {
          challenge_id: number;
          created_at: string;
          id: number;
          post_id: number;
          user_id: string;
        };
        Insert: {
          challenge_id: number;
          created_at?: string;
          id?: number;
          post_id: number;
          user_id?: string;
        };
        Update: {
          challenge_id?: number;
          created_at?: string;
          id?: number;
          post_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vote_challenge_id_fkey";
            columns: ["challenge_id"];
            referencedRelation: "challenge";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vote_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "post";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vote_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vote_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "friends";
            referencedColumns: ["profile_id"];
          },
        ];
      };
    };
    Views: {
      friends: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          friend_id: string | null;
          profile_id: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      cron_schedule: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      generate_unique_invite_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_group_by_invite_code: {
        Args: {
          p_invite_code: string;
        };
        Returns: {
          created_at: string;
          creator_id: string | null;
          id: number;
          img_url: string | null;
          invite_code: string | null;
          last_activity: string | null;
          name: string;
        }[];
      };
      get_group_ranking: {
        Args: {
          group_id_param: number;
        };
        Returns: {
          rank: number;
          profile_id: string;
          username: string;
          avatar_url: string;
          winned_challenges: number;
        }[];
      };
      get_group_user_count: {
        Args: {
          group_id_param: number;
        };
        Returns: number;
      };
      get_latest_challenge_status: {
        Args: {
          group_ids: number[];
        };
        Returns: {
          group_id: number;
          status: Database["public"]["Enums"]["challenge_status"];
        }[];
      };
      insert_derkap_with_users:
        | {
            Args: {
              p_challenge: string;
              p_caption: string;
              p_allowed_users: string[];
              p_base_key: string;
              p_file_path: string;
              p_user_id: string;
            };
            Returns: {
              derkap_id: number;
            }[];
          }
        | {
            Args: {
              p_challenge: string;
              p_encrypted_post: string;
              p_caption: string;
              p_allowed_users: string[];
              p_base_key: string;
              p_file_path: string;
              p_user_id: string;
            };
            Returns: {
              derkap_id: number;
            }[];
          };
      is_derkap_accessible: {
        Args: {
          target_derkap_id: number;
          requesting_user_id: string;
        };
        Returns: boolean;
      };
      search_users_friendship_status: {
        Args: {
          p_search_username: string;
          p_current_user_id: string;
        };
        Returns: {
          id: string;
          username: string;
          avatar_url: string;
          email: string;
          friendship_status: Database["public"]["Enums"]["friendship_status_type"];
          friend_request_id: string;
        }[];
      };
    };
    Enums: {
      challenge_status: "posting" | "voting" | "ended";
      friend_request_status: "pending" | "accepted" | "rejected";
      friendship_status_type:
        | "friend"
        | "pending_their_acceptance"
        | "pending_your_acceptance"
        | "not_friend";
      suggested_challenge_category:
        | "perspective"
        | "selfie avec"
        | "lieu insolite"
        | "absurde"
        | "sport"
        | "cuisine"
        | "transformation";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
