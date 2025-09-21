import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

// Types for blog entities
export type BlogCategory = Database['public']['Tables']['blog_categories']['Row'];
export type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
export type BlogInteraction = Database['public']['Tables']['blog_interactions']['Row'];

export type BlogCategoryInsert = Database['public']['Tables']['blog_categories']['Insert'];
export type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
export type BlogInteractionInsert = Database['public']['Tables']['blog_interactions']['Insert'];

export type BlogCategoryUpdate = Database['public']['Tables']['blog_categories']['Update'];
export type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

// Blog Categories Service
export const blogCategoriesService = {
  // Get all categories
  async getAll(options?: { active?: boolean; orderBy?: 'display_order' | 'name' | 'created_at' }) {
    let query = supabase.from('blog_categories').select('*, post_count');
    
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
      .from('blog_categories')
      .select('*, post_count')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get category by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*, post_count')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new category
  async create(category: BlogCategoryInsert) {
    const { data, error } = await supabase
      .from('blog_categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update category
  async update(id: string, updates: BlogCategoryUpdate) {
    const { data, error } = await supabase
      .from('blog_categories')
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
      .from('blog_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Subscribe to changes
  subscribe(callback: (payload: any) => void) {
    return supabase
      .channel('blog_categories_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blog_categories' },
        callback
      )
      .subscribe();
  }
};

// Blog Posts Service
export const blogPostsService = {
  // Get all posts with optional filtering
  async getAll(options?: {
    published?: boolean;
    featured?: boolean;
    categoryId?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'published_at' | 'view_count' | 'like_count';
    orderDirection?: 'asc' | 'desc';
  }) {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
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
    
    const orderBy = options?.orderBy || 'published_at';
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

  // Get post by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
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

  // Get post by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
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

  // Search posts
  async search(query: string, options?: { limit?: number }) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories (
          id,
          name,
          slug,
          color
        )
      `)
      .or(`title.ilike.%${query}%, excerpt.ilike.%${query}%, content.ilike.%${query}%`)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(options?.limit || 20);
    
    if (error) throw error;
    return data;
  },

  // Create new post
  async create(post: BlogPostInsert) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update post
  async update(id: string, updates: BlogPostUpdate) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete post
  async delete(id: string) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Increment view count
  async incrementViewCount(id: string) {
    const { data, error } = await supabase
      .rpc('increment_blog_post_views', { post_id: id });
    
    if (error) throw error;
    return data;
  },

  // Subscribe to changes
  subscribe(callback: (payload: any) => void) {
    return supabase
      .channel('blog_posts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'blog_posts' },
        callback
      )
      .subscribe();
  }
};

// Blog Interactions Service
export const blogInteractionsService = {
  // Get interactions for a post
  async getByPostId(postId: string, type?: string) {
    let query = supabase
      .from('blog_interactions')
      .select('*')
      .eq('post_id', postId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get user interaction for a post
  async getUserInteraction(postId: string, userId: string, type: string) {
    const { data, error } = await supabase
      .from('blog_interactions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('type', type)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create interaction
  async create(interaction: BlogInteractionInsert) {
    const { data, error } = await supabase
      .from('blog_interactions')
      .insert(interaction)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete interaction
  async delete(id: string) {
    const { error } = await supabase
      .from('blog_interactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Toggle like
  async toggleLike(postId: string, userId: string) {
    const existing = await this.getUserInteraction(postId, userId, 'like');
    
    if (existing) {
      await this.delete(existing.id);
      return { liked: false };
    } else {
      await this.create({
        post_id: postId,
        user_id: userId,
        type: 'like'
      });
      return { liked: true };
    }
  },

  // Add comment
  async addComment(postId: string, userId: string, content: string) {
    return await this.create({
      post_id: postId,
      user_id: userId,
      type: 'comment',
      content
    });
  },

  // Get comments for a post
  async getComments(postId: string) {
    return await this.getByPostId(postId, 'comment');
  },

  // Subscribe to changes
  subscribe(postId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`blog_interactions_${postId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'blog_interactions',
          filter: `post_id=eq.${postId}`
        },
        callback
      )
      .subscribe();
  }
};

// Combined blog service
export const blogService = {
  categories: blogCategoriesService,
  posts: blogPostsService,
  interactions: blogInteractionsService
};

// Direct exports for easier access (used by useBlog.ts)
export const getPosts = blogPostsService.getAll;
export const createPost = blogPostsService.create;
export const updatePost = blogPostsService.update;
export const deletePost = blogPostsService.delete;
export const getPostBySlug = blogPostsService.getBySlug;
export const incrementViewCount = blogPostsService.incrementViewCount;
export const toggleLike = blogInteractionsService.toggleLike;

export default blogService;