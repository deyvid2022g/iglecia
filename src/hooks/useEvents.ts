import { useState, useEffect, useCallback } from 'react'
import { supabase, type Event } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface EventsState {
  events: Event[]
  loading: boolean
  error: string | null
}

export interface EventsActions {
  createEvent: (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_registrations'>) => Promise<{ data: Event | null; error: Error | null }>
  updateEvent: (id: string, updates: Partial<Event>) => Promise<{ data: Event | null; error: Error | null }>
  deleteEvent: (id: string) => Promise<{ error: Error | null }>
  getEventBySlug: (slug: string) => Promise<{ data: Event | null; error: Error | null }>
  registerForEvent: (eventId: string, registrationData: {
    name: string
    email: string
    phone?: string
    guests?: number
    special_requests?: string
  }) => Promise<{ error: Error | null }>
  getEventRegistrations: (eventId: string) => Promise<{ data: { id: string; name: string; email: string; status: string }[] | null; error: Error | null }>
  refreshEvents: () => Promise<void>
}

export const useEvents = (options?: {
  published?: boolean
  limit?: number
  type?: string
}): EventsState & EventsActions => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('events')
        .select(`
          *,
          locations(
            id,
            name,
            address,
            full_address
          )
        `)
        .order('event_date', { ascending: true })

      // Aplicar filtros
      if (options?.published !== undefined) {
        query = query.eq('is_published', options.published)
      }

      if (options?.type) {
        query = query.eq('type', options.type)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
        console.error('Error fetching events:', error)
      } else {
        setEvents(data || [])
      }
    } catch (_) {
      setError('Error al cargar eventos')
      console.error('Error in fetchEvents:', _)
    } finally {
      setLoading(false)
    }
  }, [options?.published, options?.limit, options?.type])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents, options?.published, options?.limit, options?.type])

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_registrations'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user?.id,
          current_registrations: 0
        })
        .select()
        .single()

      if (!error && data) {
        setEvents(prev => [...prev, data])
      }

      return { data, error }
    } catch (_) {
      console.error('Error creating event:', _)
      return { data: null, error: _ }
    }
  }

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        setEvents(prev => prev.map(event => event.id === id ? data : event))
      }

      return { data, error }
    } catch (_) {
      console.error('Error updating event:', _)
      return { data: null, error: _ }
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (!error) {
        setEvents(prev => prev.filter(event => event.id !== id))
      }

      return { error }
    } catch (_) {
      console.error('Error deleting event:', _)
      return { error: _ }
    }
  }

  const getEventBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          locations(
            id,
            name,
            address,
            full_address,
            latitude,
            longitude
          )
        `)
        .eq('slug', slug)
        .single()

      return { data, error }
    } catch (_) {
      console.error('Error getting event by slug:', _)
      return { data: null, error: _ }
    }
  }

  const registerForEvent = async (eventId: string, registrationData: {
    name: string
    email: string
    phone?: string
    guests?: number
    special_requests?: string
  }) => {
    try {
      // Insertar registro
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user?.id,
          ...registrationData,
          guests: registrationData.guests || 1
        })

      if (registrationError) {
        return { error: registrationError }
      }

      // Actualizar contador de registros
      const { error: updateError } = await supabase
        .from('events')
        .update({
          current_registrations: supabase.rpc('increment_registrations', { 
            event_id: eventId,
            increment_by: registrationData.guests || 1 
          })
        })
        .eq('id', eventId)

      if (updateError) {
        console.error('Error updating registration count:', updateError)
      }

      // Refrescar eventos
      await fetchEvents()

      return { error: null }
    } catch (_) {
      console.error('Error registering for event:', _)
      return { error: _ }
    }
  }

  const getEventRegistrations = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          profiles(
            name,
            email,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .order('registration_date', { ascending: false })

      return { data, error }
    } catch (_) {
      console.error('Error getting event registrations:', _)
      return { data: null, error: _ }
    }
  }

  const refreshEvents = async () => {
    await fetchEvents()
  }

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventBySlug,
    registerForEvent,
    getEventRegistrations,
    refreshEvents
  }
}

// Hook específico para obtener un evento por slug
export const useEvent = (slug: string) => {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            locations(
              id,
              name,
              address,
              full_address,
              latitude,
              longitude
            )
          `)
          .eq('slug', slug)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setEvent(data)
        }
      } catch (_) {
        setError('Error al cargar evento')
        console.error('Error fetching event:', _)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [slug])

  return { event, loading, error }
}

// Hook para eventos próximos
export const useUpcomingEvents = (limit: number = 5) => {
  return useEvents({
    published: true,
    limit
  })
}

// Hook para eventos por tipo
export const useEventsByType = (type: string) => {
  return useEvents({
    published: true,
    type
  })
}