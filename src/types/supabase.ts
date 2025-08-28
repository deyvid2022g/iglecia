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
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'admin' | 'pastor' | 'editor' | 'member'
          avatar_url?: string
          phone?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: 'admin' | 'pastor' | 'editor' | 'member'
          avatar_url?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'admin' | 'pastor' | 'editor' | 'member'
          avatar_url?: string
          phone?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          author_id: string
          author_name: string
          author_email: string
          post_type: 'blog' | 'sermon' | 'event'
          post_id: string
          parent_id?: string
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          author_id: string
          author_name: string
          author_email: string
          post_type: 'blog' | 'sermon' | 'event'
          post_id: string
          parent_id?: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          author_id?: string
          author_name?: string
          author_email?: string
          post_type?: 'blog' | 'sermon' | 'event'
          post_id?: string
          parent_id?: string
          is_approved?: boolean
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          date: string
          start_time: string
          end_time: string
          type: string
          location: {
            name: string
            address: string
            fullAddress?: string
            coordinates?: { lat: number; lng: number }
          }
          description?: string
          capacity?: number
          registrations: number
          image?: string
          host?: string
          requires_rsvp: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          start_time: string
          end_time: string
          type: string
          location: {
            name: string
            address: string
            fullAddress?: string
            coordinates?: { lat: number; lng: number }
          }
          description?: string
          capacity?: number
          registrations?: number
          image?: string
          host?: string
          requires_rsvp?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          start_time?: string
          end_time?: string
          type?: string
          location?: {
            name: string
            address: string
            fullAddress?: string
            coordinates?: { lat: number; lng: number }
          }
          description?: string
          capacity?: number
          registrations?: number
          image?: string
          host?: string
          requires_rsvp?: boolean
          updated_at?: string
        }
      }
      sermons: {
        Row: {
          id: string
          slug: string
          title: string
          speaker: string
          date: string
          description?: string
          tags?: string[]
          video_url?: string
          thumbnail_url?: string
          audio_url?: string
          scripture?: string
          series?: string
          view_count: number
          download_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          speaker: string
          date: string
          description?: string
          tags?: string[]
          video_url?: string
          thumbnail_url?: string
          audio_url?: string
          scripture?: string
          series?: string
          view_count?: number
          download_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          speaker?: string
          date?: string
          description?: string
          tags?: string[]
          video_url?: string
          thumbnail_url?: string
          audio_url?: string
          scripture?: string
          series?: string
          view_count?: number
          download_count?: number
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt?: string
          content: string
          author: {
            name: string
            avatar_url?: string
          }
          category?: string
          tags?: string[]
          published_at?: string
          cover_image?: string
          views: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt?: string
          content: string
          author: {
            name: string
            avatar_url?: string
          }
          category?: string
          tags?: string[]
          published_at?: string
          cover_image?: string
          views?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string
          content?: string
          author?: {
            name: string
            avatar_url?: string
          }
          category?: string
          tags?: string[]
          published_at?: string
          cover_image?: string
          views?: number
          featured?: boolean
          updated_at?: string
        }
      }
    }
  }
}