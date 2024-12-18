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
      contact_info: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          email: string
          phone: string
          address: string
          social_links: {
            facebook?: string
            twitter?: string
            instagram?: string
          }
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          email: string
          phone: string
          address: string
          social_links?: {
            facebook?: string
            twitter?: string
            instagram?: string
          }
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          email?: string
          phone?: string
          address?: string
          social_links?: {
            facebook?: string
            twitter?: string
            instagram?: string
          }
        }
      }
      form_submissions: {
        Row: {
          id: string
          created_at: string
          name: string
          email: string
          subject: string
          message: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          email: string
          subject: string
          message: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          email?: string
          subject?: string
          message?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          created_at: string
          logo_url?: string
          favicon_url?: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          logo_url?: string
          favicon_url?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          logo_url?: string
          favicon_url?: string
          updated_at?: string
        }
      }
      homepage_mentorship: {
        Row: {
          id: string
          title: string
          subtitle: string
          description: string
          image_url: string | null
          button_text: string
          button_link: string
          features: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle: string
          description: string
          image_url?: string | null
          button_text?: string
          button_link?: string
          features?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          description?: string
          image_url?: string | null
          button_text?: string
          button_link?: string
          features?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      mentorship_events: {
        Row: {
          id: string
          created_at: string
          name: string
          date: string
          total_slots: number
          price: number
          description: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          date: string
          total_slots: number
          price: number
          description: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          date?: string
          total_slots?: number
          price?: number
          description?: string
        }
      }
      event_bookings: {
        Row: {
          id: string
          created_at: string
          event_id: string
          user_id: string
          booking_status: 'pending' | 'approved' | 'rejected'
          payment_status: 'pending' | 'completed' | 'failed'
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          user_id: string
          booking_status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'completed' | 'failed'
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          user_id?: string
          booking_status?: 'pending' | 'approved' | 'rejected'
          payment_status?: 'pending' | 'completed' | 'failed'
        }
      }
      mentorship_features: {
        Row: {
          id: number
          created_at: string
          title: string
          description: string
          icon_name: string
          gradient: string
          display_order: number
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          description: string
          icon_name: string
          gradient: string
          display_order: number
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          description?: string
          icon_name?: string
          gradient?: string
          display_order?: number
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
