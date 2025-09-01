export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'pastor' | 'leader' | 'member'
          join_date: string
          last_login: string | null
          is_active: boolean
          bio: string | null
          birth_date: string | null
          gender: string | null
          marital_status: string | null
          address: string | null
          city: string | null
          country: string | null
          emergency_contact: string | null
          preferences: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'pastor' | 'leader' | 'member'
          join_date?: string
          last_login?: string | null
          is_active?: boolean
          bio?: string | null
          birth_date?: string | null
          gender?: string | null
          marital_status?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          emergency_contact?: string | null
          preferences?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'pastor' | 'leader' | 'member'
          join_date?: string
          last_login?: string | null
          is_active?: boolean
          bio?: string | null
          birth_date?: string | null
          gender?: string | null
          marital_status?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          emergency_contact?: string | null
          preferences?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          detailed_description: string | null
          event_date: string
          start_time: string
          end_time: string
          type: string
          location_id: string | null
          capacity: number | null
          current_registrations: number
          image_url: string | null
          host: string | null
          host_bio: string | null
          requires_rsvp: boolean
          cost: string
          requirements: string[] | null
          tags: string[] | null
          contact_phone: string | null
          contact_email: string | null
          is_published: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description: string
          detailed_description?: string | null
          event_date: string
          start_time: string
          end_time: string
          type: string
          location_id?: string | null
          capacity?: number | null
          current_registrations?: number
          image_url?: string | null
          host?: string | null
          host_bio?: string | null
          requires_rsvp?: boolean
          cost?: string
          requirements?: string[] | null
          tags?: string[] | null
          contact_phone?: string | null
          contact_email?: string | null
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string
          detailed_description?: string | null
          event_date?: string
          start_time?: string
          end_time?: string
          type?: string
          location_id?: string | null
          capacity?: number | null
          current_registrations?: number
          image_url?: string | null
          host?: string | null
          host_bio?: string | null
          requires_rsvp?: boolean
          cost?: string
          requirements?: string[] | null
          tags?: string[] | null
          contact_phone?: string | null
          contact_email?: string | null
          is_published?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sermons: {
        Row: {
          id: string
          slug: string
          title: string
          description: string
          speaker_name: string
          preached_date: string
          duration: string | null
          thumbnail_url: string | null
          video_url: string | null
          audio_url: string | null
          transcript: string | null
          has_transcript: boolean
          view_count: number
          like_count: number
          comment_count: number
          tags: string[] | null
          category_id: string | null
          is_published: boolean
          featured: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description: string
          speaker_name: string
          preached_date: string
          duration?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          audio_url?: string | null
          transcript?: string | null
          has_transcript?: boolean
          view_count?: number
          like_count?: number
          comment_count?: number
          tags?: string[] | null
          category_id?: string | null
          is_published?: boolean
          featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string
          speaker_name?: string
          preached_date?: string
          duration?: string | null
          thumbnail_url?: string | null
          video_url?: string | null
          audio_url?: string | null
          transcript?: string | null
          has_transcript?: boolean
          view_count?: number
          like_count?: number
          comment_count?: number
          tags?: string[] | null
          category_id?: string | null
          is_published?: boolean
          featured?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string
          content: string
          featured_image_url: string | null
          author_id: string | null
          category_id: string | null
          tags: string[] | null
          published_at: string | null
          read_time: number | null
          view_count: number
          like_count: number
          comment_count: number
          is_published: boolean
          is_featured: boolean
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt: string
          content: string
          featured_image_url?: string | null
          author_id?: string | null
          category_id?: string | null
          tags?: string[] | null
          published_at?: string | null
          read_time?: number | null
          view_count?: number
          like_count?: number
          comment_count?: number
          is_published?: boolean
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string
          content?: string
          featured_image_url?: string | null
          author_id?: string | null
          category_id?: string | null
          tags?: string[] | null
          published_at?: string | null
          read_time?: number | null
          view_count?: number
          like_count?: number
          comment_count?: number
          is_published?: boolean
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ministries: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          detailed_description: string | null
          icon: string | null
          color: string | null
          image_url: string | null
          leader_id: string | null
          target_age_group: string | null
          meeting_schedule: string | null
          meeting_location: string | null
          contact_email: string | null
          contact_phone: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          detailed_description?: string | null
          icon?: string | null
          color?: string | null
          image_url?: string | null
          leader_id?: string | null
          target_age_group?: string | null
          meeting_schedule?: string | null
          meeting_location?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          detailed_description?: string | null
          icon?: string | null
          color?: string | null
          image_url?: string | null
          leader_id?: string | null
          target_age_group?: string | null
          meeting_schedule?: string | null
          meeting_location?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_permission: {
        Args: {
          permission_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never