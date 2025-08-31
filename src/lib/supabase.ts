import { createClient } from '@supabase/supabase-js'

// Estas variables deben ser configuradas en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. Por favor configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos de base de datos generados automáticamente
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'pastor' | 'leader' | 'member'
          join_date: string
          last_login: string | null
          is_active: boolean
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'pastor' | 'leader' | 'member'
          join_date?: string
          last_login?: string | null
          is_active?: boolean
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'pastor' | 'leader' | 'member'
          join_date?: string
          last_login?: string | null
          is_active?: boolean
          bio?: string | null
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
          speaker: string
          sermon_date: string
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
          speaker: string
          sermon_date: string
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
          speaker?: string
          sermon_date?: string
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

// Helper para obtener el cliente tipado
export type SupabaseClient = typeof supabase

// Interfaces adicionales para tipos de datos
export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  role: 'admin' | 'pastor' | 'leader' | 'member'
  join_date: string
  last_login?: string
  is_active: boolean
  bio?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  slug: string
  title: string
  description: string
  detailed_description?: string
  event_date: string
  start_time: string
  end_time: string
  type: string
  location_id?: string
  capacity?: number
  current_registrations: number
  image_url?: string
  host?: string
  host_bio?: string
  requires_rsvp: boolean
  cost: string
  requirements?: string[]
  tags?: string[]
  contact_phone?: string
  contact_email?: string
  is_published: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Sermon {
  id: string
  slug: string
  title: string
  description: string
  speaker: string
  sermon_date: string
  duration?: string
  thumbnail_url?: string
  video_url?: string
  audio_url?: string
  transcript?: string
  has_transcript: boolean
  view_count: number
  like_count: number
  comment_count: number
  tags?: string[]
  category_id?: string
  is_published: boolean
  featured: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  featured_image_url?: string
  author_id?: string
  category_id?: string
  tags?: string[]
  published_at?: string
  read_time?: number
  view_count: number
  like_count: number
  comment_count: number
  is_published: boolean
  is_featured: boolean
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at: string
}

export interface Ministry {
  id: string
  name: string
  slug: string
  description: string
  detailed_description?: string
  icon?: string
  color?: string
  image_url?: string
  leader_id?: string
  target_age_group?: string
  meeting_schedule?: string
  meeting_location?: string
  contact_email?: string
  contact_phone?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}


export interface ChurchSetting {
  id: string
  setting_key: string
  setting_value: string
  category: string
  description?: string
  data_type: 'string' | 'number' | 'boolean' | 'json'
  is_public: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface ServiceSchedule {
  id: string
  service_name: string
  day_of_week: number
  start_time: string
  end_time: string
  service_type: string
  location?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OfficeHours {
  id: string
  department: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpecialDate {
  id: string
  title: string
  description?: string
  date: string
  date_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChurchFacility {
  id: string
  name: string
  description?: string
  facility_type: string
  capacity?: number
  floor_level?: number
  is_public: boolean
  is_active: boolean
  display_order: number
  amenities?: string[]
  booking_rules?: string
  hourly_rate?: number
  contact_person?: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

export interface FacilityBooking {
  id: string
  facility_id: string
  booked_by: string
  event_title: string
  event_description?: string
  start_datetime: string
  end_datetime: string
  attendee_count?: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  special_requirements?: string
  contact_phone?: string
  contact_email?: string
  created_at: string
  updated_at: string
}

// Funciones de utilidad para perfiles
export const getCurrentProfile = async (): Promise<Profile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error obteniendo perfil:', error)
      return null
    }

    // Mapear los datos de la base de datos al tipo Profile
    return {
      id: data.id,
      name: data.full_name, // Mapear full_name a name
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar_url,
      role: data.role,
      join_date: data.join_date,
      last_login: data.last_login,
      is_active: data.is_active,
      bio: data.bio,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  } catch (error) {
    console.error('Error en getCurrentProfile:', error)
    return null
  }
}

export const createProfile = async (
  userId: string, 
  userData: { full_name: string; phone?: string }
): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: new Error('Usuario no autenticado') }
    }

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: userData.full_name, // Usar full_name para la base de datos
        email: user.email || '',
        phone: userData.phone,
        role: 'member',
        is_active: true,
        join_date: new Date().toISOString()
      })

    if (error) {
      console.error('Error creando perfil:', error)
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    console.error('Error en createProfile:', error)
    return { error: error as Error }
  }
}