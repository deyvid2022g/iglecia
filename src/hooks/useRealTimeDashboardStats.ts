import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface RealTimeStats {
  users: {
    total: number
    admins: number
    regular: number
    newThisMonth: number
    recentUsers: Array<{
      id: string
      email: string
      full_name: string | null
      role: string
      created_at: string
    }>
  }
  events: {
    total: number
    upcoming: number
    thisMonth: number
    published: number
    categories: Array<{
      name: string
      count: number
    }>
  }
  sermons: {
    total: number
    thisMonth: number
    totalViews: number
    published: number
    series: Array<{
      name: string
      count: number
    }>
  }
  registrations: {
    total: number
    thisMonth: number
    byEvent: Array<{
      event_title: string
      count: number
    }>
  }
}

export interface ActivityLog {
  id: string
  type: 'user_registration' | 'event_created' | 'sermon_published' | 'event_registration'
  title: string
  description: string
  timestamp: string
  user_email?: string
}

// Función helper para hacer peticiones a Supabase
const postgrestRequest = async (table: string, options: {
  select?: string
  filter?: string
  order?: string
  limit?: number
  count?: boolean
} = {}) => {
  try {
    let query = supabase.from(table)

    // Aplicar select
    if (options.select) {
      query = query.select(options.select, options.count ? { count: 'exact' } : undefined)
    } else if (options.count) {
      query = query.select('*', { count: 'exact', head: true })
    } else {
      query = query.select('*')
    }

    // Aplicar filtros
    if (options.filter) {
      try {
        // Parsear filtros simples como "created_at=gte.2025-01-01" o "is_published=eq.true"
        const filterParts = options.filter.split('=')
        if (filterParts.length >= 2) {
          const column = filterParts[0]
          const condition = filterParts.slice(1).join('=') // Rejoin in case there are multiple = signs
          
          if (condition.includes('.')) {
            const [operator, ...valueParts] = condition.split('.')
            const value = valueParts.join('.') // Rejoin in case there are multiple dots
            
            switch (operator) {
              case 'gte':
                query = query.gte(column, value)
                break
              case 'lte':
                query = query.lte(column, value)
                break
              case 'gt':
                query = query.gt(column, value)
                break
              case 'lt':
                query = query.lt(column, value)
                break
              case 'eq':
                query = query.eq(column, value === 'true' ? true : value === 'false' ? false : value)
                break
              case 'neq':
                query = query.neq(column, value === 'true' ? true : value === 'false' ? false : value)
                break
              case 'like':
                query = query.like(column, value)
                break
              case 'ilike':
                query = query.ilike(column, value)
                break
              default:
                console.warn(`Unknown filter operator: ${operator}`)
                query = query.eq(column, condition)
            }
          } else {
            // Simple equality filter
            query = query.eq(column, condition === 'true' ? true : condition === 'false' ? false : condition)
          }
        }
      } catch (filterError) {
        console.error('Error parsing filter:', options.filter, filterError)
        // Continue without filter rather than failing
      }
    }

    // Aplicar orden
    if (options.order) {
      const [column, direction] = options.order.split('.')
      query = query.order(column, { ascending: direction !== 'desc' })
    }

    // Aplicar límite
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase query error:', {
        table,
        options,
        error: error.message || error,
        details: error.details || 'No additional details'
      })
      throw new Error(`Query failed for table ${table}: ${error.message || 'Unknown error'}`)
    }

    if (options.count) {
      return [{ count: count || 0 }]
    }

    return data || []
  } catch (error) {
    console.error('PostgREST request error:', error)
    throw error
  }
}

