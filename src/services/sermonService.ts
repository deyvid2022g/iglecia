import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

// Types for sermon entities
export type SermonCategory = Database['public']['Tables']['sermon_categories']['Row'];
export type Sermon = Database['public']['Tables']['sermons']['Row'];
export type SermonInteraction = Database['public']['Tables']['sermon_interactions']['Row'];

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
    const { error } = await supabase
      .from('sermon_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to changes
  subscribe(callback: (payload: any) => void) {
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
  // Get all sermons with optional filtering
  async getAll(options?: {
    published?: boolean;
    featured?: boolean;
    categoryId?: string;
    preacher?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'preached_at' | 'view_count' | 'like_count' | 'title';
    orderDirection?: 'asc' | 'desc';
  }) {
    let query = supabase
      .from('sermons')
      .select(`
        *,
        sermon_categories (
          id,
          name,
          slug,
          color
        )
      `);
    
    if (options?.published !== undefined) {
      query = query.eq('is_published', options.published);
    }
    
    if (options?.featured !== undefined) {
      query = query.eq('is_featured', options.featured);
    }
    
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    
    if (options?.preacher) {
      query = query.ilike('preacher', `%${options.preacher}%`);
    }
    
    const orderBy = options?.orderBy || 'preached_at';
    const orderDirection = options?.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get recent sermons
  async getRecent(limit?: number) {
    return await this.getAll({
      published: true,
      limit,
      orderBy: 'preached_at',
      orderDirection: 'desc'
    });
  },

  // Get featured sermons
  async getFeatured(limit?: number) {
    return await this.getAll({
      published: true,
      featured: true,
      limit,
      orderBy: 'preached_at',
      orderDirection: 'desc'
    });
  },

  // Get sermons by preacher
  async getByPreacher(preacher: string, limit?: number) {
    return await this.getAll({
      published: true,
      preacher,
      limit,
      orderBy: 'preached_at',
      orderDirection: 'desc'
    });
  },

  // Get sermon by ID
  async getById(id: string) {
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
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get sermon by slug
  async getBySlug(slug: string) {
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
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Search sermons
  async search(query: string, options?: { limit?: number }) {
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
      .or(`title.ilike.%${query}%, description.ilike.%${query}%, preacher.ilike.%${query}%, scripture_reference.ilike.%${query}%`)
      .eq('is_published', true)
      .order('preached_at', { ascending: false })
      .limit(options?.limit || 20);
    
    if (error) throw error;
    return data;
  },

  // Create new sermon
  async create(sermon: SermonInsert) {
    const { data, error } = await supabase
      .from('sermons')
      .insert(sermon)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update sermon
  async update(id: string, updates: SermonUpdate) {
    const { data, error } = await supabase
      .from('sermons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete sermon
  async delete(id: string) {
    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Increment view count
  async incrementViewCount(id: string) {
    const { data, error } = await supabase
      .rpc('increment_sermon_views', { sermon_id: id });
    
    if (error) throw error;
    return data;
  },

  // Subscribe to changes
  subscribe(callback: (payload: any) => void) {
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
  subscribe(sermonId: string, callback: (payload: any) => void) {
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

// Combined sermon service
export const sermonService = {
  categories: sermonCategoriesService,
  sermons: sermonsService,
  interactions: sermonInteractionsService
};

export default sermonService;