import { useState, useEffect, useCallback } from 'react'
import { eventService, type Event, type EventInsert, type EventUpdate } from '../services/eventService'
import { useAuth } from './useAuth'

export interface EventsState {
  events: Event[]
  loading: boolean
  error: string | null
  hasMore: boolean
}

export interface EventsActions {
  createEvent: (eventData: EventInsert) => Promise<{ data: Event | null; error: Error | null }>
  updateEvent: (id: string, updates: EventUpdate) => Promise<{ data: Event | null; error: Error | null }>
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
  searchEvents: (query: string, category?: string, limit?: number) => Promise<void>
  loadMore: () => Promise<void>
  fetchEvents: () => Promise<void>
}

export const useEvents = (options?: {
  published?: boolean
  limit?: number
  type?: string
}): EventsState & EventsActions => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useAuth()

  // Datos de ejemplo para cuando Supabase no esté configurado
  const getDefaultEvents = (): Event[] => {
    return []
  }

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: serviceError } = await eventService.events.getAll({
        published: options?.published,
        limit: options?.limit,
        type: options?.type
      })

      if (serviceError) {
        console.warn('Error al obtener eventos de Supabase, usando datos por defecto:', serviceError)
        const defaultEvents = getDefaultEvents()
        setEvents(defaultEvents)
        setHasMore(false)
        return
      }

      setEvents(data || [])
      setHasMore((data?.length || 0) >= (options?.limit || 10))
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Error al cargar los eventos')
      const defaultEvents = getDefaultEvents()
      setEvents(defaultEvents)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [options?.published, options?.limit, options?.type])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const createEvent = async (eventData: EventInsert) => {
    try {
      const { data, error: serviceError } = await eventService.events.create(eventData)
      
      if (serviceError) {
        console.error('Error creating event:', serviceError)
        return { data: null, error: serviceError }
      }

      if (data) {
        setEvents(prev => [data, ...prev])
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error creating event:', error)
      return { data: null, error: error as Error }
    }
  }

  const updateEvent = async (id: string, updates: EventUpdate) => {
    try {
      const { data, error: serviceError } = await eventService.events.update(id, updates)
      
      if (serviceError) {
        console.error('Error updating event:', serviceError)
        return { data: null, error: serviceError }
      }

      if (data) {
        setEvents(prev => prev.map(event => event.id === id ? data : event))
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Error updating event:', error)
      return { data: null, error: error as Error }
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const { error: serviceError } = await eventService.events.delete(id)
      
      if (serviceError) {
        console.error('Error deleting event:', serviceError)
        return { error: serviceError }
      }

      // Update local state
      setEvents(prev => prev.filter(event => event.id !== id))
      return { error: null }
    } catch (error) {
      console.error('Error deleting event:', error)
      return { error: error as Error }
    }
  }

  const getEventBySlug = async (slug: string) => {
    try {
      const { data, error: serviceError } = await eventService.events.getBySlug(slug)

      if (serviceError) {
        console.warn('Error al buscar en Supabase, usando datos por defecto:', serviceError)
        // Fallback a datos por defecto
        const defaultEvents = getDefaultEvents()
        const event = defaultEvents.find((event: Event) => event.slug === slug)
        return event ? { data: event, error: null } : { data: null, error: new Error('Evento no encontrado') }
      }

      if (!data) {
        return { data: null, error: new Error('Evento no encontrado') }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error getting event by slug:', error)
      return { data: null, error: error as Error }
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
      const { error: serviceError } = await eventService.registrations.create({
        event_id: eventId,
        user_id: user?.id || null,
        ...registrationData,
        guests: registrationData.guests || 1,
        status: 'confirmed'
      })
      
      if (serviceError) {
        console.error('Error registering for event:', serviceError)
        return { error: serviceError }
      }

      // Update local state - increment attendees count
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, current_attendees: (event.current_attendees || 0) + (registrationData.guests || 1) }
          : event
      ))
      
      return { error: null }
    } catch (error) {
      console.error('Error registering for event:', error)
      return { error: error as Error }
    }
  }

  const getEventRegistrations = async (eventId: string) => {
    try {
      const { data, error: serviceError } = await eventService.registrations.getByEventId(eventId)
      
      if (serviceError) {
        console.error('Error getting event registrations:', serviceError)
        return { data: null, error: serviceError }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error getting event registrations:', error)
      return { data: null, error: error as Error }
    }
  }

  const refreshEvents = async () => {
    await fetchEvents()
  }

  const searchEvents = async (query: string, category?: string, limit?: number) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: serviceError } = await eventService.events.search({
        query,
        category,
        limit: limit || 10
      })

      if (serviceError) {
        console.error('Error searching events:', serviceError)
        setError('Error al buscar eventos')
        return
      }

      setEvents(data || [])
      setHasMore(false) // Search results don't support pagination
    } catch (error) {
      console.error('Error searching events:', error)
      setError('Error al buscar eventos')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!hasMore || loading) return

    try {
      setLoading(true)
      
      const { data, error: serviceError } = await eventService.events.getAll({
        published: options?.published,
        limit: options?.limit || 10,
        offset: events.length,
        type: options?.type
      })

      if (serviceError) {
        console.error('Error loading more events:', serviceError)
        return
      }

      if (data && data.length > 0) {
        setEvents(prev => [...prev, ...data])
        setHasMore(data.length >= (options?.limit || 10))
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more events:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    events,
    loading,
    error,
    hasMore,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventBySlug,
    registerForEvent,
    getEventRegistrations,
    refreshEvents,
    searchEvents,
    loadMore,
    fetchEvents
  }
}

// Hook para obtener un evento específico por slug
export const useEvent = (slug: string) => {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: serviceError } = await eventService.events.getBySlug(slug)

        if (serviceError) {
          console.error('Error fetching event:', serviceError)
          setError('Error al cargar el evento')
          return
        }

        setEvent(data)
      } catch (err) {
        console.error('Error fetching event:', err)
        setError('Error al cargar el evento')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchEvent()
    }
  }, [slug])

  return { event, loading, error }
}

// Hook para obtener eventos próximos
export const useUpcomingEvents = (limit: number = 5) => {
  const { events, loading, error } = useEvents({ published: true, limit })
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.event_date)
    const now = new Date()
    return eventDate >= now
  }).slice(0, limit)

  return { events: upcomingEvents, loading, error }
}

// Hook para obtener eventos por tipo
export const useEventsByType = (type: string) => {
  const { events, loading, error } = useEvents({ published: true, type })
  
  return { events, loading, error }
}