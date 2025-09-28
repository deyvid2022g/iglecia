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
      blog_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      blog_interactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          type: string
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          type: string
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          type?: string
          content?: string | null
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          category_id: string | null
          author_id: string
          is_published: boolean
          is_featured: boolean
          published_at: string | null
          view_count: number
          like_count: number
          comment_count: number
          tags: string[] | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          category_id?: string | null
          author_id: string
          is_published?: boolean
          is_featured?: boolean
          published_at?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          category_id?: string | null
          author_id?: string
          is_published?: boolean
          is_featured?: boolean
          published_at?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          tags?: string[] | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      event_interactions: {
        Row: {
          id: string
          event_id: string
          user_id: string
          type: string
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          type: string
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          type?: string
          content?: string | null
          created_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: string
          registered_at: string
          attended: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: string
          registered_at?: string
          attended?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: string
          registered_at?: string
          attended?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          location_name: string | null
          location_address: string | null
          event_date: string
          start_time: string | null
          end_time: string | null
          featured_image: string | null
          category_id: string | null
          type: string
          max_attendees: number | null
          current_attendees: number
          requires_rsvp: boolean
          cost: number | null
          host_contact: string | null
          is_published: boolean
          is_featured: boolean
          tags: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          location_name?: string | null
          location_address?: string | null
          event_date: string
          start_time?: string | null
          end_time?: string | null
          featured_image?: string | null
          category_id?: string | null
          type: string
          max_attendees?: number | null
          current_attendees?: number
          requires_rsvp?: boolean
          cost?: number | null
          host_contact?: string | null
          is_published?: boolean
          is_featured?: boolean
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          location_name?: string | null
          location_address?: string | null
          event_date?: string
          start_time?: string | null
          end_time?: string | null
          featured_image?: string | null
          category_id?: string | null
          type?: string
          max_attendees?: number | null
          current_attendees?: number
          requires_rsvp?: boolean
          cost?: number | null
          host_contact?: string | null
          is_published?: boolean
          is_featured?: boolean
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sermon_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string | null
          icon: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
          icon?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sermon_interactions: {
        Row: {
          id: string
          sermon_id: string
          user_id: string
          type: string
          content: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sermon_id: string
          user_id: string
          type: string
          content?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sermon_id?: string
          user_id?: string
          type?: string
          content?: string | null
          created_at?: string
        }
      }
      sermon_resources: {
        Row: {
          id: string
          sermon_id: string
          title: string
          description: string | null
          resource_type: string
          file_url: string | null
          external_url: string | null
          file_size: number | null
          download_count: number
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sermon_id: string
          title: string
          description?: string | null
          resource_type: string
          file_url?: string | null
          external_url?: string | null
          file_size?: number | null
          download_count?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sermon_id?: string
          title?: string
          description?: string | null
          resource_type?: string
          file_url?: string | null
          external_url?: string | null
          file_size?: number | null
          download_count?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      sermon_series: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          thumbnail_url: string | null
          start_date: string | null
          end_date: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          thumbnail_url?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          thumbnail_url?: string | null
          start_date?: string | null
          end_date?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      sermons: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          speaker: string
          speaker_bio: string | null
          speaker_image_url: string | null
          sermon_date: string
          duration: string | null
          video_url: string | null
          audio_url: string | null
          thumbnail_url: string | null
          transcript: string | null
          has_transcript: boolean
          scripture_references: string[] | null
          view_count: number
          like_count: number
          comment_count: number
          is_published: boolean
          is_featured: boolean
          category_id: string | null
          series_id: string | null
          tags: string[] | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          speaker: string
          speaker_bio?: string | null
          speaker_image_url?: string | null
          sermon_date: string
          duration?: string | null
          video_url?: string | null
          audio_url?: string | null
          thumbnail_url?: string | null
          transcript?: string | null
          has_transcript?: boolean
          scripture_references?: string[] | null
          view_count?: number
          like_count?: number
          comment_count?: number
          is_published?: boolean
          is_featured?: boolean
          category_id?: string | null
          series_id?: string | null
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          speaker?: string
          speaker_bio?: string | null
          speaker_image_url?: string | null
          sermon_date?: string
          duration?: string | null
          video_url?: string | null
          audio_url?: string | null
          thumbnail_url?: string | null
          transcript?: string | null
          has_transcript?: boolean
          scripture_references?: string[] | null
          view_count?: number
          like_count?: number
          comment_count?: number
          is_published?: boolean
          is_featured?: boolean
          category_id?: string | null
          series_id?: string | null
          tags?: string[] | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          address: string | null
          birth_date: string | null
          gender: string | null
          marital_status: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          baptism_date: string | null
          membership_date: string | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          address?: string | null
          birth_date?: string | null
          gender?: string | null
          marital_status?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          baptism_date?: string | null
          membership_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          address?: string | null
          birth_date?: string | null
          gender?: string | null
          marital_status?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          baptism_date?: string | null
          membership_date?: string | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      age_groups: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          min_age: number | null
          max_age: number | null
          color: string | null
          icon: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          min_age?: number | null
          max_age?: number | null
          color?: string | null
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          min_age?: number | null
          max_age?: number | null
          color?: string | null
          icon?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ministries: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          mission: string | null
          vision: string | null
          leader_id: string | null
          target_age_group: string | null
          meeting_schedule: string | null
          location: string | null
          contact_email: string | null
          contact_phone: string | null
          requirements: string[] | null
          benefits: string[] | null
          image_url: string | null
          color: string | null
          icon: string | null
          is_active: boolean
          is_recruiting: boolean
          max_members: number | null
          current_members: number
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          mission?: string | null
          vision?: string | null
          leader_id?: string | null
          target_age_group?: string | null
          meeting_schedule?: string | null
          location?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          requirements?: string[] | null
          benefits?: string[] | null
          image_url?: string | null
          color?: string | null
          icon?: string | null
          is_active?: boolean
          is_recruiting?: boolean
          max_members?: number | null
          current_members?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          mission?: string | null
          vision?: string | null
          leader_id?: string | null
          target_age_group?: string | null
          meeting_schedule?: string | null
          location?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          requirements?: string[] | null
          benefits?: string[] | null
          image_url?: string | null
          color?: string | null
          icon?: string | null
          is_active?: boolean
          is_recruiting?: boolean
          max_members?: number | null
          current_members?: number
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      ministry_members: {
        Row: {
          id: string
          ministry_id: string
          user_id: string
          role: string
          joined_date: string
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ministry_id: string
          user_id: string
          role?: string
          joined_date?: string
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ministry_id?: string
          user_id?: string
          role?: string
          joined_date?: string
          is_active?: boolean
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
      increment_blog_post_views: {
        Args: {
          post_id: string
        }
        Returns: undefined
      }
      increment_event_views: {
        Args: {
          event_id: string
        }
        Returns: undefined
      }
      increment_sermon_views: {
        Args: {
          sermon_id: string
        }
        Returns: undefined
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