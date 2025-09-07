import { useState, useEffect, useCallback } from 'react'
import { type Sermon } from '../lib/supabase'
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

// Datos mock para sermones
const getDefaultSermons = (): Sermon[] => [
  {
    id: '1',
    slug: 'la-gracia-de-dios',
    title: 'La Gracia de Dios',
    description: 'Un mensaje sobre la gracia infinita de Dios hacia nosotros',
    speaker: 'Pastor Juan Pérez',
    sermon_date: '2024-01-15',
    duration: '45:30',
    thumbnail_url: '/images/sermons/gracia-dios.jpg',
    video_url: 'https://example.com/video1',
    audio_url: 'https://example.com/audio1',
    transcript: null,
    has_transcript: false,
    view_count: 125,
    like_count: 23,
    comment_count: 8,
    tags: ['gracia', 'salvación', 'amor'],
    category_id: 'cat1',
    is_published: true,
    featured: true,
    created_by: 'user1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    slug: 'el-poder-de-la-oracion',
    title: 'El Poder de la Oración',
    description: 'Descubriendo el poder transformador de la oración en nuestras vidas',
    speaker: 'Pastora María González',
    sermon_date: '2024-01-08',
    duration: '38:15',
    thumbnail_url: '/images/sermons/poder-oracion.jpg',
    video_url: 'https://example.com/video2',
    audio_url: 'https://example.com/audio2',
    transcript: null,
    has_transcript: false,
    view_count: 89,
    like_count: 15,
    comment_count: 5,
    tags: ['oración', 'fe', 'poder'],
    category_id: 'cat2',
    is_published: true,
    featured: false,
    created_by: 'user2',
    created_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-01-08T10:00:00Z'
  },
  {
    id: '3',
    slug: 'viviendo-en-comunidad',
    title: 'Viviendo en Comunidad',
    description: 'La importancia de la comunidad cristiana en nuestro crecimiento espiritual',
    speaker: 'Pastor Carlos Rodríguez',
    sermon_date: '2024-01-01',
    duration: '42:20',
    thumbnail_url: '/images/sermons/comunidad.jpg',
    video_url: 'https://example.com/video3',
    audio_url: 'https://example.com/audio3',
    transcript: null,
    has_transcript: false,
    view_count: 156,
    like_count: 31,
    comment_count: 12,
    tags: ['comunidad', 'iglesia', 'crecimiento'],
    category_id: 'cat1',
    is_published: true,
    featured: true,
    created_by: 'user3',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  }
]

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
        filteredSermons = filteredSermons.filter(sermon => sermon.speaker === options.speaker)
      }

      if (options?.category) {
        filteredSermons = filteredSermons.filter(sermon => sermon.category_id === options.category)
      }

      if (options?.featured !== undefined) {
        filteredSermons = filteredSermons.filter(sermon => sermon.featured === options.featured)
      }

      // Ordenar por fecha de sermón (más reciente primero)
      filteredSermons.sort((a, b) => new Date(b.sermon_date).getTime() - new Date(a.sermon_date).getTime())

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

  const createSermon = async (sermonData: Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      const newSermon: Sermon = {
        ...sermonData,
        id: Date.now().toString(),
        created_by: user?.id || 'anonymous',
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

  const getSermonBySlug = async (slug: string) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      // Obtener sermones del localStorage
      const storedSermons = localStorage.getItem('sermons')
      const existingSermons: Sermon[] = storedSermons ? JSON.parse(storedSermons) : getDefaultSermons()

      // Buscar el sermón por slug
      const sermon = existingSermons.find(s => s.slug === slug)
      
      if (!sermon) {
        throw new Error('Sermón no encontrado')
      }

      return { data: sermon, error: null }
    } catch (err) {
      console.error('Error getting sermon by slug:', err)
      return { data: null, error: err }
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