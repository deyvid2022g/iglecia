import { useState, useEffect, useMemo } from 'react'
import { 
  sermonsService, 
  sermonCategoriesService, 
  sermonSeriesService, 
  sermonResourcesService,
  sermonInteractionsService,
  type Sermon, 
  type SermonWithRelations,
  type SermonCategory, 
  type SermonSeries, 
  type SermonResource 
} from '../services/sermonService'

// Hook para obtener todos los sermones con paginación
export const useSermons = (page = 1, limit = 10) => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true)
        const data = await sermonsService.getAll(page, limit)
        setSermons(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sermones')
      } finally {
        setLoading(false)
      }
    }

    fetchSermons()
  }, [page, limit])

  return { sermons, loading, error }
}

// Hook para obtener un sermón específico por slug
export const useSermon = (slug: string) => {
  const [sermon, setSermon] = useState<SermonWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSermon = async () => {
      if (!slug) return

      try {
        setLoading(true)
        const data = await sermonsService.getBySlug(slug)
        setSermon(data)
        setError(null)
        
        // Incrementar contador de vistas
        if (data?.id) {
          await sermonsService.incrementViews(data.id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el sermón')
      } finally {
        setLoading(false)
      }
    }

    fetchSermon()
  }, [slug])

  return { sermon, loading, error }
}

// Hook para obtener categorías de sermones
export const useSermonCategories = () => {
  const [categories, setCategories] = useState<SermonCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await sermonCategoriesService.getAll({ active: true })
        setCategories(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

// Hook para obtener series de sermones
export const useSermonSeries = () => {
  const [series, setSeries] = useState<SermonSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true)
        const data = await sermonSeriesService.getActive()
        setSeries(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar series')
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [])

  return { series, loading, error }
}

// Hook para obtener recursos de un sermón
export const useSermonResources = (sermonId: string) => {
  const [resources, setResources] = useState<SermonResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      if (!sermonId) return

      try {
        setLoading(true)
        const data = await sermonResourcesService.getBySermonId(sermonId)
        setResources(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar recursos')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [sermonId])

  return { resources, loading, error }
}

// Hook para obtener sermones destacados
export const useFeaturedSermons = (limit = 5) => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedSermons = async () => {
      try {
        setLoading(true)
        const data = await sermonsService.getFeatured(limit)
        setSermons(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sermones destacados')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedSermons()
  }, [limit])

  return { sermons, loading, error }
}

// Hook para buscar sermones
export const useSermonSearch = () => {
  const [results, setResults] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query: string, page = 1, limit = 10) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      const data = await sermonsService.search(query, page, limit)
      setResults(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda')
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setResults([])
    setError(null)
  }

  return { results, loading, error, search, clearSearch }
}

// Hook para filtrar sermones
export const useSermonFilters = (
  filters: {
    category?: string
    series?: string
    speaker?: string
    hasTranscript?: boolean
    hasVideo?: boolean
    hasAudio?: boolean
    tags?: string[]
    dateRange?: { start?: string; end?: string }
  } = {},
  searchTerm = '',
  sortBy = 'created_at',
  sortOrder = 'desc'
) => {
  const [sermons, setSermons] = useState<SermonWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoize the service filters to prevent unnecessary re-renders
  const serviceFilters = useMemo(() => ({
    categoryId: filters.category,
    seriesId: filters.series,
    speaker: filters.speaker,
    hasTranscript: filters.hasTranscript,
    hasVideo: filters.hasVideo,
    hasAudio: filters.hasAudio,
    tags: filters.tags,
    dateFrom: filters.dateRange?.start,
    dateTo: filters.dateRange?.end
  }), [
    filters.category,
    filters.series,
    filters.speaker,
    filters.hasTranscript,
    filters.hasVideo,
    filters.hasAudio,
    filters.tags,
    filters.dateRange?.start,
    filters.dateRange?.end
  ])

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        setLoading(true)

        let data: SermonWithRelations[]
        
        if (searchTerm) {
          // Use search if there's a search term
          data = await sermonsService.search(searchTerm, 1, 50) // Increase limit for search
        } else {
          // Check if any filters are active
          const hasActiveFilters = serviceFilters.categoryId || serviceFilters.seriesId || 
            serviceFilters.speaker || serviceFilters.hasTranscript !== undefined || 
            serviceFilters.hasVideo !== undefined || serviceFilters.hasAudio !== undefined || 
            serviceFilters.tags?.length || serviceFilters.dateFrom || serviceFilters.dateTo;
          
          if (hasActiveFilters) {
            // Use filters if any are active
            data = await sermonsService.getWithFilters(serviceFilters, 1, 50)
          } else {
            // Use getAll if no filters are active
            data = await sermonsService.getAll(1, 50)
          }
        }
        
        // Apply sorting
        data.sort((a, b) => {
          let aValue: any, bValue: any
          
          switch (sortBy) {
            case 'title':
              aValue = a.title
              bValue = b.title
              break
            case 'view_count':
              aValue = a.view_count || 0
              bValue = b.view_count || 0
              break
            case 'likes_count':
              aValue = a.like_count || 0
              bValue = b.like_count || 0
              break
            default:
              aValue = a.created_at
              bValue = b.created_at
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
        
        setSermons(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sermones')
        setSermons([])
      } finally {
        setLoading(false)
      }
    }

    fetchSermons()
  }, [serviceFilters, searchTerm, sortBy, sortOrder])

  return { sermons, loading, error }
}

// Hook para obtener sermones por categoría
export const useSermonsByCategory = (categoryId: string, page = 1, limit = 10) => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSermons = async () => {
      if (!categoryId) return

      try {
        setLoading(true)
        const data = await sermonsService.getByCategory(categoryId, page, limit)
        setSermons(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sermones')
      } finally {
        setLoading(false)
      }
    }

    fetchSermons()
  }, [categoryId, page, limit])

  return { sermons, loading, error }
}

