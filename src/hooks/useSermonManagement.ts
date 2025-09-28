import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Sermon {
  id: string
  slug: string
  title: string
  description: string
  content: string
  scripture_references?: string[]
  speaker: string
  speaker_bio?: string
  sermon_date: string
  duration?: string
  audio_url?: string
  video_url?: string
  transcript?: string
  notes?: string
  thumbnail_url?: string
  category_id?: string
  series_id?: string
  tags?: string[]
  view_count: number
  download_count: number
  is_published: boolean
  is_featured: boolean
  created_by?: string
  created_at: string
  updated_at: string
  category?: SermonCategory
  series?: SermonSeries
  resources?: SermonResource[]
}

export interface SermonCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SermonSeries {
  id: string
  title: string
  slug: string
  description: string
  image_url?: string
  start_date: string
  end_date?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface SermonResource {
  id: string
  sermon_id: string
  title: string
  description?: string
  resource_type: 'pdf' | 'audio' | 'video' | 'link' | 'image' | 'document'
  file_url: string
  file_size?: number
  download_count: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface SermonStats {
  totalSermons: number
  publishedSermons: number
  sermonsThisMonth: number
  totalViews: number
  totalDownloads: number
  averageDuration: number
  featuredSermons: number
  activeSeries: number
}

export interface SermonFilters {
  search: string
  category: string
  series: string
  speaker: string
  status: 'all' | 'published' | 'draft'
  dateRange: {
    start?: string
    end?: string
  }
}

export const useSermonManagement = () => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [categories, setCategories] = useState<SermonCategory[]>([])
  const [series, setSeries] = useState<SermonSeries[]>([])
  const [resources, setResources] = useState<SermonResource[]>([])
  const [stats, setStats] = useState<SermonStats>({
    totalSermons: 0,
    publishedSermons: 0,
    sermonsThisMonth: 0,
    totalViews: 0,
    totalDownloads: 0,
    averageDuration: 0,
    featuredSermons: 0,
    activeSeries: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<SermonFilters>({
    search: '',
    category: '',
    series: '',
    speaker: '',
    status: 'all',
    dateRange: {}
  })

  // Fetch sermons
  const fetchSermons = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Fetching sermons with filters:', filters)

      let query = supabase
        .from('sermons')
        .select('*')

      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,speaker.ilike.%${filters.search}%`)
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.series) {
        query = query.eq('series_id', filters.series)
      }

      if (filters.speaker) {
        query = query.ilike('speaker', `%${filters.speaker}%`)
      }

      if (filters.status !== 'all') {
        query = query.eq('is_published', filters.status === 'published')
      }

      if (filters.dateRange.start) {
        query = query.gte('sermon_date', filters.dateRange.start)
      }

      if (filters.dateRange.end) {
        query = query.lte('sermon_date', filters.dateRange.end)
      }

      const { data, error } = await query.order('sermon_date', { ascending: false })

      if (error) {
        console.error('❌ Error in sermon query:', error)
        throw error
      }

      console.log('✅ Sermons fetched successfully:', data?.length || 0, 'sermons')
      console.log('📋 Sermon data:', data)
      
      setSermons(data || [])
    } catch (err) {
      console.error('Error fetching sermons:', err)
      setError(err instanceof Error ? err.message : 'Error fetching sermons')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sermon_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error

      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }, [])

  // Fetch series
  const fetchSeries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sermon_series')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error

      setSeries(data || [])
    } catch (err) {
      console.error('Error fetching series:', err)
    }
  }, [])

  // Fetch resources
  const fetchResources = useCallback(async (sermonId?: string) => {
    try {
      let query = supabase
        .from('sermon_resources')
        .select('*')

      if (sermonId) {
        query = query.eq('sermon_id', sermonId)
      }

      const { data, error } = await query.order('display_order')

      if (error) throw error

      setResources(data || [])
    } catch (err) {
      console.error('Error fetching resources:', err)
    }
  }, [])

  // Calculate stats
  const calculateStats = useCallback(async () => {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // Total sermons
      const { count: totalSermons } = await supabase
        .from('sermons')
        .select('*', { count: 'exact', head: true })

      // Published sermons
      const { count: publishedSermons } = await supabase
        .from('sermons')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      // Sermons this month
      const { count: sermonsThisMonth } = await supabase
        .from('sermons')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)

      // Featured sermons
      const { count: featuredSermons } = await supabase
        .from('sermons')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)

      // Active series
      const { count: activeSeries } = await supabase
        .from('sermon_series')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Total views and downloads
      const { data: viewsData } = await supabase
        .from('sermons')
        .select('view_count, download_count, duration')

      const totalViews = viewsData?.reduce((sum, sermon) => sum + (sermon.view_count || 0), 0) || 0
      const totalDownloads = viewsData?.reduce((sum, sermon) => sum + (sermon.download_count || 0), 0) || 0

      // Average duration (convert from string format like "45:30" to minutes)
      const sermonsWithDuration = viewsData?.filter(sermon => sermon.duration) || []
      const averageDuration = sermonsWithDuration.length > 0
        ? sermonsWithDuration.reduce((sum, sermon) => {
            const durationMatch = sermon.duration?.match(/(\d+)/)
            return sum + (durationMatch ? parseInt(durationMatch[1]) : 0)
          }, 0) / sermonsWithDuration.length
        : 0

      setStats({
        totalSermons: totalSermons || 0,
        publishedSermons: publishedSermons || 0,
        sermonsThisMonth: sermonsThisMonth || 0,
        featuredSermons: featuredSermons || 0,
        activeSeries: activeSeries || 0,
        totalViews,
        totalDownloads,
        averageDuration: Math.round(averageDuration)
      })
    } catch (err) {
      console.error('Error calculating stats:', err)
    }
  }, [])

  // Create sermon
  const createSermon = useCallback(async (sermonData: Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'download_count'>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sermons')
        .insert({
          ...sermonData,
          view_count: 0,
          download_count: 0
        })
        .select()
        .single()

      if (error) throw error

      await fetchSermons()
      await calculateStats()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating sermon')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchSermons, calculateStats])

  // Update sermon
  const updateSermon = useCallback(async (id: string, sermonData: Partial<Sermon>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sermons')
        .update(sermonData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchSermons()
      await calculateStats()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating sermon')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchSermons, calculateStats])

  // Delete sermon
  const deleteSermon = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchSermons()
      await calculateStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting sermon')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchSermons, calculateStats])

  // Create series
  const createSeries = useCallback(async (seriesData: Omit<SermonSeries, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sermon_series')
        .insert(seriesData)
        .select()
        .single()

      if (error) throw error

      await fetchSeries()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating series')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchSeries])

  // Update series
  const updateSeries = useCallback(async (id: string, seriesData: Partial<SermonSeries>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sermon_series')
        .update(seriesData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchSeries()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating series')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchSeries])

  // Delete series
  const deleteSeries = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('sermon_series')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchSeries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting series')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchSeries])

  // Create category
  const createCategory = useCallback(async (categoryData: Omit<SermonCategory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sermon_categories')
        .insert(categoryData)
        .select()
        .single()

      if (error) throw error

      await fetchCategories()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating category')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchCategories])

  // Update category
  const updateCategory = useCallback(async (id: string, categoryData: Partial<SermonCategory>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sermon_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchCategories()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating category')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchCategories])

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('sermon_categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting category')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchCategories])

  // Create resource
  const createResource = useCallback(async (resourceData: Omit<SermonResource, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sermon_resources')
        .insert(resourceData)
        .select()
        .single()

      if (error) throw error

      await fetchResources()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating resource')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchResources])

  // Update resource
  const updateResource = useCallback(async (id: string, resourceData: Partial<SermonResource>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('sermon_resources')
        .update(resourceData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchResources()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating resource')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchResources])

  // Delete resource
  const deleteResource = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('sermon_resources')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchResources()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting resource')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchResources])

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initialize data
  useEffect(() => {
    fetchSermons()
    fetchCategories()
    fetchSeries()
    calculateStats()
  }, [fetchSermons, fetchCategories, fetchSeries, calculateStats])

  return {
    // Data
    sermons,
    categories,
    series,
    resources,
    stats,
    loading,
    error,
    filters,

    // Actions
    setFilters,
    clearError,
    fetchSermons,
    fetchCategories,
    fetchSeries,
    fetchResources,
    calculateStats,

    // Sermon CRUD
    createSermon,
    updateSermon,
    deleteSermon,

    // Series CRUD
    createSeries,
    updateSeries,
    deleteSeries,

    // Category CRUD
    createCategory,
    updateCategory,
    deleteCategory,

    // Resource CRUD
    createResource,
    updateResource,
    deleteResource
  }
}