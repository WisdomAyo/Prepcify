export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_goal_minutes: number | null
          exam_type: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          school: string | null
          streak_days: number
          subjects: string[] | null
          target_year: number | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_goal_minutes?: number | null
          exam_type?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          school?: string | null
          streak_days?: number
          subjects?: string[] | null
          target_year?: number | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_goal_minutes?: number | null
          exam_type?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          school?: string | null
          streak_days?: number
          subjects?: string[] | null
          target_year?: number | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      question_options: {
        Row: {
          body: string
          id: string
          label: string
          question_id: string
        }
        Insert: {
          body: string
          id?: string
          label: string
          question_id: string
        }
        Update: {
          body?: string
          id?: string
          label?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_option: string
          created_at: string
          diagram_key: string | null
          difficulty: string
          exam: string
          explanation: string | null
          id: string
          question_number: number | null
          stem: string
          subject_id: string
          topic_id: string | null
          updated_at: string
          year: number
        }
        Insert: {
          correct_option: string
          created_at?: string
          diagram_key?: string | null
          difficulty?: string
          exam: string
          explanation?: string | null
          id?: string
          question_number?: number | null
          stem: string
          subject_id: string
          topic_id?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          correct_option?: string
          created_at?: string
          diagram_key?: string | null
          difficulty?: string
          exam?: string
          explanation?: string | null
          id?: string
          question_number?: number | null
          stem?: string
          subject_id?: string
          topic_id?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_answers: {
        Row: {
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_option: string | null
          time_spent_seconds: number
        }
        Insert: {
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id: string
          selected_option?: string | null
          time_spent_seconds?: number
        }
        Update: {
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_option?: string | null
          time_spent_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          completed_at: string | null
          correct_count: number
          created_at: string
          exam: string | null
          id: string
          mode: string
          subject_id: string | null
          time_spent_seconds: number
          total_questions: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string | null
          correct_count?: number
          created_at?: string
          exam?: string | null
          id?: string
          mode?: string
          subject_id?: string | null
          time_spent_seconds?: number
          total_questions?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string | null
          correct_count?: number
          created_at?: string
          exam?: string | null
          id?: string
          mode?: string
          subject_id?: string | null
          time_spent_seconds?: number
          total_questions?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          subject_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          subject_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