export const useRealTimeDashboardStats = () => {
  const [stats, setStats] = useState<RealTimeStats>({
    users: { total: 0, admins: 0, regular: 0, newThisMonth: 0, recentUsers: [] },
    events: { total: 0, upcoming: 0, thisMonth: 0, published: 0, categories: [] },
    sermons: { total: 0, thisMonth: 0, totalViews: 0, published: 0, series: [] },
    registrations: { total: 0, thisMonth: 0, byEvent: [] }
  })
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserStats = useCallback(async () => {
    try {
      // Total de usuarios
      const totalUsers = await postgrestRequest('users', { count: true })
      
      // Usuarios por rol
      const adminUsers = await postgrestRequest('users', { count: true, filter: 'role=eq.admin' })
      const regularUsers = await postgrestRequest('users', { count: true, filter: 'role=eq.user' })
      
      // Usuarios nuevos este mes
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const newUsersThisMonth = await postgrestRequest('users', { count: true, filter: `created_at=gte.${firstDayOfMonth}` })
      
      // Usuarios recientes
      const recentUsers = await postgrestRequest('users', { 
        select: 'id,email,full_name,role,created_at', 
        order: 'created_at.desc', 
        limit: 5 
      })

      return {
        total: totalUsers[0]?.count || 0,
        admins: adminUsers[0]?.count || 0,
        regular: regularUsers[0]?.count || 0,
        newThisMonth: newUsersThisMonth[0]?.count || 0,
        recentUsers: recentUsers || []
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return { total: 0, admins: 0, regular: 0, newThisMonth: 0, recentUsers: [] }
    }
  }, [])

  const fetchEventStats = useCallback(async () => {
    try {
      // Total de eventos
      const totalEvents = await postgrestRequest('events', { count: true })
      
      // Eventos próximos (simplificado: solo eventos publicados)
      const publishedEvents = await postgrestRequest('events', { count: true, filter: 'is_published=eq.true' })
      
      // Eventos este mes
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const eventsThisMonth = await postgrestRequest('events', { count: true, filter: `created_at=gte.${firstDayOfMonth}` })
      
      // Categorías de eventos (simplificado)
      const eventCategories = await postgrestRequest('event_categories', { select: 'name,id' })
      const categoriesWithCount = await Promise.all(
        eventCategories.slice(0, 5).map(async (category: { id: string; name: string }) => {
          try {
            const count = await postgrestRequest('events', { count: true, filter: `category_id=eq.${category.id}` })
            return {
              name: category.name,
              count: count[0]?.count || 0
            }
          } catch {
            return { name: category.name, count: 0 }
          }
        })
      )

      return {
        total: totalEvents[0]?.count || 0,
        upcoming: publishedEvents[0]?.count || 0, // Simplificado
        thisMonth: eventsThisMonth[0]?.count || 0,
        published: publishedEvents[0]?.count || 0,
        categories: categoriesWithCount
      }
    } catch (error) {
      console.error('Error fetching event stats:', error)
      return { total: 0, upcoming: 0, thisMonth: 0, published: 0, categories: [] }
    }
  }, [])

  const fetchSermonStats = useCallback(async () => {
    try {
      // Total de sermones
      const totalSermons = await postgrestRequest('sermons', { count: true })
      
      // Sermones este mes
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const sermonsThisMonth = await postgrestRequest('sermons', { count: true, filter: `created_at=gte.${firstDayOfMonth}` })
      
      // Sermones publicados
      const publishedSermons = await postgrestRequest('sermons', { count: true, filter: 'is_published=eq.true' })
      
      // Total de vistas
      const sermonsWithViews = await postgrestRequest('sermons', { select: 'view_count', filter: 'is_published=eq.true' })
      const totalViews = sermonsWithViews.reduce((sum: number, sermon: { view_count?: number }) => sum + (sermon.view_count || 0), 0)
      
      // Series de sermones (simplificado)
      const sermonSeries = await postgrestRequest('sermon_series', { select: 'name,id' })
      const seriesWithCount = await Promise.all(
        sermonSeries.slice(0, 5).map(async (series: { id: string; name: string }) => {
          try {
            const count = await postgrestRequest('sermons', { count: true, filter: `series_id=eq.${series.id}` })
            return {
              name: series.name,
              count: count[0]?.count || 0
            }
          } catch {
            return { name: series.name, count: 0 }
          }
        })
      )

      return {
        total: totalSermons[0]?.count || 0,
        thisMonth: sermonsThisMonth[0]?.count || 0,
        totalViews,
        published: publishedSermons[0]?.count || 0,
        series: seriesWithCount
      }
    } catch (error) {
      console.error('Error fetching sermon stats:', error)
      return { total: 0, thisMonth: 0, totalViews: 0, published: 0, series: [] }
    }
  }, [])

  const fetchRegistrationStats = useCallback(async () => {
    try {
      // Total de registros
      const totalRegistrations = await postgrestRequest('event_registrations', { count: true })
      
      // Registros este mes
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const registrationsThisMonth = await postgrestRequest('event_registrations', { count: true, filter: `registered_at=gte.${firstDayOfMonth}` })
      
      // Registros por evento (simplificado)
      const registrationsByEvent = await postgrestRequest('event_registrations', { 
        select: 'event_id', 
        limit: 10 
      })
      
      // Contar registros por evento
      const eventCounts: { [key: string]: number } = {}
      registrationsByEvent.forEach((reg: any) => {
        const eventId = reg.event_id || 'unknown'
        eventCounts[eventId] = (eventCounts[eventId] || 0) + 1
      })
      
      const byEvent = Object.entries(eventCounts).map(([event_id, count]) => ({
        event_title: `Evento ${event_id}`,
        count: count as number
      }))

      return {
        total: totalRegistrations[0]?.count || 0,
        thisMonth: registrationsThisMonth[0]?.count || 0,
        byEvent
      }
    } catch (error) {
      console.error('Error fetching registration stats:', error)
      return { total: 0, thisMonth: 0, byEvent: [] }
    }
  }, [])

  const fetchActivityLog = useCallback(async () => {
    try {
      // Actividades recientes de eventos
      const recentEvents = await postgrestRequest('events', { 
        select: 'title,created_at,event_date', 
        order: 'created_at.desc', 
        limit: 5 
      })
      
      // Actividades recientes de sermones
      const recentSermons = await postgrestRequest('sermons', { 
        select: 'title,created_at', 
        order: 'created_at.desc', 
        limit: 5 
      })
      
      // Registros recientes (simplificado)
      const recentRegistrations = await postgrestRequest('event_registrations', { 
        select: 'registered_at,event_id', 
        order: 'registered_at.desc', 
        limit: 5 
      })

      const activities = [
        ...recentEvents.map((event: any) => ({
          type: 'event',
          title: `Nuevo evento: ${event.title}`,
          timestamp: event.created_at,
          details: `Fecha del evento: ${new Date(event.event_date).toLocaleDateString()}`
        })),
        ...recentSermons.map((sermon: any) => ({
          type: 'sermon',
          title: `Nuevo sermón: ${sermon.title}`,
          timestamp: sermon.created_at,
          details: 'Sermón publicado'
        })),
        ...recentRegistrations.map((reg: any) => ({
          type: 'registration',
          title: `Nueva inscripción al evento ID: ${reg.event_id}`,
          timestamp: reg.registered_at,
          details: 'Usuario registrado'
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10)

      return activities
    } catch (error) {
      console.error('Error fetching activity log:', error)
      return []
    }
  }, [])

  const fetchAllStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [userStats, eventStats, sermonStats, registrationStats, activities] = await Promise.all([
        fetchUserStats(),
        fetchEventStats(),
        fetchSermonStats(),
        fetchRegistrationStats(),
        fetchActivityLog()
      ])

      setStats({
        users: userStats,
        events: eventStats,
        sermons: sermonStats,
        registrations: registrationStats
      })

      setActivityLog(activities)

    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('Error al cargar las estadísticas del dashboard')
    } finally {
      setLoading(false)
    }
  }, [fetchUserStats, fetchEventStats, fetchSermonStats, fetchRegistrationStats, fetchActivityLog])

  useEffect(() => {
    fetchAllStats()
    
    // Actualizar cada 30 segundos para estadísticas en tiempo real
    const interval = setInterval(fetchAllStats, 30000)
    
    return () => clearInterval(interval)
  }, [fetchAllStats])

  const refreshStats = useCallback(() => {
    fetchAllStats()
  }, [fetchAllStats])

  return {
    stats,
    activityLog,
    loading,
    error,
    refreshStats
  }
}