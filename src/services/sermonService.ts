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

// Types for sermon entities
export type SermonCategory = Database['public']['Tables']['sermon_categories']['Row'];
export type Sermon = Database['public']['Tables']['sermons']['Row'];
export type SermonInteraction = Database['public']['Tables']['sermon_interactions']['Row'];
export type SermonSeries = Database['public']['Tables']['sermon_series']['Row'];
export type SermonResource = Database['public']['Tables']['sermon_resources']['Row'];

// Extended types with relations
export type SermonWithRelations = Sermon & {
  sermon_categories?: SermonCategory | null;
  sermon_series?: SermonSeries | null;
};

export type SermonCategoryInsert = Database['public']['Tables']['sermon_categories']['Insert'];
export type SermonInsert = Database['public']['Tables']['sermons']['Insert'];
export type SermonInteractionInsert = Database['public']['Tables']['sermon_interactions']['Insert'];

export type SermonCategoryUpdate = Database['public']['Tables']['sermon_categories']['Update'];
export type SermonUpdate = Database['public']['Tables']['sermons']['Update'];

// Sermon Categories Service
export const sermonCategoriesService = {
  // Get all categories
  async getAll(options?: { active?: boolean; orderBy?: 'display_order' | 'name' | 'created_at' }) {
    let query = supabase.from('sermon_categories').select('*');
    
    if (options?.active !== undefined) {
      query = query.eq('is_active', options.active);
    }
    
    if (options?.orderBy) {
      query = query.order(options.orderBy);
    } else {
      query = query.order('display_order');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get category by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('sermon_categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get category by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('sermon_categories')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new category
  async create(category: SermonCategoryInsert) {
    ensureAuthHeaders();
    const { data, error } = await supabase
      .from('sermon_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update category
  async update(id: string, updates: SermonCategoryUpdate) {
    ensureAuthHeaders();
    const { data, error } = await supabase
      .from('sermon_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete category
  async delete(id: string) {
    ensureAuthHeaders();
    const { error } = await supabase
      .from('sermon_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to changes
  subscribe(callback: (payload: { eventType: string; new: SermonCategory; old: SermonCategory }) => void) {
    return supabase
      .channel('sermon_categories_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sermon_categories' },
        callback
      )
      .subscribe();
  }
};

// Sermons Service
export const sermonsService = {
  // Get all sermons with pagination
  async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit
    
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get sermon by slug with all related data
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    
    if (error) throw error
    return data
  },

  // Get sermon by ID with all related data
  async getById(id: string) {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Get sermons by category
  async getByCategory(categoryId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get sermons by series
  async getBySeries(seriesId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get sermons by speaker
  async getBySpeaker(speaker: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('speaker', speaker)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get featured sermons
  async getFeatured(limit = 5) {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('is_featured', true)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Search sermons
  async search(query: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,speaker.ilike.%${query}%,scripture_references.cs.{${query}}`)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Get sermons with filters
  async getWithFilters(filters: {
    categoryId?: string
    seriesId?: string
    speaker?: string
    hasTranscript?: boolean
    hasVideo?: boolean
    hasAudio?: boolean
    tags?: string[]
    dateFrom?: string
    dateTo?: string
  }, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    
    let query = supabase
      .from('sermons')
      .select('*')
      .eq('is_published', true)

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.seriesId) {
      query = query.eq('series_id', filters.seriesId)
    }

    if (filters.speaker) {
      query = query.eq('speaker', filters.speaker)
    }

    if (filters.hasTranscript) {
      query = query.eq('has_transcript', true)
    }

    if (filters.hasVideo) {
      query = query.not('video_url', 'is', null)
    }

    if (filters.hasAudio) {
      query = query.not('audio_url', 'is', null)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters.dateFrom) {
      query = query.gte('sermon_date', filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte('sermon_date', filters.dateTo)
    }

    const { data, error } = await query
      .order('sermon_date', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  },

  // Create a new sermon
  async create(sermon: Database['public']['Tables']['sermons']['Insert']) {
    ensureAuthHeaders();
    const { data, error } = await supabase
      .from('sermons')
      .insert(sermon)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update a sermon
  async update(id: string, updates: Database['public']['Tables']['sermons']['Update']) {
    ensureAuthHeaders();
    const { data, error } = await supabase
      .from('sermons')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a sermon
  async delete(id: string) {
    ensureAuthHeaders();
    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Increment view count
  async incrementViews(id: string) {
    // First get the current sermon data
    const { data: currentSermon, error: fetchError } = await supabase
      .from('sermons')
      .select('view_count')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Then update with incremented value
    const { data, error } = await supabase
      .from('sermons')
      .update({ 
        view_count: (currentSermon.view_count || 0) + 1
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Increment like count
  async incrementLikes(id: string) {
    // First get the current sermon data
    const { data: currentSermon, error: fetchError } = await supabase
      .from('sermons')
      .select('like_count')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Then update with incremented value
    const { data, error } = await supabase
      .from('sermons')
      .update({ 
        like_count: (currentSermon.like_count || 0) + 1
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Increment comment count
  async incrementComments(id: string) {
    // First get the current sermon data
    const { data: currentSermon, error: fetchError } = await supabase
      .from('sermons')
      .select('comment_count')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Then update with incremented value
    const { data, error } = await supabase
      .from('sermons')
      .update({ 
        comment_count: (currentSermon.comment_count || 0) + 1
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get unique speakers
  async getSpeakers() {
    const { data, error } = await supabase
      .from('sermons')
      .select('speaker, speaker_bio, speaker_image_url')
      .eq('is_published', true)
      .not('speaker', 'is', null)
    
    if (error) throw error
    
    // Remove duplicates and return unique speakers
    const uniqueSpeakers = data?.reduce((acc: any[], current) => {
      const exists = acc.find(item => item.speaker === current.speaker)
      if (!exists) {
        acc.push(current)
      }
      return acc
    }, [])
    
    return uniqueSpeakers
  },

  // Get sermon statistics
  async getStats() {
    const { data, error } = await supabase
      .from('sermons')
      .select('view_count, like_count, comment_count')
      .eq('is_published', true)
    
    if (error) throw error
    
    const stats = data?.reduce((acc, sermon) => ({
      totalViews: acc.totalViews + (sermon.view_count || 0),
      totalLikes: acc.totalLikes + (sermon.like_count || 0),
      totalComments: acc.totalComments + (sermon.comment_count || 0),
      totalSermons: acc.totalSermons + 1
    }), {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalSermons: 0
    })
    
    return stats
  },

  // Subscribe to changes
  subscribe(callback: (payload: { eventType: string; new: Sermon; old: Sermon }) => void) {
    return supabase
      .channel('sermons_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sermons' },
        callback
      )
      .subscribe();
  }
};

// Sermon Interactions Service
export const sermonInteractionsService = {
  // Get interactions for a sermon
  async getBySermonId(sermonId: string, type?: string) {
    let query = supabase
      .from('sermon_interactions')
      .select('*')
      .eq('sermon_id', sermonId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get user interaction for a sermon
  async getUserInteraction(sermonId: string, userId: string, type: string) {
    const { data, error } = await supabase
      .from('sermon_interactions')
      .select('*')
      .eq('sermon_id', sermonId)
      .eq('user_id', userId)
      .eq('type', type)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create interaction
  async create(interaction: SermonInteractionInsert) {
    const { data, error } = await supabase
      .from('sermon_interactions')
      .insert(interaction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete interaction
  async delete(id: string) {
    const { error } = await supabase
      .from('sermon_interactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle like
  async toggleLike(sermonId: string, userId: string) {
    const existing = await this.getUserInteraction(sermonId, userId, 'like');
    
    if (existing) {
      await this.delete(existing.id);
      return { liked: false };
    } else {
      await this.create({
        sermon_id: sermonId,
        user_id: userId,
        type: 'like'
      });
      return { liked: true };
    }
  },

  // Toggle favorite
  async toggleFavorite(sermonId: string, userId: string) {
    const existing = await this.getUserInteraction(sermonId, userId, 'favorite');
    
    if (existing) {
      await this.delete(existing.id);
      return { favorited: false };
    } else {
      await this.create({
        sermon_id: sermonId,
        user_id: userId,
        type: 'favorite'
      });
      return { favorited: true };
    }
  },

  // Add comment
  async addComment(sermonId: string, userId: string, content: string) {
    return await this.create({
      sermon_id: sermonId,
      user_id: userId,
      type: 'comment',
      content
    });
  },

  // Get comments for a sermon
  async getComments(sermonId: string) {
    return await this.getBySermonId(sermonId, 'comment');
  },

  // Get user favorites
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('sermon_interactions')
      .select(`
        *,
        sermons (
          *,
          sermon_categories (
            id,
            name,
            slug,
            color
          )
        )
      `)
      .eq('user_id', userId)
      .eq('type', 'favorite')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Subscribe to changes
  subscribe(sermonId: string, callback: (payload: { eventType: string; new: SermonInteraction; old: SermonInteraction }) => void) {
    return supabase
      .channel(`sermon_interactions_${sermonId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'sermon_interactions',
          filter: `sermon_id=eq.${sermonId}`
        },
        callback
      )
      .subscribe();
  }
};

// Sermon Series Service
export const sermonSeriesService = {
  // Get all series
  async getAll() {
    const { data, error } = await supabase
      .from('sermon_series')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get active series
  async getActive() {
    const { data, error } = await supabase
      .from('sermon_series')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get series by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('sermon_series')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get series by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('sermon_series')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create a new series
  async create(series: Database['public']['Tables']['sermon_series']['Insert']) {
    const { data, error } = await supabase
      .from('sermon_series')
      .insert(series)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a series
  async update(id: string, updates: Database['public']['Tables']['sermon_series']['Update']) {
    const { data, error } = await supabase
      .from('sermon_series')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a series
  async delete(id: string) {
    const { error } = await supabase
      .from('sermon_series')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get sermons in a series
  async getSermons(seriesId: string) {
    const { data, error } = await supabase
      .from('sermons')
      .select(`
        *,
        sermon_categories (
          id,
          name,
          slug,
          color
        )
      `)
      .eq('series_id', seriesId)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

// Sermon Resources Service
export const sermonResourcesService = {
  // Get all resources for a sermon
  async getBySermonId(sermonId: string) {
    const { data, error } = await supabase
      .from('sermon_resources')
      .select('*')
      .eq('sermon_id', sermonId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get resource by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('sermon_resources')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create a new resource
  async create(resource: Database['public']['Tables']['sermon_resources']['Insert']) {
    const { data, error } = await supabase
      .from('sermon_resources')
      .insert(resource)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update a resource
  async update(id: string, updates: Database['public']['Tables']['sermon_resources']['Update']) {
    const { data, error } = await supabase
      .from('sermon_resources')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete a resource
  async delete(id: string) {
    const { error } = await supabase
      .from('sermon_resources')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Increment download count
  async incrementDownload(id: string) {
    // First get the current resource data
    const { data: currentResource, error: fetchError } = await supabase
      .from('sermon_resources')
      .select('download_count')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    // Then update with incremented value
    const { data, error } = await supabase
      .from('sermon_resources')
      .update({ 
        download_count: (currentResource.download_count || 0) + 1
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get resources by type
  async getByType(sermonId: string, resourceType: string) {
    const { data, error } = await supabase
      .from('sermon_resources')
      .select('*')
      .eq('sermon_id', sermonId)
      .eq('resource_type', resourceType)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// Combined sermon service
export const sermonService = {
  categories: sermonCategoriesService,
  sermons: sermonsService,
  interactions: sermonInteractionsService
};

export default sermonService;