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
            foreignKeyName: "challenge_group_id_fkey";
            columns: ["group_id"];
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
        ];
      };
      encrypted_post: {
        Row: {
          challenge_id: number | null;
          created_at: string;
          encrypted_data: string | null;
          id: number;
          iv: string | null;
          profile_id: string | null;
        };
        Insert: {
          challenge_id?: number | null;
          created_at?: string;
          encrypted_data?: string | null;
          id?: number;
          iv?: string | null;
          profile_id?: string | null;
        };
        Update: {
          challenge_id?: number | null;
          created_at?: string;
          encrypted_data?: string | null;
          id?: number;
          iv?: string | null;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "encrypted_photo_challenge_id_fkey";
            columns: ["challenge_id"];
            referencedRelation: "challenge";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "encrypted_photo_profile_id_fkey";
            columns: ["profile_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
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
          name: string;
        };
        Insert: {
          created_at?: string;
          creator_id?: string | null;
          id?: number;
          img_url?: string | null;
          invite_code?: string | null;
          name: string;
        };
        Update: {
          created_at?: string;
          creator_id?: string | null;
          id?: number;
          img_url?: string | null;
          invite_code?: string | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_creator_id_fkey";
            columns: ["creator_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
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
        ];
      };
      notification_subscription: {
        Row: {
          created_at: string;
          expo_push_token: string | null;
          id: number;
          subscription: Json | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expo_push_token?: string | null;
          id?: number;
          subscription?: Json | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          expo_push_token?: string | null;
          id?: number;
          subscription?: Json | null;
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
            referencedRelation: "encrypted_post";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vote_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
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
    };
    Enums: {
      challenge_status: "posting" | "voting" | "ended";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
