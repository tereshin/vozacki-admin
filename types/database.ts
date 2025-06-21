export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      administrators: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          external_id: number | null
          id: string
          is_correct: boolean | null
          language_id: string
          question_uid: string | null
          text: string
          uid: string
        }
        Insert: {
          external_id?: number | null
          id?: string
          is_correct?: boolean | null
          language_id: string
          question_uid?: string | null
          text: string
          uid: string
        }
        Update: {
          external_id?: number | null
          id?: string
          is_correct?: boolean | null
          language_id?: string
          question_uid?: string | null
          text?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_uid_fkey"
            columns: ["question_uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
          {
            foreignKeyName: "answers_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
        ]
      }
      articles: {
        Row: {
          category_uid: string | null
          content: Json
          id: string
          language_id: string
          published_at: string | null
          slug: string
          title: string
          uid: string
        }
        Insert: {
          category_uid?: string | null
          content: Json
          id?: string
          language_id: string
          published_at?: string | null
          slug: string
          title: string
          uid: string
        }
        Update: {
          category_uid?: string | null
          content?: Json
          id?: string
          language_id?: string
          published_at?: string | null
          slug?: string
          title?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_uid_fkey"
            columns: ["category_uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
          {
            foreignKeyName: "articles_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
        ]
      }
      categories: {
        Row: {
          description: string | null
          id: string
          language_id: string
          name: string
          parent_category_uid: string | null
          slug: string
          uid: string
          created_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          language_id: string
          name: string
          parent_category_uid?: string | null
          slug: string
          uid: string
          created_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          language_id?: string
          name?: string
          parent_category_uid?: string | null
          slug?: string
          uid?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_category_uid_fkey"
            columns: ["parent_category_uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
          {
            foreignKeyName: "categories_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
        ]
      }
      content_uids: {
        Row: {
          content_type: string
          uid: string
        }
        Insert: {
          content_type: string
          uid?: string
        }
        Update: {
          content_type?: string
          uid?: string
        }
        Relationships: []
      }
      exam_config: {
        Row: {
          duration_minutes: number | null
          id: number
          max_incorrect_answers: number | null
          passing_percentage: number | null
          total_questions: number | null
        }
        Insert: {
          duration_minutes?: number | null
          id?: number
          max_incorrect_answers?: number | null
          passing_percentage?: number | null
          total_questions?: number | null
        }
        Update: {
          duration_minutes?: number | null
          id?: number
          max_incorrect_answers?: number | null
          passing_percentage?: number | null
          total_questions?: number | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          id: string
          is_active: boolean | null
          name: string
          script: string | null
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean | null
          name: string
          script?: string | null
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean | null
          name?: string
          script?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          external_id: number | null
          id: string
          image_url: string | null
          language_id: string
          points: number | null
          test_uid: string | null
          text: string
          uid: string
        }
        Insert: {
          external_id?: number | null
          id?: string
          image_url?: string | null
          language_id: string
          points?: number | null
          test_uid?: string | null
          text: string
          uid: string
        }
        Update: {
          external_id?: number | null
          id?: string
          image_url?: string | null
          language_id?: string
          points?: number | null
          test_uid?: string | null
          text?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_test_uid_fkey"
            columns: ["test_uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
          {
            foreignKeyName: "questions_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
        ]
      }
      tests: {
        Row: {
          description: string | null
          external_id: number | null
          id: string
          language_id: string
          title: string
          topic_uid: string | null
          total_questions: number | null
          uid: string
        }
        Insert: {
          description?: string | null
          external_id?: number | null
          id?: string
          language_id: string
          title: string
          topic_uid?: string | null
          total_questions?: number | null
          uid: string
        }
        Update: {
          description?: string | null
          external_id?: number | null
          id?: string
          language_id?: string
          title?: string
          topic_uid?: string | null
          total_questions?: number | null
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tests_theme_uid_fkey"
            columns: ["topic_uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
          {
            foreignKeyName: "tests_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
        ]
      }
      topics: {
        Row: {
          description: string | null
          external_id: number | null
          id: string
          language_id: string
          name: string
          uid: string
        }
        Insert: {
          description?: string | null
          external_id?: number | null
          id?: string
          language_id: string
          name: string
          uid: string
        }
        Update: {
          description?: string | null
          external_id?: number | null
          id?: string
          language_id?: string
          name?: string
          uid?: string
        }
        Relationships: [
          {
            foreignKeyName: "themes_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "themes_uid_fkey"
            columns: ["uid"]
            isOneToOne: false
            referencedRelation: "content_uids"
            referencedColumns: ["uid"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_content_uid: {
        Args: {
          content_type: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

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
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? never // Fixed: Changed from PublicSchema["CompositeTypes"][CompositeTypeName] since CompositeTypes is empty
    : never 