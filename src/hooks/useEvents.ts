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

  // Datos de ejemplo para cuando Supabase no esté configurado
  const getDefaultEvents = (): Event[] => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    return [
      {
        id: '1',
        slug: 'culto-dominical',
        title: 'Culto Dominical',
        description: 'Únete a nosotros para un tiempo de adoración y enseñanza bíblica.',
        detailed_description: 'Nuestro culto dominical incluye tiempo de adoración, oración y una enseñanza bíblica inspiradora.',
        event_date: today.toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '12:00',
        type: 'Culto',
        capacity: 200,
        current_registrations: 0,
        image_url: '/pastor-reynel-duenas.jpg',
        host: 'Pastor Reynel Dueñas',
        requires_rsvp: false,
        cost: 'Gratuito',
        is_published: true,
        created_at: today.toISOString(),
        updated_at: today.toISOString()
      },
      {
        id: '2',
        slug: 'estudio-biblico',
        title: 'Estudio Bíblico Semanal',
        description: 'Profundiza en la Palabra de Dios con nuestro estudio bíblico.',
        detailed_description: 'Un tiempo para estudiar las Escrituras en profundidad y crecer en conocimiento.',
        event_date: nextWeek.toISOString().split('T')[0],
        start_time: '19:00',
        end_time: '20:30',
        type: 'Estudio',
        capacity: 50,
        current_registrations: 0,
        requires_rsvp: true,
        cost: 'Gratuito',
        is_published: true,
        created_at: today.toISOString(),
        updated_at: today.toISOString()
      },
      {
        id: '3',
        slug: 'conferencia-familiar',
        title: 'Conferencia Familiar',
        description: 'Una conferencia especial enfocada en fortalecer los lazos familiares.',
        detailed_description: 'Talleres y charlas para fortalecer la unidad familiar desde una perspectiva bíblica.',
        event_date: nextMonth.toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        type: 'Conferencia',
        capacity: 150,
        current_registrations: 0,
        requires_rsvp: true,
        cost: 'Gratuito',
        is_published: true,
        created_at: today.toISOString(),
        updated_at: today.toISOString()
      }
    ]
  }

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Intentar cargar desde localStorage primero
      const localEvents = localStorage.getItem('church_events')
      if (localEvents) {
        let parsedEvents = JSON.parse(localEvents)
        
        // Aplicar filtros localmente
        if (options?.published !== undefined) {
          parsedEvents = parsedEvents.filter((event: Event) => event.is_published === options.published)
        }
        if (options?.type) {
          parsedEvents = parsedEvents.filter((event: Event) => event.type === options.type)
        }
        if (options?.limit) {
          parsedEvents = parsedEvents.slice(0, options.limit)
        }
        
        setEvents(parsedEvents)
        setLoading(false)
        return
      }

      // Si no hay datos locales, intentar Supabase
      try {
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

        if (error) throw error
        
        setEvents(data || [])
        // Guardar en localStorage para uso futuro
        if (data) {
          localStorage.setItem('church_events', JSON.stringify(data))
        }
      } catch (supabaseError) {
        console.warn('Supabase no disponible, usando datos de ejemplo:', supabaseError)
        // Usar datos de ejemplo si Supabase falla
        const defaultEvents = getDefaultEvents()
        let filteredEvents = defaultEvents
        
        // Aplicar filtros a los datos de ejemplo
        if (options?.published !== undefined) {
          filteredEvents = filteredEvents.filter(event => event.is_published === options.published)
        }
        if (options?.type) {
          filteredEvents = filteredEvents.filter(event => event.type === options.type)
        }
        if (options?.limit) {
          filteredEvents = filteredEvents.slice(0, options.limit)
        }
        
        setEvents(filteredEvents)
        // Guardar datos de ejemplo en localStorage
        localStorage.setItem('church_events', JSON.stringify(defaultEvents))
      }
    } catch (error) {
      setError('Error al cargar eventos')
      console.error('Error in fetchEvents:', error)
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