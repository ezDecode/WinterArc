export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          timezone: string
          arc_start_date: string
          deleted_at: string | null
          last_login_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          timezone?: string
          arc_start_date?: string
          deleted_at?: string | null
          last_login_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          timezone?: string
          arc_start_date?: string
          deleted_at?: string | null
          last_login_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      daily_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          study_blocks: Json
          reading: Json
          pushups: Json
          meditation: Json
          water_bottles: boolean[]
          notes: Json
          daily_score: number
          is_complete: boolean
          completed_at: string | null
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          study_blocks?: Json
          reading?: Json
          pushups?: Json
          meditation?: Json
          water_bottles?: boolean[]
          notes?: Json
          daily_score?: number
          is_complete?: boolean
          completed_at?: string | null
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          study_blocks?: Json
          reading?: Json
          pushups?: Json
          meditation?: Json
          water_bottles?: boolean[]
          notes?: Json
          daily_score?: number
          is_complete?: boolean
          completed_at?: string | null
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      weekly_reviews: {
        Row: {
          id: string
          user_id: string
          week_number: number
          review_date: string
          days_hit_all: number
          what_helped: string | null
          what_blocked: string | null
          next_week_change: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_number: number
          review_date: string
          days_hit_all?: number
          what_helped?: string | null
          what_blocked?: string | null
          next_week_change?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          review_date?: string
          days_hit_all?: number
          what_helped?: string | null
          what_blocked?: string | null
          next_week_change?: string | null
          created_at?: string
        }
      }
      checkpoint_notes: {
        Row: {
          id: string
          user_id: string
          week_number: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_number: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
