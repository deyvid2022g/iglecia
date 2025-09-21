import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { type Sermon } from '../services/sermonService'
import { useAuth } from './useAuth'

// Re-export Sermon type for external use
export { type Sermon } from '../services/sermonService'

export interface SermonsState {
  sermons: Sermon[]
  loading: boolean
  error: string | null
  hasMore: boolean
}

export interface SermonsActions {
  createSermon: (sermonData: Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>) => Promise<{ data: Sermon | null; error: Error | null }>
  updateSermon: (id: string, updates: Partial<Sermon>) => Promise<{ data: Sermon | null; error: Error | null }>
  deleteSermon: (id: string) => Promise<{ error: Error | null }>
  getSermonBySlug: (slug: string) => Promise<{ data: Sermon | null; error: Error | null }>
  incrementViewCount: (id: string) => Promise<{ error: Error | null }>
  toggleLike: (sermonId: string) => Promise<{ error: Error | null }>
  refreshSermons: () => Promise<void>
  fetchSermons: () => Promise<void>
  searchSermons: (query: string) => Promise<void>
  loadMore: () => Promise<void>
}

// Datos mock para sermones
const getDefaultSermons = (): Sermon[] => []

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
  const [hasMore, setHasMore] = useState(true)
  const { user } = useAuth()

  const fetchSermons = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      // Obtener sermones del localStorage o usar datos por defecto
      const storedSermons = localStorage.getItem('sermons')
      let allSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Si no hay sermones en localStorage, guardar los datos por defecto
      if (!storedSermons) {
        localStorage.setItem('sermons', JSON.stringify(allSermons))
      }

      // Aplicar filtros
      let filteredSermons = [...allSermons]

      if (options?.published !== undefined) {
        filteredSermons = filteredSermons.filter(sermon => sermon.is_published === options.published)
      }

      if (options?.speaker) {
        filteredSermons = filteredSermons.filter(sermon => sermon.preacher === options.speaker)
      }

      if (options?.category) {
        filteredSermons = filteredSermons.filter(sermon => sermon.category_id === options.category)
      }

      if (options?.featured !== undefined) {
        filteredSermons = filteredSermons.filter(sermon => sermon.is_featured === options.featured)
      }

      // Ordenar por fecha de sermón (más reciente primero)
      filteredSermons.sort((a, b) => new Date(b.preached_at).getTime() - new Date(a.preached_at).getTime())

      // Aplicar límite
      if (options?.limit) {
        filteredSermons = filteredSermons.slice(0, options.limit)
      }

      setSermons(filteredSermons)
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

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('sermons_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sermons' },
        (payload) => {
          console.log('Sermons change received:', payload);
          // Handle different types of changes
          if (payload.eventType === 'INSERT' && payload.new) {
            setSermons(prev => [payload.new as Sermon, ...prev]);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            setSermons(prev => prev.map(sermon => 
              sermon.id === payload.new.id ? payload.new as Sermon : sermon
            ));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setSermons(prev => prev.filter(sermon => sermon.id !== payload.old.id));
          } else {
            // Fallback: refresh all data
            fetchSermons();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSermons]);

  const createSermon = async (sermonData: Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      const newSermon: Sermon = {
        ...sermonData,
        id: Date.now().toString(),
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Obtener sermones existentes del localStorage
      const storedSermons = localStorage.getItem('sermons')
      const existingSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Agregar el nuevo sermón
      const updatedSermons = [newSermon, ...existingSermons]
      localStorage.setItem('sermons', JSON.stringify(updatedSermons))

      // Actualizar el estado local
      setSermons(prev => [newSermon, ...prev])

      return { data: newSermon, error: null }
    } catch (err) {
      console.error('Error creating sermon:', err)
      return { data: null, error: err as Error }
    }
  }

  const updateSermon = async (id: string, updates: Partial<Sermon>) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      // Obtener sermones del localStorage
      const storedSermons = localStorage.getItem('sermons')
      const existingSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Encontrar y actualizar el sermón
      const sermonIndex = existingSermons.findIndex(sermon => sermon.id === id)
      if (sermonIndex === -1) {
        throw new Error('Sermón no encontrado')
      }

      const updatedSermon = {
        ...existingSermons[sermonIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      existingSermons[sermonIndex] = updatedSermon
      localStorage.setItem('sermons', JSON.stringify(existingSermons))

      // Actualizar el estado local
      setSermons(prev => prev.map(sermon => sermon.id === id ? updatedSermon : sermon))

      return { data: updatedSermon, error: null }
    } catch (err) {
      console.error('Error updating sermon:', err)
      return { data: null, error: err as Error }
    }
  }

  const deleteSermon = async (id: string) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      // Obtener sermones del localStorage
      const storedSermons = localStorage.getItem('sermons')
      const existingSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Filtrar el sermón a eliminar
      const updatedSermons = existingSermons.filter(sermon => sermon.id !== id)
      localStorage.setItem('sermons', JSON.stringify(updatedSermons))

      // Actualizar el estado local
      setSermons(prev => prev.filter(sermon => sermon.id !== id))

      return { error: null }
    } catch (err) {
      console.error('Error deleting sermon:', err)
      return { error: err as Error }
    }
  }

  const incrementViewCount = async (id: string) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 200))

      // Obtener sermones del localStorage
      const storedSermons = localStorage.getItem('sermons')
      const existingSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Encontrar y actualizar el contador de vistas
      const sermonIndex = existingSermons.findIndex(sermon => sermon.id === id)
      if (sermonIndex !== -1) {
        existingSermons[sermonIndex].view_count += 1
        localStorage.setItem('sermons', JSON.stringify(existingSermons))

        // Actualizar el estado local
        setSermons(prev => prev.map(sermon => 
          sermon.id === id 
            ? { ...sermon, view_count: sermon.view_count + 1 }
            : sermon
        ))
      }

      return { error: null }
    } catch (err) {
      console.error('Error incrementing view count:', err)
      return { error: err as Error }
    }
  }

  const toggleLike = async (sermonId: string) => {
    try {
      if (!user) {
        return { error: { message: 'Debes iniciar sesión para dar like' } as Error }
      }

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300))

      // Obtener likes del localStorage
      const storedLikes = localStorage.getItem('sermon_likes')
      const existingLikes: { userId: string; sermonId: string }[] = storedLikes ? JSON.parse(storedLikes) : []

      // Verificar si ya existe el like
      const likeIndex = existingLikes.findIndex(like => like.userId === user.id && like.sermonId === sermonId)
      const hasLike = likeIndex !== -1

      // Obtener sermones del localStorage
      const storedSermons = localStorage.getItem('sermons')
      const existingSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Encontrar el sermón
      const sermonIndex = existingSermons.findIndex(sermon => sermon.id === sermonId)
      if (sermonIndex === -1) {
        throw new Error('Sermón no encontrado')
      }

      if (hasLike) {
        // Quitar like
        existingLikes.splice(likeIndex, 1)
        existingSermons[sermonIndex].like_count = Math.max(0, existingSermons[sermonIndex].like_count - 1)
      } else {
        // Agregar like
        existingLikes.push({ userId: user.id, sermonId })
        existingSermons[sermonIndex].like_count += 1
      }

      // Guardar cambios
      localStorage.setItem('sermon_likes', JSON.stringify(existingLikes))
      localStorage.setItem('sermons', JSON.stringify(existingSermons))

      // Actualizar estado local
      setSermons(prev => prev.map(sermon => 
        sermon.id === sermonId 
          ? { ...sermon, like_count: existingSermons[sermonIndex].like_count }
          : sermon
      ))

      return { error: null }
    } catch (err) {
      console.error('Error toggling like:', err)
      return { error: err as Error }
    }
  }

  const refreshSermons = async () => {
    await fetchSermons()
  }

  const searchSermons = async (query: string) => {
    try {
      setLoading(true)
      setError(null)

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300))

      // Obtener sermones del localStorage o usar datos por defecto
      const storedSermons = localStorage.getItem('sermons')
      let allSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Filtrar por query de búsqueda
      const filteredSermons = allSermons.filter(sermon => 
        sermon.title.toLowerCase().includes(query.toLowerCase()) ||
        (sermon.description && sermon.description.toLowerCase().includes(query.toLowerCase())) ||
        sermon.preacher.toLowerCase().includes(query.toLowerCase()) ||
        (sermon.tags && sermon.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())))
      )

      // Aplicar otros filtros si existen
      let finalSermons = [...filteredSermons]

      if (options?.published !== undefined) {
        finalSermons = finalSermons.filter(sermon => sermon.is_published === options.published)
      }

      if (options?.speaker) {
        finalSermons = finalSermons.filter(sermon => sermon.preacher === options.speaker)
      }

      if (options?.category) {
        finalSermons = finalSermons.filter(sermon => sermon.category_id === options.category)
      }

      if (options?.featured !== undefined) {
        finalSermons = finalSermons.filter(sermon => sermon.is_featured === options.featured)
      }

      // Ordenar por fecha de sermón (más reciente primero)
      finalSermons.sort((a, b) => new Date(b.preached_at).getTime() - new Date(a.preached_at).getTime())

      // Aplicar límite
      if (options?.limit) {
        finalSermons = finalSermons.slice(0, options.limit)
      }

      setSermons(finalSermons)
      setHasMore(finalSermons.length >= (options?.limit || 10))
    } catch (err) {
      setError('Error al buscar sermones')
      console.error('Error in searchSermons:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!hasMore || loading) return

    try {
      setLoading(true)
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300))

      // Obtener sermones del localStorage o usar datos por defecto
      const storedSermons = localStorage.getItem('sermons')
      let allSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Aplicar filtros
      let filteredSermons = [...allSermons]

      if (options?.published !== undefined) {
        filteredSermons = filteredSermons.filter(sermon => sermon.is_published === options.published)
      }

      if (options?.speaker) {
        filteredSermons = filteredSermons.filter(sermon => sermon.preacher === options.speaker)
      }

      if (options?.category) {
        filteredSermons = filteredSermons.filter(sermon => sermon.category_id === options.category)
      }

      if (options?.featured !== undefined) {
        filteredSermons = filteredSermons.filter(sermon => sermon.is_featured === options.featured)
      }

      // Ordenar por fecha de sermón (más reciente primero)
      filteredSermons.sort((a, b) => new Date(b.preached_at).getTime() - new Date(a.preached_at).getTime())

      // Obtener los siguientes elementos
      const currentLength = sermons.length
      const nextBatch = filteredSermons.slice(currentLength, currentLength + 10)

      if (nextBatch.length > 0) {
        setSermons(prev => [...prev, ...nextBatch])
        setHasMore(currentLength + nextBatch.length < filteredSermons.length)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      setError('Error al cargar más sermones')
      console.error('Error in loadMore:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    sermons,
    loading,
    error,
    hasMore,
    createSermon,
    updateSermon,
    deleteSermon,
    getSermonBySlug: async (slug: string): Promise<{ data: Sermon | null; error: Error | null }> => {
      try {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500))

        // Obtener sermones del localStorage
        const storedSermons = localStorage.getItem('sermons')
        const existingSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

        // Buscar el sermón por slug
        const sermon = existingSermons.find(s => s.slug === slug)
        
        if (!sermon) {
          return { data: null, error: new Error('Sermón no encontrado') }
        }

        return { data: sermon, error: null }
      } catch (err) {
        console.error('Error getting sermon by slug:', err)
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error') }
      }
    },
    incrementViewCount,
    toggleLike,
    refreshSermons,
    fetchSermons,
    searchSermons,
    loadMore
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

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300))

        // Obtener sermones del localStorage
        const storedSermons = localStorage.getItem('sermons')
        const existingSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

        // Buscar el sermón por slug
        const foundSermon = existingSermons.find(s => s.slug === slug)

        if (!foundSermon) {
          setError('Sermón no encontrado')
        } else {
          setSermon(foundSermon)
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

  const getDefaultCategories = () => [
    { id: 'cat1', name: 'Doctrina', description: 'Enseñanzas fundamentales de la fe cristiana' },
    { id: 'cat2', name: 'Vida Cristiana', description: 'Cómo vivir como cristiano en el día a día' },
    { id: 'cat3', name: 'Evangelismo', description: 'Compartiendo el evangelio con otros' },
    { id: 'cat4', name: 'Familia', description: 'Principios bíblicos para la familia' },
    { id: 'cat5', name: 'Juventud', description: 'Mensajes dirigidos a los jóvenes' }
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 200))

        // Obtener categorías del localStorage o usar datos por defecto
        const storedCategories = localStorage.getItem('sermon_categories')
        const existingCategories = storedCategories ? JSON.parse(storedCategories) : getDefaultCategories()

        // Guardar en localStorage si no existían
        if (!storedCategories) {
          localStorage.setItem('sermon_categories', JSON.stringify(existingCategories))
        }

        setCategories(existingCategories)
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