// Hook para obtener sermones por serie
export const useSermonsBySeries = (seriesId: string, page = 1, limit = 10) => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSermons = async () => {
      if (!seriesId) return

      try {
        setLoading(true)
        const data = await sermonsService.getBySeries(seriesId, page, limit)
        setSermons(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sermones')
      } finally {
        setLoading(false)
      }
    }

    fetchSermons()
  }, [seriesId, page, limit])

  return { sermons, loading, error }
}

// Hook para obtener sermones por predicador
export const useSermonsBySpeaker = (speaker: string, page = 1, limit = 10) => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSermons = async () => {
      if (!speaker) return

      try {
        setLoading(true)
        const data = await sermonsService.getBySpeaker(speaker, page, limit)
        setSermons(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar sermones')
      } finally {
        setLoading(false)
      }
    }

    fetchSermons()
  }, [speaker, page, limit])

  return { sermons, loading, error }
}

// Hook para obtener predicadores únicos
export const useSpeakers = () => {
  const [speakers, setSpeakers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpeakers = async () => {
      try {
        setLoading(true)
        const data = await sermonsService.getSpeakers()
        setSpeakers(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar predicadores')
      } finally {
        setLoading(false)
      }
    }

    fetchSpeakers()
  }, [])

  return { speakers, loading, error }
}

// Hook para manejar interacciones de sermones
export const useSermonInteractions = (sermonId?: string) => {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [interactions, setInteractions] = useState<any[]>([])

  // Cargar interacciones cuando se proporciona sermonId
  useEffect(() => {
    if (sermonId) {
      loadInteractions()
    }
  }, [sermonId])

  const loadInteractions = async () => {
    if (!sermonId) return
    
    try {
      const data = await sermonInteractionsService.getBySermonId(sermonId)
      setInteractions(data || [])
    } catch (err) {
      console.error('Error al cargar interacciones:', err)
    }
  }

  const toggleLike = async (targetSermonId: string, userId?: string) => {
    try {
      setLoading(true)
      
      if (liked) {
        // Remover like (implementar lógica de eliminación)
        setLiked(false)
      } else {
        // Agregar like
        await sermonInteractionsService.create({
          sermon_id: targetSermonId,
          user_id: userId || 'anonymous',
          type: 'like'
        })
        
        // Incrementar contador de likes en el sermón
        await sermonsService.incrementLikes(targetSermonId)
        setLiked(true)
      }
      
      // Recargar interacciones
      await loadInteractions()
    } catch (err) {
      console.error('Error al manejar like:', err)
    } finally {
      setLoading(false)
    }
  }

  const incrementLikes = async () => {
    if (!sermonId) return
    
    try {
      await sermonsService.incrementLikes(sermonId)
      await loadInteractions()
    } catch (err) {
      console.error('Error al incrementar likes:', err)
    }
  }

  const addComment = async (content: string, userId?: string) => {
    if (!sermonId) return
    
    try {
      await sermonInteractionsService.create({
        sermon_id: sermonId,
        user_id: userId || 'anonymous',
        type: 'comment',
        content
      })
      
      // Incrementar contador de comentarios
      await sermonsService.incrementComments(sermonId)
      await loadInteractions()
    } catch (err) {
      console.error('Error al agregar comentario:', err)
    }
  }

  return { 
    liked, 
    loading, 
    interactions,
    toggleLike, 
    incrementLikes,
    addComment
  }
}

// Hook para obtener estadísticas de sermones
export const useSermonStats = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await sermonsService.getStats()
        setStats(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}