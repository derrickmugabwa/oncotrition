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
          created_at: string
          email: string
          role: 'admin' | 'user'
          full_name: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          role?: 'admin' | 'user'
          full_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          role?: 'admin' | 'user'
          full_name?: string | null
        }
      }
      content: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          type: 'article' | 'recipe' | 'meal_plan'
          status: 'draft' | 'published'
          author_id: string
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          type: 'article' | 'recipe' | 'meal_plan'
          status?: 'draft' | 'published'
          author_id: string
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          type?: 'article' | 'recipe' | 'meal_plan'
          status?: 'draft' | 'published'
          author_id?: string
          metadata?: Json
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
