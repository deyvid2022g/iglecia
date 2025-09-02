
import { useState, useEffect } from 'react';
import { getEventBySlug } from '../lib/firestore';
import type { Event } from '../lib/supabase';

export const useEvent = (slug: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fetchedEvent = await getEventBySlug(slug);
        if (fetchedEvent) {
          setEvent(fetchedEvent);
        } else {
          setError('Evento no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el evento');
        console.error(`Error fetching event with slug ${slug}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  return { event, loading, error };
};
