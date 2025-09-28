import { supabase, setSessionToken } from '../lib/supabase';
import type { Database } from '../types/database';

// Helper function to ensure authentication headers are set
const ensureAuthHeaders = () => {
  const session = localStorage.getItem('auth_session');
  if (session) {
    try {
      const sessionData = JSON.parse(session);
      if (sessionData.access_token) {
        setSessionToken(sessionData.access_token);
      }
    } catch (error) {
      console.error('Error parsing session:', error);
    }
  }
};

export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export type EventCategory = Database['public']['Tables']['event_categories']['Row'];
export type EventCategoryInsert = Database['public']['Tables']['event_categories']['Insert'];
export type EventCategoryUpdate = Database['public']['Tables']['event_categories']['Update'];

interface EventFilters {
  featured?: boolean;
  published?: boolean;
  limit?: number;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  offset?: number;
}

export const eventService = {
  events: {
    async getAll(filters: EventFilters = {}): Promise<{ data: Event[] | null; error: Error | null }> {
      try {
        let query = supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true });

        if (filters.featured) {
          query = query.eq('is_featured', true);
        }

        if (filters.published !== undefined) {
          query = query.eq('is_published', filters.published);
        }

        if (filters.type) {
          query = query.eq('type', filters.type);
        }

        if (filters.dateFrom) {
          query = query.gte('event_date', filters.dateFrom);
        }

        if (filters.dateTo) {
          query = query.lte('event_date', filters.dateTo);
        }

        if (filters.limit) {
          query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) {
          return { data: null, error: new Error(`Error fetching events: ${error.message}`) };
        }

        return { data: data || [], error: null };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    },

    async getById(id: string): Promise<{ data: Event | null; error: Error | null }> {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { data: null, error: null }; // Event not found
          }
          return { data: null, error: new Error(`Error fetching event: ${error.message}`) };
        }

        return { data, error: null };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    },

    async getBySlug(slug: string): Promise<{ data: Event | null; error: Error | null }> {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return { data: null, error: null }; // Event not found
          }
          return { data: null, error: new Error(`Error fetching event: ${error.message}`) };
        }

        return { data, error: null };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    },

    async create(eventData: EventInsert): Promise<{ data: Event | null; error: Error | null }> {
      try {
        ensureAuthHeaders();
        const { data, error } = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single();

        if (error) {
          return { data: null, error: new Error(`Error creating event: ${error.message}`) };
        }

        return { data, error: null };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    },

    async update(id: string, eventData: EventUpdate): Promise<{ data: Event | null; error: Error | null }> {
      try {
        ensureAuthHeaders();
        const { data, error } = await supabase
          .from('events')
          .update({
            ...eventData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          return { data: null, error: new Error(`Error updating event: ${error.message}`) };
        }

        return { data, error: null };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    },

    async delete(id: string): Promise<{ error: Error | null }> {
      try {
        ensureAuthHeaders();
        const { error } = await supabase
          .from('events')
          .update({ is_active: false })
          .eq('id', id);

        if (error) {
          return { error: new Error(`Error deleting event: ${error.message}`) };
        }

        return { error: null };
      } catch (err) {
        return { error: err as Error };
      }
    },

    async search(searchParams: { query: string; category?: string; limit?: number }): Promise<{ data: Event[] | null; error: Error | null }> {
      try {
        const { query, category, limit } = searchParams;
        
        let supabaseQuery = supabase
          .from('events')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,location_name.ilike.%${query}%`)
          .order('event_date', { ascending: true });

        if (category) {
          supabaseQuery = supabaseQuery.eq('category_id', category);
        }

        if (limit) {
          supabaseQuery = supabaseQuery.limit(limit);
        }

        const { data, error } = await supabaseQuery;

        if (error) {
          return { data: null, error: new Error(`Error searching events: ${error.message}`) };
        }

        return { data: data || [], error: null };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    }
  },

  registrations: {
    async create(registrationData: {
      event_id: string;
      user_id: string | null;
      name: string;
      email: string;
      phone?: string;
      guests?: number;
      special_requests?: string;
      status: string;
    }): Promise<{ error: Error | null }> {
      try {
        const { error } = await supabase
          .from('event_registrations')
          .insert(registrationData);

        if (error) {
          return { error: new Error(`Error creating registration: ${error.message}`) };
        }

        return { error: null };
      } catch (err) {
        return { error: err as Error };
      }
    },

    async getByEventId(eventId: string): Promise<{ data: { id: string; name: string; email: string; status: string }[] | null; error: Error | null }> {
      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('id, name, email, status')
          .eq('event_id', eventId);

        if (error) {
          return { data: null, error: new Error(`Error fetching registrations: ${error.message}`) };
        }

        return { data: data || [], error: null };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    }
  },

  // Métodos de compatibilidad con la estructura anterior
  async getEvents(filters: EventFilters = {}): Promise<Event[]> {
    return this.events.getAll(filters);
  },

  async getEventById(id: string): Promise<Event | null> {
    const { data } = await this.events.getById(id);
    return data;
  },

  async getEventBySlug(slug: string): Promise<Event | null> {
    const { data } = await this.events.getBySlug(slug);
    return data;
  },

  async createEvent(eventData: EventInsert): Promise<Event> {
    const { data, error } = await this.events.create(eventData);
    if (error) throw error;
    return data!;
  },

  async updateEvent(id: string, eventData: EventUpdate): Promise<Event> {
    const { data, error } = await this.events.update(id, eventData);
    if (error) throw error;
    return data!;
  },

  async deleteEvent(id: string): Promise<void> {
    const { error } = await this.events.delete(id);
    if (error) throw error;
  },

  async getUpcomingEvents(limit: number = 5): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Error fetching upcoming events: ${error.message}`);
    }

    return data || [];
  },

  async getFeaturedEvents(limit: number = 3): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_featured', true)
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Error fetching featured events: ${error.message}`);
    }

    return data || [];
  },

  categories: {
    async getAll(): Promise<EventCategory[]> {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Error fetching event categories: ${error.message}`);
      }

      return data || [];
    },

    async getById(id: string): Promise<EventCategory | null> {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Error fetching event category: ${error.message}`);
      }

      return data;
    },

    async getBySlug(slug: string): Promise<EventCategory | null> {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(`Error fetching event category: ${error.message}`);
      }

      return data;
    },

    async create(category: EventCategoryInsert): Promise<EventCategory> {
      const { data, error } = await supabase
        .from('event_categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating event category: ${error.message}`);
      }

      return data;
    },

    async update(id: string, updates: EventCategoryUpdate): Promise<EventCategory> {
      const { data, error } = await supabase
        .from('event_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating event category: ${error.message}`);
      }

      return data;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('event_categories')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting event category: ${error.message}`);
      }
    },

    async getWithEventCount(): Promise<(EventCategory & { event_count: number })[]> {
      const { data, error } = await supabase
        .from('event_categories')
        .select(`
          *,
          events(count)
        `)
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Error fetching event categories with count: ${error.message}`);
      }

      return data?.map(category => ({
        ...category,
        event_count: category.events?.[0]?.count || 0
      })) || [];
    },

    async getActive(): Promise<EventCategory[]> {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(`Error fetching active event categories: ${error.message}`);
      }

      return data || [];
    }
  }
};