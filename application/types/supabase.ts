export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
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
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "challenge_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
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
          id: number;
          post_id: number | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          creator_id?: string | null;
          id?: number;
          post_id?: number | null;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          creator_id?: string | null;
          id?: number;
          post_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "comment_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profile";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "post";
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
            isOneToOne: false;
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
            isOneToOne: false;
            referencedRelation: "group";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "group_profile_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
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
            isOneToOne: true;
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
            isOneToOne: false;
            referencedRelation: "challenge";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
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
            isOneToOne: false;
            referencedRelation: "challenge";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vote_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "post";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vote_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
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
    };
    Enums: {
      challenge_status: "posting" | "voting" | "ended";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
