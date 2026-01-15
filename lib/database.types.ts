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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      about_components: {
        Row: {
          component_key: string
          created_at: string
          display_order: number
          id: string
          is_visible: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          component_key: string
          created_at?: string
          display_order: number
          id?: string
          is_visible?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          component_key?: string
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          announcement_type: string | null
          created_at: string | null
          cta_link: string | null
          cta_text: string | null
          display_frequency: string | null
          end_date: string
          event_id: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          message: string
          priority: number | null
          start_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          announcement_type?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          display_frequency?: string | null
          end_date: string
          event_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message: string
          priority?: number | null
          start_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          announcement_type?: string | null
          created_at?: string | null
          cta_link?: string | null
          cta_text?: string | null
          display_frequency?: string | null
          end_date?: string
          event_id?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          message?: string
          priority?: number | null
          start_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_authors: {
        Row: {
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          profile_image_url: string | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          profile_image_url?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          profile_image_url?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "blog_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          gallery_images: Json | null
          id: string
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_images?: Json | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_images?: Json | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "blog_authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string | null
          id: number
          logo_url: string
          name: string
          order_index: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          logo_url: string
          name: string
          order_index: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          logo_url?: string
          name?: string
          order_index?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      brands_content: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: number
          phone: string | null
          social_links: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: never
          phone?: string | null
          social_links?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: never
          phone?: string | null
          social_links?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          file_url: string | null
          id: number
          type: string
          updated_at: string
        }
        Insert: {
          file_url?: string | null
          id?: never
          type: string
          updated_at?: string
        }
        Update: {
          file_url?: string | null
          id?: never
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_bookings: {
        Row: {
          amount: number | null
          booking_status: string
          checkout_request_id: string | null
          created_at: string | null
          email: string
          event_id: string
          id: string
          mpesa_checkout_request_id: string | null
          name: string
          payment_amount: number | null
          payment_date: string | null
          payment_error: string | null
          payment_phone: string | null
          payment_reference: string | null
          payment_status: string | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          booking_status?: string
          checkout_request_id?: string | null
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          mpesa_checkout_request_id?: string | null
          name: string
          payment_amount?: number | null
          payment_date?: string | null
          payment_error?: string | null
          payment_phone?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          booking_status?: string
          checkout_request_id?: string | null
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          mpesa_checkout_request_id?: string | null
          name?: string
          payment_amount?: number | null
          payment_date?: string | null
          payment_error?: string | null
          payment_phone?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "mentorship_events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          additional_info: string | null
          created_at: string | null
          current_attendees: number | null
          description: string
          early_bird_deadline: string | null
          early_bird_discount: number | null
          event_date: string
          event_time: string
          featured_image_url: string | null
          has_internal_registration: boolean | null
          id: string
          is_featured: boolean | null
          location: string
          max_attendees: number | null
          organizer_contact: string | null
          organizer_name: string | null
          registration_deadline: string | null
          registration_link: string | null
          registration_type: string | null
          requires_payment: boolean | null
          status: string | null
          terms_and_conditions: string | null
          title: string
          updated_at: string | null
          venue_details: string | null
        }
        Insert: {
          additional_info?: string | null
          created_at?: string | null
          current_attendees?: number | null
          description: string
          early_bird_deadline?: string | null
          early_bird_discount?: number | null
          event_date: string
          event_time: string
          featured_image_url?: string | null
          has_internal_registration?: boolean | null
          id?: string
          is_featured?: boolean | null
          location: string
          max_attendees?: number | null
          organizer_contact?: string | null
          organizer_name?: string | null
          registration_deadline?: string | null
          registration_link?: string | null
          registration_type?: string | null
          requires_payment?: boolean | null
          status?: string | null
          terms_and_conditions?: string | null
          title: string
          updated_at?: string | null
          venue_details?: string | null
        }
        Update: {
          additional_info?: string | null
          created_at?: string | null
          current_attendees?: number | null
          description?: string
          early_bird_deadline?: string | null
          early_bird_discount?: number | null
          event_date?: string
          event_time?: string
          featured_image_url?: string | null
          has_internal_registration?: boolean | null
          id?: string
          is_featured?: boolean | null
          location?: string
          max_attendees?: number | null
          organizer_contact?: string | null
          organizer_name?: string | null
          registration_deadline?: string | null
          registration_link?: string | null
          registration_type?: string | null
          requires_payment?: boolean | null
          status?: string | null
          terms_and_conditions?: string | null
          title?: string
          updated_at?: string | null
          venue_details?: string | null
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: number
          order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon_name: string
          id?: number
          order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: number
          order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      features_banner: {
        Row: {
          bullet_points: Json
          created_at: string
          heading: string
          id: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          bullet_points: Json
          created_at?: string
          heading: string
          id: number
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          bullet_points?: Json
          created_at?: string
          heading?: string
          id?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      features_grid: {
        Row: {
          created_at: string
          description: string
          display_order: number
          gradient: string
          icon_name: string
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order: number
          gradient?: string
          icon_name: string
          id?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          gradient?: string
          icon_name?: string
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      features_header: {
        Row: {
          button_text: string
          button_url: string
          heading: string
          id: number
          paragraph: string
        }
        Insert: {
          button_text?: string
          button_url?: string
          heading?: string
          id?: number
          paragraph?: string
        }
        Update: {
          button_text?: string
          button_url?: string
          heading?: string
          id?: number
          paragraph?: string
        }
        Relationships: []
      }
      features_overview: {
        Row: {
          created_at: string
          description: string
          id: number
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id: number
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_settings: {
        Row: {
          brand: Json | null
          contact_info: Json | null
          copyright: string | null
          copyright_text: string | null
          created_at: string | null
          description: string | null
          id: number
          legal_links: Json | null
          logo: string | null
          newsletter: Json | null
          promo_image: string | null
          promo_images: Json | null
          promo_title: string | null
          promo_url: string | null
          quick_links: Json | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          brand?: Json | null
          contact_info?: Json | null
          copyright?: string | null
          copyright_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          legal_links?: Json | null
          logo?: string | null
          newsletter?: Json | null
          promo_image?: string | null
          promo_images?: Json | null
          promo_title?: string | null
          promo_url?: string | null
          quick_links?: Json | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          brand?: Json | null
          contact_info?: Json | null
          copyright?: string | null
          copyright_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          legal_links?: Json | null
          logo?: string | null
          newsletter?: Json | null
          promo_image?: string | null
          promo_images?: Json | null
          promo_title?: string | null
          promo_url?: string | null
          quick_links?: Json | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          email: string
          id: number
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: never
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: never
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_components: {
        Row: {
          component_key: string
          created_at: string
          display_order: number
          id: string
          is_visible: boolean | null
          name: string
        }
        Insert: {
          component_key: string
          created_at?: string
          display_order: number
          id?: string
          is_visible?: boolean | null
          name: string
        }
        Update: {
          component_key?: string
          created_at?: string
          display_order?: number
          id?: string
          is_visible?: boolean | null
          name?: string
        }
        Relationships: []
      }
      homepage_mentorship: {
        Row: {
          button_link: string
          button_text: string
          created_at: string
          description: string
          features: Json
          id: string
          image_url: string | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          button_link?: string
          button_text?: string
          created_at?: string
          description: string
          features?: Json
          id?: string
          image_url?: string | null
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          button_link?: string
          button_text?: string
          created_at?: string
          description?: string
          features?: Json
          id?: string
          image_url?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_smartspoon: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          services: Json[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          services?: Json[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          services?: Json[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_mode: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      mentorship_business_tips: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image: string
          order_index: number
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image: string
          order_index: number
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image?: string
          order_index?: number
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      mentorship_business_tips_content: {
        Row: {
          created_at: string | null
          description: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mentorship_components: {
        Row: {
          component_key: string
          created_at: string | null
          display_order: number
          id: string
          is_visible: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          component_key: string
          created_at?: string | null
          display_order: number
          id?: string
          is_visible?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          component_key?: string
          created_at?: string | null
          display_order?: number
          id?: string
          is_visible?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mentorship_events: {
        Row: {
          available_slots: number
          created_at: string
          date: string
          id: string
          name: string
          price: number
          total_slots: number
          updated_at: string
        }
        Insert: {
          available_slots: number
          created_at?: string
          date: string
          id?: string
          name: string
          price?: number
          total_slots: number
          updated_at?: string
        }
        Update: {
          available_slots?: number
          created_at?: string
          date?: string
          id?: string
          name?: string
          price?: number
          total_slots?: number
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_features: {
        Row: {
          created_at: string
          description: string
          display_order: number
          gradient: string
          icon_name: string
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          gradient: string
          icon_name: string
          id?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          gradient?: string
          icon_name?: string
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_features_content: {
        Row: {
          created_at: string | null
          description: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mentorship_hero: {
        Row: {
          background_image: string
          created_at: string
          id: string
          subtitle: string
          tagline: string
          title: string
          updated_at: string
        }
        Insert: {
          background_image: string
          created_at?: string
          id?: string
          subtitle: string
          tagline: string
          title: string
          updated_at?: string
        }
        Update: {
          background_image?: string
          created_at?: string
          id?: string
          subtitle?: string
          tagline?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_packages: {
        Row: {
          created_at: string
          description: string | null
          duration_type: string
          features: string[]
          gradient: string
          id: number
          international_price: number | null
          name: string
          order_number: number
          price: number
          recommended: boolean
          show_price: boolean
          title: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_type: string
          features: string[]
          gradient: string
          id?: number
          international_price?: number | null
          name: string
          order_number?: number
          price: number
          recommended?: boolean
          show_price?: boolean
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_type?: string
          features?: string[]
          gradient?: string
          id?: number
          international_price?: number | null
          name?: string
          order_number?: number
          price?: number
          recommended?: boolean
          show_price?: boolean
          title?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      mentorship_testimonials: {
        Row: {
          company: string
          content: string
          created_at: string
          id: string
          image: string
          name: string
          order_index: number
          rating: number
          role: string
          updated_at: string
        }
        Insert: {
          company: string
          content: string
          created_at?: string
          id?: string
          image: string
          name: string
          order_index: number
          rating: number
          role: string
          updated_at?: string
        }
        Update: {
          company?: string
          content?: string
          created_at?: string
          id?: string
          image?: string
          name?: string
          order_index?: number
          rating?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_testimonials_content: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mission_content: {
        Row: {
          created_at: string
          description: string | null
          id: number
          image_url: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string
          display_order: number
          features: Json
          icon_svg: string
          id: number
          image_url: string | null
          learn_more_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order: number
          features?: Json
          icon_svg: string
          id?: number
          image_url?: string | null
          learn_more_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          features?: Json
          icon_svg?: string
          id?: number
          image_url?: string | null
          learn_more_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      modules_content: {
        Row: {
          created_at: string
          description: string
          heading: string
          id: number
        }
        Insert: {
          created_at?: string
          description: string
          heading: string
          id?: never
        }
        Update: {
          created_at?: string
          description?: string
          heading?: string
          id?: never
        }
        Relationships: []
      }
      mpesa_logs: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          type?: string | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          column_index: number | null
          created_at: string
          description: string | null
          href: string
          id: string
          name: string
          open_in_new_tab: boolean | null
          order: number
          parent_id: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          column_index?: number | null
          created_at?: string
          description?: string | null
          href: string
          id?: string
          name: string
          open_in_new_tab?: boolean | null
          order: number
          parent_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          column_index?: number | null
          created_at?: string
          description?: string | null
          href?: string
          id?: string
          name?: string
          open_in_new_tab?: boolean | null
          order?: number
          parent_id?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_sections: {
        Row: {
          column_index: number | null
          created_at: string
          id: string
          nav_item_id: string | null
          order_index: number | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          column_index?: number | null
          created_at?: string
          id?: string
          nav_item_id?: string | null
          order_index?: number | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          column_index?: number | null
          created_at?: string
          id?: string
          nav_item_id?: string | null
          order_index?: number | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_sections_nav_item_id_fkey"
            columns: ["nav_item_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_survey: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          order_index: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      nutrition_survey_content: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      nutrition_survey_image: {
        Row: {
          created_at: string
          id: string
          image_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      nutrivibe_interest_areas: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          event_id: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrivibe_interest_areas_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrivibe_pricing: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          event_id: string | null
          id: string
          is_active: boolean | null
          participation_type: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          participation_type: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          participation_type?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrivibe_pricing_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrivibe_registrations: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string | null
          designation: string | null
          email: string
          email_sent: boolean | null
          email_sent_at: string | null
          event_id: string | null
          full_name: string
          id: string
          interest_areas: Json | null
          interest_areas_other: string | null
          networking_purpose: string | null
          organization: string | null
          participation_type: string
          participation_type_other: string | null
          payment_date: string | null
          payment_reference: string | null
          payment_status: string | null
          paystack_reference: string | null
          phone_number: string
          price_amount: number
          qr_code_data: string | null
          qr_code_url: string | null
          registration_date: string | null
          updated_at: string | null
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          designation?: string | null
          email: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          event_id?: string | null
          full_name: string
          id?: string
          interest_areas?: Json | null
          interest_areas_other?: string | null
          networking_purpose?: string | null
          organization?: string | null
          participation_type: string
          participation_type_other?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          paystack_reference?: string | null
          phone_number: string
          price_amount: number
          qr_code_data?: string | null
          qr_code_url?: string | null
          registration_date?: string | null
          updated_at?: string | null
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string | null
          designation?: string | null
          email?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          event_id?: string | null
          full_name?: string
          id?: string
          interest_areas?: Json | null
          interest_areas_other?: string | null
          networking_purpose?: string | null
          organization?: string | null
          participation_type?: string
          participation_type_other?: string | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          paystack_reference?: string | null
          phone_number?: string
          price_amount?: number
          qr_code_data?: string | null
          qr_code_url?: string | null
          registration_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrivibe_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrivibe_settings: {
        Row: {
          created_at: string | null
          early_bird_deadline: string | null
          early_bird_discount: number | null
          event_date: string
          event_id: string | null
          event_time: string
          id: string
          is_active: boolean | null
          location: string
          max_capacity: number | null
          registration_deadline: string | null
          terms_and_conditions: string | null
          updated_at: string | null
          venue_details: string | null
        }
        Insert: {
          created_at?: string | null
          early_bird_deadline?: string | null
          early_bird_discount?: number | null
          event_date: string
          event_id?: string | null
          event_time: string
          id?: string
          is_active?: boolean | null
          location: string
          max_capacity?: number | null
          registration_deadline?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          venue_details?: string | null
        }
        Update: {
          created_at?: string | null
          early_bird_deadline?: string | null
          early_bird_discount?: number | null
          event_date?: string
          event_id?: string | null
          event_time?: string
          id?: string
          is_active?: boolean | null
          location?: string
          max_capacity?: number | null
          registration_deadline?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          venue_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrivibe_settings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          background_image: string | null
          created_at: string
          description: string | null
          heading: string
          id: string
          section_id: string
          updated_at: string
        }
        Insert: {
          background_image?: string | null
          created_at?: string
          description?: string | null
          heading: string
          id?: string
          section_id: string
          updated_at?: string
        }
        Update: {
          background_image?: string | null
          created_at?: string
          description?: string | null
          heading?: string
          id?: string
          section_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_updates: {
        Row: {
          created_at: string
          id: string
          page_name: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_name: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          id?: string
          page_name?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          favicon_url: string | null
          id: number
          is_active: boolean | null
          logo_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          favicon_url?: string | null
          id?: never
          is_active?: boolean | null
          logo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          favicon_url?: string | null
          id?: never
          is_active?: boolean | null
          logo_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      slider_images: {
        Row: {
          created_at: string
          cta_text: string | null
          cta_url: string | null
          description: string | null
          id: number
          image_url: string | null
          order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          order: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      smartspoon_hero: {
        Row: {
          background_image: string
          created_at: string
          id: string
          subtitle: string
          tagline: string
          title: string
          updated_at: string
        }
        Insert: {
          background_image: string
          created_at?: string
          id?: string
          subtitle: string
          tagline: string
          title: string
          updated_at?: string
        }
        Update: {
          background_image?: string
          created_at?: string
          id?: string
          subtitle?: string
          tagline?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      smartspoon_packages: {
        Row: {
          created_at: string
          duration_type: string
          features: Json
          gradient: string
          id: number
          name: string
          order_number: number
          price: number
          recommended: boolean | null
          show_price: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_type: string
          features: Json
          gradient: string
          id?: number
          name: string
          order_number: number
          price: number
          recommended?: boolean | null
          show_price?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_type?: string
          features?: Json
          gradient?: string
          id?: number
          name?: string
          order_number?: number
          price?: number
          recommended?: boolean | null
          show_price?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      smartspoon_packages_settings: {
        Row: {
          created_at: string | null
          cta_link: string | null
          description: string | null
          id: number
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_link?: string | null
          description?: string | null
          id?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_link?: string | null
          description?: string | null
          id?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      smartspoon_slides: {
        Row: {
          background_image: string
          created_at: string | null
          cta_text: string | null
          cta_url: string | null
          id: number
          order: number
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_image: string
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          id?: number
          order?: number
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_image?: string
          created_at?: string | null
          cta_text?: string | null
          cta_url?: string | null
          id?: number
          order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      smartspoon_steps: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: number
          order_number: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon: string
          id?: number
          order_number: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: number
          order_number?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      smartspoon_steps_settings: {
        Row: {
          background_image: string | null
          created_at: string | null
          description: string | null
          id: number
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          background_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          background_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      smartspoon_users: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon_name: string
          id?: number
          sort_order: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      smartspoon_users_header: {
        Row: {
          created_at: string
          heading: string
          id: string
          paragraph: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          heading: string
          id?: string
          paragraph: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          heading?: string
          id?: string
          paragraph?: string
          updated_at?: string
        }
        Relationships: []
      }
      statistics: {
        Row: {
          created_at: string
          display_order: number
          id: number
          label: string
          number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order: number
          id?: number
          label: string
          number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: number
          label?: string
          number?: string
          updated_at?: string
        }
        Relationships: []
      }
      statistics_header: {
        Row: {
          heading: string
          id: number
          paragraph: string
        }
        Insert: {
          heading?: string
          id?: number
          paragraph?: string
        }
        Update: {
          heading?: string
          id?: number
          paragraph?: string
        }
        Relationships: []
      }
      tawkto_settings: {
        Row: {
          created_at: string
          enabled: boolean | null
          id: number
          property_id: string
          updated_at: string
          widget_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          id?: number
          property_id: string
          updated_at?: string
          widget_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          id?: number
          property_id?: string
          updated_at?: string
          widget_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string
          created_at: string
          display_order: number
          id: number
          image_src: string
          linkedin_url: string | null
          name: string
          position: string
          twitter_url: string | null
          updated_at: string
        }
        Insert: {
          bio: string
          created_at?: string
          display_order: number
          id?: number
          image_src: string
          linkedin_url?: string | null
          name: string
          position: string
          twitter_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          display_order?: number
          id?: number
          image_src?: string
          linkedin_url?: string | null
          name?: string
          position?: string
          twitter_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      terms_and_conditions: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string | null
          id: number
          image: string
          name: string
          quote: string
          rating: number
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          image: string
          name: string
          quote: string
          rating: number
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          image?: string
          name?: string
          quote?: string
          rating?: number
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      testimonials_content: {
        Row: {
          created_at: string
          id: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_announcement_views: {
        Row: {
          announcement_id: string
          id: string
          user_session_id: string
          viewed_at: string | null
        }
        Insert: {
          announcement_id: string
          id?: string
          user_session_id: string
          viewed_at?: string | null
        }
        Update: {
          announcement_id?: string
          id?: string
          user_session_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_announcement_views_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      values_image: {
        Row: {
          description: string | null
          floating_image_url: string | null
          id: number
          image_url: string | null
          title: string
        }
        Insert: {
          description?: string | null
          floating_image_url?: string | null
          id?: number
          image_url?: string | null
          title: string
        }
        Update: {
          description?: string | null
          floating_image_url?: string | null
          id?: number
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      values_list: {
        Row: {
          created_at: string | null
          description: string
          display_order: number
          id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order: number
          id?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number
          id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      values_vision: {
        Row: {
          bullet_points: Json
          created_at: string | null
          description: string
          id: number
          sections: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bullet_points: Json
          created_at?: string | null
          description: string
          id?: number
          sections?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bullet_points?: Json
          created_at?: string | null
          description?: string
          id?: number
          sections?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          created_at: string
          enabled: boolean | null
          id: number
          message: string | null
          phone_number: string
          position: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean | null
          id?: number
          message?: string | null
          phone_number: string
          position?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean | null
          id?: number
          message?: string | null
          phone_number?: string
          position?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      why_choose_us_features: {
        Row: {
          created_at: string | null
          description: string
          display_order: number
          icon_path: string
          id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order: number
          icon_path: string
          id?: number
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number
          icon_path?: string
          id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_booking: { Args: { p_booking_id: string }; Returns: Json }
      cleanup_old_announcement_views: { Args: never; Returns: undefined }
      create_booking: {
        Args: {
          p_email: string
          p_event_id: string
          p_name: string
          p_phone: string
        }
        Returns: Json
      }
      get_event_registration_stats: {
        Args: { p_event_id: string }
        Returns: {
          checked_in_count: number
          completed_registrations: number
          pending_registrations: number
          total_registrations: number
          total_revenue: number
        }[]
      }
      update_booking_status: {
        Args: { p_booking_id: string; p_status: string }
        Returns: Json
      }
    }
    Enums: {
      package_duration: "day" | "week" | "month" | "year"
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
    Enums: {
      package_duration: ["day", "week", "month", "year"],
    },
  },
} as const
