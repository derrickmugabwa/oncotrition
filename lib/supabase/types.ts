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
      mentorship_events: {
        Row: {
          id: string
          name: string
          date: string
          total_slots: number
          available_slots: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          total_slots: number
          available_slots: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          total_slots?: number
          available_slots?: number
          created_at?: string
          updated_at?: string
        }
      }
      event_bookings: {
        Row: {
          id: string
          event_id: string
          name: string
          email: string
          phone: string
          payment_status: string
          payment_reference?: string
          payment_amount?: number
          payment_phone?: string
          payment_date?: string
          mpesa_checkout_request_id?: string
          booking_status: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          email: string
          phone: string
          payment_status?: string
          payment_reference?: string
          payment_amount?: number
          payment_phone?: string
          payment_date?: string
          mpesa_checkout_request_id?: string
          booking_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          email?: string
          phone?: string
          payment_status?: string
          payment_reference?: string
          payment_amount?: number
          payment_phone?: string
          payment_date?: string
          mpesa_checkout_request_id?: string
          booking_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      mpesa_logs: {
        Row: {
          id: string
          message: string
          type: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          message: string
          type?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          message?: string
          type?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
  }
}
