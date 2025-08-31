import { useState, useEffect, useCallback } from 'react'
import { supabase, type Sermon } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface SermonsState {
  sermons: Sermon[]
  loading: boolean
  error: string | null
}

export interface SermonsActions {
  createSermon: (sermonData: Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>) => Promise<{ data: Sermon | null; error: Error | null }>
  updateSermon: (id: string, updates: Partial<Sermon>) => Promise<{ data: Sermon | null; error: Error | null }>
  deleteSermon: (id: string) => Promise<{ error: Error | null }>
  getSermonBySlug: (slug: string) => Promise<{ data: Sermon | null; error: Error | null }>
  incrementViewCount: (id: string) => Promise<{ error: Error | null }>
  toggleLike: (sermonId: string) => Promise<{ error: Error | null }>
  refreshSermons: () => Promise<void>
}

export const useSermons = (options?: {
  published?: boolean
  limit?: number
  speaker?: string
  category?: string
  featured?: boolean
}): SermonsState & SermonsActions => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSermons = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('sermons')
        .select(`
          *,
          sermon_categories(
            id,
            name,
            description,
            color
          ),
          profiles!sermons_created_by_fkey(
            name,
            avatar_url
          )
        `)
        .order('sermon_date', { ascending: false })

      // Aplicar filtros
      if (options?.published !== undefined) {
        query = query.eq('is_published', options.published)
      }

      if (options?.speaker) {
        query = query.eq('speaker', options.speaker)
      }

      if (options?.category) {
        query = query.eq('category_id', options.category)
      }

      if (options?.featured !== undefined) {
        query = query.eq('featured', options.featured)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
        console.error('Error fetching sermons:', error)
      } else {
        setSermons(data || [])
      }
    } catch (err) {
      setError('Error al cargar sermones')
      console.error('Error in fetchSermons:', err)
    } finally {
      setLoading(false)
    }
  }, [options?.published, options?.limit, options?.speaker, options?.category, options?.featured])

  useEffect(() => {
    fetchSermons()
  }, [fetchSermons, options?.published, options?.limit, options?.speaker, options?.category, options?.featured])

  const createSermon = async (sermonData: Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>) => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .insert({
          ...sermonData,
          created_by: user?.id,
          view_count: 0,
          like_count: 0,
          comment_count: 0
        })
        .select()
        .single()

      if (!error && data) {
        setSermons(prev => [data, ...prev])
      }

      return { data, error }
    } catch (err) {
      console.error('Error creating sermon:', err)
      return { data: null, error: err }
    }
  }

  const updateSermon = async (id: string, updates: Partial<Sermon>) => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        setSermons(prev => prev.map(sermon => sermon.id === id ? data : sermon))
      }

      return { data, error }
    } catch (err) {
      console.error('Error updating sermon:', err)
      return { data: null, error: err }
    }
  }

  const deleteSermon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', id)

      if (!error) {
        setSermons(prev => prev.filter(sermon => sermon.id !== id))
      }

      return { error }
    } catch (err) {
      console.error('Error deleting sermon:', err)
      return { error: err }
    }
  }

  const getSermonBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('sermons')
        .select(`
          *,
          sermon_categories(
            id,
            name,
            description,
            color
          ),
          profiles!sermons_created_by_fkey(
            name,
            avatar_url
          )
        `)
        .eq('slug', slug)
        .single()

      return { data, error }
    } catch (err) {
      console.error('Error getting sermon by slug:', err)
      return { data: null, error: err }
    }
  }

  const incrementViewCount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sermons')
        .update({
          view_count: supabase.rpc('increment_view_count', { sermon_id: id })
        })
        .eq('id', id)

      if (!error) {
        setSermons(prev => prev.map(sermon => 
          sermon.id === id 
            ? { ...sermon, view_count: sermon.view_count + 1 }
            : sermon
        ))
      }

      return { error }
    } catch (err) {
      console.error('Error incrementing view count:', err)
      return { error: err }
    }
  }

  const toggleLike = async (sermonId: string) => {
    try {
      if (!user) {
        return { error: { message: 'Debes iniciar sesión para dar like' } }
      }

      // Verificar si ya existe el like
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', 'sermon')
        .eq('content_id', sermonId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        return { error: checkError }
      }

      if (existingLike) {
        // Quitar like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_type', 'sermon')
          .eq('content_id', sermonId)

        return { error }
      } else {
        // Agregar like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            content_type: 'sermon',
            content_id: sermonId
          })

        return { error }
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      return { error: err }
    }
  }

  const refreshSermons = async () => {
    await fetchSermons()
  }

  return {
    sermons,
    loading,
    error,
    createSermon,
    updateSermon,
    deleteSermon,
    getSermonBySlug,
    incrementViewCount,
    toggleLike,
    refreshSermons
  }
}

// Hook específico para obtener un sermón por slug
export const useSermon = (slug: string) => {
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSermon = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('sermons')
          .select(`
            *,
            sermon_categories(
              id,
              name,
              description,
              color
            ),
            profiles!sermons_created_by_fkey(
              name,
              avatar_url
            )
          `)
          .eq('slug', slug)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setSermon(data)
        }
      } catch (err) {
        setError('Error al cargar sermón')
        console.error('Error fetching sermon:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSermon()
  }, [slug])

  return { sermon, loading, error }
}

// Hook para sermones destacados
export const useFeaturedSermons = (limit: number = 3) => {
  return useSermons({
    published: true,
    featured: true,
    limit
  })
}

// Hook para sermones recientes
export const useRecentSermons = (limit: number = 6) => {
  return useSermons({
    published: true,
    limit
  })
}

// Hook para sermones por predicador
export const useSermonsBySpeaker = (speaker: string) => {
  return useSermons({
    published: true,
    speaker
  })
}

// Hook para categorías de sermones
export const useSermonCategories = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; description?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('sermon_categories')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) {
          setError(error.message)
        } else {
          setCategories(data || [])
        }
      } catch (err) {
        setError('Error al cargar categorías')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}