import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Event {
  id: string
  slug: string
  title: string
  description: string
  detailed_description?: string
  event_date: string
  start_time: string
  end_time: string
  location_name: string
  location_address?: string
  image_url?: string
  thumbnail_url?: string
  category_id?: string
  type: string
  max_attendees: number | null
  current_attendees: number
  requires_rsvp: boolean
  cost: number
  host_name?: string
  host_contact?: string
  is_published: boolean
  is_featured: boolean
  tags?: string[]
  created_by?: string
  created_at: string
  updated_at: string
  category?: EventCategory
}

export interface EventCategory {
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

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string
  status: 'confirmed' | 'cancelled' | 'waitlist'
  registered_at: string
  notes?: string
  event?: Event
  user?: {
    id: string
    email: string
    full_name: string
  }
}

export interface EventStats {
  totalEvents: number
  publishedEvents: number
  eventsThisMonth: number
  totalRegistrations: number
  registrationsThisMonth: number
  averageAttendance: number
  upcomingEvents: number
  featuredEvents: number
}

export interface EventFilters {
  search: string
  category: string
  type: string
  status: 'all' | 'published' | 'draft'
  dateRange: {
    start?: string
    end?: string
  }
}

export const useEventManagement = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [stats, setStats] = useState<EventStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: '',
    type: '',
    status: 'all',
    dateRange: {}
  })

  // Fetch events with filters
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('events')
        .select(`
          id, slug, title, description, detailed_description, event_date, 
          start_time, end_time, location_name, location_address, image_url, 
          thumbnail_url, category_id, type, max_attendees, current_attendees, 
          requires_rsvp, cost, host_name, host_contact, is_published, 
          is_featured, tags, created_by, created_at, updated_at,
          category:event_categories(id, name, slug, color, icon)
        `)

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.status !== 'all') {
        query = query.eq('is_published', filters.status === 'published')
      }
      if (filters.dateRange.start) {
        query = query.gte('event_date', filters.dateRange.start)
      }
      if (filters.dateRange.end) {
        query = query.lte('event_date', filters.dateRange.end)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching events')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('event_categories')
        .select('id, name, slug, description, color, icon, display_order, is_active, created_at, updated_at')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }, [])

  // Fetch registrations
  const fetchRegistrations = useCallback(async (eventId?: string) => {
    try {
      let query = supabase
        .from('event_registrations')
        .select(`
          id, event_id, user_id, status, registered_at, notes,
          event:events(id, title, event_date),
          user:users(id, email, full_name)
        `)

      if (eventId) {
        query = query.eq('event_id', eventId)
      }

      const { data, error } = await query.order('registered_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (err) {
      console.error('Error fetching registrations:', err)
    }
  }, [])

  // Calculate stats
  const calculateStats = useCallback(async () => {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const today = now.toISOString().split('T')[0]

      // Total events
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })

      // Published events
      const { count: publishedEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      // Events this month
      const { count: eventsThisMonth } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)

      // Upcoming events
      const { count: upcomingEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('event_date', today)
        .eq('is_published', true)

      // Featured events
      const { count: featuredEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)
        .eq('is_published', true)

      // Total registrations
      const { count: totalRegistrations } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })

      // Registrations this month
      const { count: registrationsThisMonth } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .gte('registered_at', startOfMonth)

      // Calculate average attendance
      const { data: eventsWithAttendance } = await supabase
        .from('events')
        .select('current_attendees')
        .gt('current_attendees', 0)

      const averageAttendance = eventsWithAttendance?.length > 0
        ? eventsWithAttendance.reduce((sum, event) => sum + event.current_attendees, 0) / eventsWithAttendance.length
        : 0

      setStats({
        totalEvents: totalEvents || 0,
        publishedEvents: publishedEvents || 0,
        eventsThisMonth: eventsThisMonth || 0,
        upcomingEvents: upcomingEvents || 0,
        featuredEvents: featuredEvents || 0,
        totalRegistrations: totalRegistrations || 0,
        registrationsThisMonth: registrationsThisMonth || 0,
        averageAttendance: Math.round(averageAttendance)
      })
    } catch (err) {
      console.error('Error calculating stats:', err)
    }
  }, [])

  // Create event
  const createEvent = useCallback(async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()

      if (error) throw error

      if (data) {
        await fetchEvents()
        await calculateStats()
        return data[0]
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchEvents, calculateStats])

  // Update event
  const updateEvent = useCallback(async (id: string, eventData: Partial<Event>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()

      if (error) throw error

      if (data) {
        await fetchEvents()
        await calculateStats()
        return data[0]
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchEvents, calculateStats])

  // Delete event
  const deleteEvent = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchEvents()
      await calculateStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchEvents, calculateStats])

  // Register for event
  const registerForEvent = useCallback(async (eventId: string, userId: string, notes?: string) => {
    try {
      setLoading(true)
      setError(null)

      const registrationData = {
        event_id: eventId,
        user_id: userId,
        status: 'confirmed' as const,
        notes
      }

      const { data, error } = await supabase
        .from('event_registrations')
        .insert([registrationData])
        .select()

      if (error) throw error

      // Update event attendee count
      const event = events.find(e => e.id === eventId)
      if (event) {
        await updateEvent(eventId, {
          current_attendees: event.current_attendees + 1
        })
      }

      await fetchRegistrations(eventId)
      await calculateStats()
      return data?.[0]
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error registering for event')
      throw err
    } finally {
      setLoading(false)
    }
  }, [events, updateEvent, fetchRegistrations, calculateStats])

  // Cancel registration
  const cancelRegistration = useCallback(async (registrationId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Get registration details first
      const { data: registration, error: fetchError } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('id', registrationId)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('id', registrationId)

      if (error) throw error

      // Update event attendee count
      const event = events.find(e => e.id === registration.event_id)
      if (event && event.current_attendees > 0) {
        await updateEvent(registration.event_id, {
          current_attendees: event.current_attendees - 1
        })
      }

      await fetchRegistrations(registration.event_id)
      await calculateStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error canceling registration')
      throw err
    } finally {
      setLoading(false)
    }
  }, [events, updateEvent, fetchRegistrations, calculateStats])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Initialize data
  useEffect(() => {
    fetchEvents()
    fetchCategories()
    calculateStats()
  }, [fetchEvents, fetchCategories, calculateStats])

  return {
    // Data
    events,
    categories,
    registrations,
    stats,
    filters,
    
    // State
    loading,
    error,
    
    // Actions
    fetchEvents,
    fetchCategories,
    fetchRegistrations,
    calculateStats,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    updateFilters,
    
    // Utils
    clearError: () => setError(null)
  }
}