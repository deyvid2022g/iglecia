import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

// Define Event type for Firebase
export interface Event {
  id: string
  slug: string
  title: string
  description: string
  detailed_description?: string
  event_date: string
  start_time: string
  end_time?: string
  type: string
  capacity?: number
  current_registrations: number
  image_url?: string
  host?: string
  requires_rsvp: boolean
  cost?: string
  is_published: boolean
  created_at: string
  updated_at: string
}

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

  // Datos de ejemplo para cuando Firebase no esté configurado
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

      const eventsRef = collection(db, 'events')
      let firestoreQuery = query(eventsRef, orderBy('event_date', 'asc'))

      // Aplicar filtros
      if (options?.published !== undefined) {
        firestoreQuery = query(firestoreQuery, where('is_published', '==', options.published))
      }
      if (options?.type) {
        firestoreQuery = query(firestoreQuery, where('type', '==', options.type))
      }
      if (options?.limit) {
        firestoreQuery = query(firestoreQuery, firestoreLimit(options.limit))
      }

      const querySnapshot = await getDocs(firestoreQuery)
      const eventsData: Event[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        eventsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
          event_date: data.event_date?.toDate?.()?.toISOString()?.split('T')[0] || data.event_date
        } as Event)
      })

      setEvents(eventsData)
    } catch (error) {
      console.warn('Firebase no disponible, usando datos de ejemplo:', error)
      // Usar datos de ejemplo si Firebase falla
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
      setError('Usando datos de ejemplo - Firebase no disponible')
    } finally {
      setLoading(false)
    }
  }, [options?.published, options?.limit, options?.type])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents, options?.published, options?.limit, options?.type])

  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_registrations'>) => {
    try {
      if (!user) {
        return { data: null, error: new Error('User not authenticated') }
      }

      const newEventData = {
        ...eventData,
        current_registrations: 0,
        created_by: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'events'), newEventData)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        const newEvent: Event = {
          id: docSnap.id,
          ...data,
          event_date: data.event_date?.toDate?.()?.toISOString() || data.event_date,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Event
        
        setEvents(prev => [newEvent, ...prev])
        return { data: newEvent, error: null }
      }

      return { data: null, error: new Error('Failed to create event') }
    } catch (error) {
      console.error('Error creating event:', error)
      return { data: null, error: error as Error }
    }
  }

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const eventRef = doc(db, 'events', id)
      const updateData = {
        ...updates,
        updated_at: serverTimestamp()
      }
      
      await updateDoc(eventRef, updateData)
      const docSnap = await getDoc(eventRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        const updatedEvent: Event = {
          id: docSnap.id,
          ...data,
          event_date: data.event_date?.toDate?.()?.toISOString() || data.event_date,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
        } as Event
        
        setEvents(prev => prev.map(event => 
          event.id === id ? updatedEvent : event
        ))
        
        return { data: updatedEvent, error: null }
      }

      return { data: null, error: new Error('Event not found after update') }
    } catch (error) {
      console.error('Error updating event:', error)
      return { data: null, error: error as Error }
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const eventRef = doc(db, 'events', id)
      await deleteDoc(eventRef)
      
      setEvents(prev => prev.filter(event => event.id !== id))
      return { error: null }
    } catch (error) {
      console.error('Error deleting event:', error)
      return { error: error as Error }
    }
  }

  const getEventBySlug = async (slug: string) => {
    try {
      const eventsRef = collection(db, 'events')
      const q = query(eventsRef, where('slug', '==', slug))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return { data: null, error: new Error('Event not found') }
      }
      
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      const event: Event = {
        id: doc.id,
        ...data,
        event_date: data.event_date?.toDate?.()?.toISOString()?.split('T')[0] || data.event_date,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
      } as Event

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
      // Insertar registro
      const registrationRef = collection(db, 'event_registrations')
      await addDoc(registrationRef, {
        event_id: eventId,
        user_id: user?.uid,
        ...registrationData,
        guests: registrationData.guests || 1,
        registration_date: serverTimestamp(),
        status: 'confirmed'
      })

      // Actualizar contador de registros
      const eventRef = doc(db, 'events', eventId)
      const eventSnap = await getDoc(eventRef)
      
      if (eventSnap.exists()) {
        const currentRegistrations = eventSnap.data().current_registrations || 0
        await updateDoc(eventRef, {
          current_registrations: currentRegistrations + (registrationData.guests || 1)
        })
      }

      // Refrescar eventos
      await fetchEvents()

      return { error: null }
    } catch (error) {
      console.error('Error registering for event:', error)
      return { error: error as Error }
    }
  }

  const getEventRegistrations = async (eventId: string) => {
    try {
      const registrationsRef = collection(db, 'event_registrations')
      const q = query(
        registrationsRef,
        where('event_id', '==', eventId),
        where('status', '==', 'confirmed'),
        orderBy('registration_date', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const registrations = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          status: data.status
        }
      })

      return { data: registrations, error: null }
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

        const eventsRef = collection(db, 'events')
        const q = query(eventsRef, where('slug', '==', slug))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setError('Evento no encontrado')
          return
        }
        
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        const eventData: Event = {
          id: doc.id,
          ...data,
          event_date: data.event_date?.toDate?.()?.toISOString()?.split('T')[0] || data.event_date,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
        } as Event

        setEvent(eventData)
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