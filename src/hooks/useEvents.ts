
import { useState, useEffect, useCallback } from 'react';
import { getEvents } from '../lib/firestore';
import type { Event } from '../lib/supabase';

export interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
}

export const useEvents = (options?: {
  published?: boolean;
  limit?: number;
  type?: string;
}): EventsState => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await getEvents(options);
      setEvents(fetchedEvents);
    } catch (err) {
      setError('Error al cargar eventos');
      console.error('Error in fetchEvents:', err);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error };
};

// Hook para eventos próximos
export const useUpcomingEvents = (limit: number = 5) => {
  return useEvents({ published: true, limit });
};

// Hook para eventos por tipo
export const useEventsByType = (type: string) => {
  return useEvents({ published: true, type });
};
