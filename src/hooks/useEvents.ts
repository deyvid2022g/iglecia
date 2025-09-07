import { useState, useEffect, useCallback } from 'react'
import { type Event } from '../lib/supabase'
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

      // Simular delay de carga
      await new Promise(resolve => setTimeout(resolve, 500))

      // Intentar cargar desde localStorage primero
      const localEvents = localStorage.getItem('church_events')
      let allEvents: Event[]
      
      if (localEvents) {
        allEvents = JSON.parse(localEvents)
      } else {
        // Usar datos de ejemplo por defecto
        allEvents = getDefaultEvents()
        localStorage.setItem('church_events', JSON.stringify(allEvents))
      }
      
      // Aplicar filtros localmente
      let filteredEvents = allEvents
      if (options?.published !== undefined) {
        filteredEvents = filteredEvents.filter((event: Event) => event.is_published === options.published)
      }
      if (options?.type) {
        filteredEvents = filteredEvents.filter((event: Event) => event.type === options.type)
      }
      if (options?.limit) {
        filteredEvents = filteredEvents.slice(0, options.limit)
      }
      
      setEvents(filteredEvents)
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
      // Simular delay de creación
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Crear nuevo evento con datos simulados
      const newEvent: Event = {
        ...eventData,
        id: Date.now().toString(),
        created_by: user?.id || null,
        current_registrations: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Actualizar estado local
      setEvents(prev => [...prev, newEvent])
      
      // Actualizar localStorage
      const localEvents = localStorage.getItem('church_events')
      const allEvents = localEvents ? JSON.parse(localEvents) : []
      allEvents.push(newEvent)
      localStorage.setItem('church_events', JSON.stringify(allEvents))
      
      return { data: newEvent, error: null }
    } catch (error) {
      console.error('Error creating event:', error)
      return { data: null, error: error as Error }
    }
  }

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      // Simular delay de actualización
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Buscar evento en localStorage
      const localEvents = localStorage.getItem('church_events')
      const allEvents = localEvents ? JSON.parse(localEvents) : []
      const eventIndex = allEvents.findIndex((event: Event) => event.id === id)
      
      if (eventIndex === -1) {
        return { data: null, error: new Error('Evento no encontrado') }
      }
      
      // Actualizar evento
      const updatedEvent = {
        ...allEvents[eventIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      allEvents[eventIndex] = updatedEvent
      localStorage.setItem('church_events', JSON.stringify(allEvents))
      
      // Actualizar estado local
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event))
      
      return { data: updatedEvent, error: null }
    } catch (error) {
      console.error('Error updating event:', error)
      return { data: null, error: error as Error }
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      // Simular delay de eliminación
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Eliminar de localStorage
      const localEvents = localStorage.getItem('church_events')
      const allEvents = localEvents ? JSON.parse(localEvents) : []
      const filteredEvents = allEvents.filter((event: Event) => event.id !== id)
      localStorage.setItem('church_events', JSON.stringify(filteredEvents))
      
      // Actualizar estado local
      setEvents(prev => prev.filter(event => event.id !== id))
      
      return { error: null }
    } catch (error) {
      console.error('Error deleting event:', error)
      return { error: error as Error }
    }
  }

  const getEventBySlug = async (slug: string) => {
    try {
      // Simular delay de búsqueda
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Buscar en localStorage
      const localEvents = localStorage.getItem('church_events')
      const allEvents = localEvents ? JSON.parse(localEvents) : getDefaultEvents()
      const event = allEvents.find((event: Event) => event.slug === slug)
      
      if (!event) {
        return { data: null, error: new Error('Evento no encontrado') }
      }
      
      return { data: event, error: null }
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
      // Simular delay de registro
      await new Promise(resolve => setTimeout(resolve, 400))
      
      // Crear registro simulado
      const registration = {
        id: Date.now().toString(),
        event_id: eventId,
        user_id: user?.id || null,
        ...registrationData,
        guests: registrationData.guests || 1,
        status: 'confirmed',
        registration_date: new Date().toISOString()
      }
      
      // Guardar registro en localStorage
      const localRegistrations = localStorage.getItem('event_registrations')
      const allRegistrations = localRegistrations ? JSON.parse(localRegistrations) : []
      allRegistrations.push(registration)
      localStorage.setItem('event_registrations', JSON.stringify(allRegistrations))
      
      // Actualizar contador de registros del evento
      const localEvents = localStorage.getItem('church_events')
      const allEvents = localEvents ? JSON.parse(localEvents) : []
      const eventIndex = allEvents.findIndex((event: Event) => event.id === eventId)
      
      if (eventIndex !== -1) {
        allEvents[eventIndex].current_registrations += registration.guests
        localStorage.setItem('church_events', JSON.stringify(allEvents))
        
        // Actualizar estado local
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, current_registrations: event.current_registrations + registration.guests }
            : event
        ))
      }
      
      return { error: null }
    } catch (error) {
      console.error('Error registering for event:', error)
      return { error: error as Error }
    }
  }

  const getEventRegistrations = async (eventId: string) => {
    try {
      // Simular delay de búsqueda
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Buscar registros en localStorage
      const localRegistrations = localStorage.getItem('event_registrations')
      const allRegistrations = localRegistrations ? JSON.parse(localRegistrations) : []
      
      // Filtrar registros por evento y estado
      const eventRegistrations = allRegistrations
        .filter((reg: any) => reg.event_id === eventId && reg.status === 'confirmed')
        .map((reg: any) => ({
          id: reg.id,
          name: reg.name,
          email: reg.email,
          status: reg.status,
          registration_date: reg.registration_date,
          guests: reg.guests,
          phone: reg.phone,
          special_requests: reg.special_requests
        }))
        .sort((a: any, b: any) => new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime())
      
      return { data: eventRegistrations, error: null }
    } catch (error) {
      console.error('Error getting event registrations:', error)
      return { data: null, error: error as Error }
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

        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 300))

        // Buscar en localStorage
        const localEvents = localStorage.getItem('church_events')
        let allEvents: Event[]
        
        if (localEvents) {
          allEvents = JSON.parse(localEvents)
        } else {
          // Usar datos de ejemplo por defecto
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
              }
            ]
          }
          allEvents = getDefaultEvents()
          localStorage.setItem('church_events', JSON.stringify(allEvents))
        }
        
        const foundEvent = allEvents.find(e => e.slug === slug)
        
        if (!foundEvent) {
          setError('Evento no encontrado')
        } else {
          setEvent(foundEvent)
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