import { useState, useEffect } from 'react';
import { getEventBySlug } from '../lib/firestore';
import type { EventWithLocation } from '../lib/supabase';

export const useEvent = (slug: string) => {
  const [event, setEvent] = useState<EventWithLocation | null>(null);
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
        setEvent(fetchedEvent);
      } catch (err) {
        setError('Error al cargar el evento');
        console.error('Error in fetchEvent:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slug]);

  return { event, loading, error };
};
