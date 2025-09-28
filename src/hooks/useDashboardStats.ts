import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface DashboardStats {
  events: {
    total: number
    upcoming: number
    thisMonth: number
  }
  sermons: {
    total: number
    thisMonth: number
    totalViews: number
  }
  blogPosts: {
    total: number
    published: number
    thisMonth: number
  }
  members: {
    total: number
    active: number
    newThisMonth: number
  }
}

export interface RecentActivity {
  id: string
  type: 'event' | 'sermon' | 'blog' | 'member'
  title: string
  description: string
  date: string
  user?: string
  status?: string
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    events: { total: 0, upcoming: 0, thisMonth: 0 },
    sermons: { total: 0, thisMonth: 0, totalViews: 0 },
    blogPosts: { total: 0, published: 0, thisMonth: 0 },
    members: { total: 0, active: 0, newThisMonth: 0 }
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayOfMonthISO = firstDayOfMonth.toISOString()

      // Obtener estadísticas de eventos
      const [eventsTotal, eventsUpcoming, eventsThisMonth] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .gte('event_date', now.toISOString().split('T')[0])
          .eq('is_published', true),
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonthISO)
      ])

      // Obtener estadísticas de sermones
      const [sermonsTotal, sermonsThisMonth, sermonsViews] = await Promise.all([
        supabase.from('sermons').select('id', { count: 'exact', head: true }),
        supabase
          .from('sermons')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonthISO),
        supabase.from('sermons').select('view_count').eq('is_published', true)
      ])

      // Obtener estadísticas de blog
      const [blogTotal, blogPublished, blogThisMonth] = await Promise.all([
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonthISO)
      ])

      // Obtener estadísticas de miembros
      const [membersTotal, membersThisMonth] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonthISO)
      ])

      // Calcular total de vistas de sermones
      const totalViews = sermonsViews.data?.reduce((sum, sermon) => sum + (sermon.view_count || 0), 0) || 0

      setStats({
        events: {
          total: eventsTotal.count || 0,
          upcoming: eventsUpcoming.count || 0,
          thisMonth: eventsThisMonth.count || 0
        },
        sermons: {
          total: sermonsTotal.count || 0,
          thisMonth: sermonsThisMonth.count || 0,
          totalViews
        },
        blogPosts: {
          total: blogTotal.count || 0,
          published: blogPublished.count || 0,
          thisMonth: blogThisMonth.count || 0
        },
        members: {
          total: membersTotal.count || 0,
          active: membersTotal.count || 0, // Usando total como activos ya que no tenemos is_active
          newThisMonth: membersThisMonth.count || 0
        }
      })

    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError('Error al cargar las estadísticas del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = []

      // Obtener eventos recientes
      const { data: recentEvents } = await supabase
        .from('events')
        .select('id, title, created_at, event_date')
        .order('created_at', { ascending: false })
        .limit(3)

      recentEvents?.forEach(event => {
        activities.push({
          id: event.id,
          type: 'event',
          title: event.title,
          description: `Evento programado para ${new Date(event.event_date).toLocaleDateString()}`,
          date: event.created_at
        })
      })

      // Obtener sermones recientes
      const { data: recentSermons } = await supabase
        .from('sermons')
        .select('id, title, created_at, speaker')
        .order('created_at', { ascending: false })
        .limit(3)

      recentSermons?.forEach(sermon => {
        activities.push({
          id: sermon.id,
          type: 'sermon',
          title: sermon.title,
          description: `Predicado por ${sermon.speaker}`,
          date: sermon.created_at,
          user: sermon.speaker
        })
      })

      // Obtener posts de blog recientes
      const { data: recentPosts } = await supabase
        .from('blog_posts')
        .select('id, title, created_at, author')
        .order('created_at', { ascending: false })
        .limit(3)

      recentPosts?.forEach(post => {
        activities.push({
          id: post.id,
          type: 'blog',
          title: post.title,
          description: 'Nueva publicación en el blog',
          date: post.created_at,
          user: post.author
        })
      })

      // Ordenar por fecha más reciente
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentActivity(activities.slice(0, 10))

    } catch (err) {
      console.error('Error fetching recent activity:', err)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchRecentActivity()
  }, [])

  const refreshStats = () => {
    fetchStats()
    fetchRecentActivity()
  }

  return {
    stats,
    recentActivity,
    loading,
    error,
    refreshStats
  }
}