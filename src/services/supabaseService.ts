import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

// Definición de tipos para las tablas
type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

type EventRow = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

type SermonRow = Database['public']['Tables']['sermons']['Row'];
type SermonInsert = Database['public']['Tables']['sermons']['Insert'];
type SermonUpdate = Database['public']['Tables']['sermons']['Update'];

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

type CommentRow = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type CommentUpdate = Database['public']['Tables']['comments']['Update'];

// Servicios para usuarios
export const userService = {
  // Obtener un usuario por ID
  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single<UserRow>();
    
    if (error) throw error;
    return data;
  },
  
  // Actualizar un usuario
  async updateUser(userId: string, userData: UserUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update<UserUpdate>(userData)
      .eq('id', userId);
    
    if (error) throw error;
    return data;
  },
};

// Servicios para eventos
export const eventService = {
  // Obtener todos los eventos
  async getAllEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  // Obtener un evento por ID
  async getEventById(eventId: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single<EventRow>();
    
    if (error) throw error;
    return data;
  },
  
  // Crear un nuevo evento
  async createEvent(eventData: EventInsert) {
    const { data, error } = await supabase
      .from('events')
      .insert<EventInsert>([eventData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Actualizar un evento
  async updateEvent(eventId: string, eventData: EventUpdate) {
    const { data, error } = await supabase
      .from('events')
      .update<EventUpdate>(eventData)
      .eq('id', eventId);
    
    if (error) throw error;
    return data;
  },
  
  // Eliminar un evento
  async deleteEvent(eventId: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) throw error;
    return true;
  },
};

// Servicios para prédicas
export const sermonService = {
  // Obtener todas las prédicas
  async getAllSermons() {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Obtener una prédica por slug
  async getSermonBySlug(slug: string) {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('slug', slug)
      .single<SermonRow>();
    
    if (error) throw error;
    return data;
  },
  
  // Crear una nueva prédica
  async createSermon(sermonData: SermonInsert) {
    const { data, error } = await supabase
      .from('sermons')
      .insert<SermonInsert>([sermonData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Actualizar una prédica
  async updateSermon(sermonId: string, sermonData: SermonUpdate) {
    const { data, error } = await supabase
      .from('sermons')
      .update<SermonUpdate>(sermonData)
      .eq('id', sermonId);
    
    if (error) throw error;
    return data;
  },
  
  // Eliminar una prédica
  async deleteSermon(sermonId: string) {
    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', sermonId);
    
    if (error) throw error;
    return true;
  },
  
  // Incrementar el contador de vistas
  async incrementViewCount(sermonId: string) {
    const { data: sermon } = await supabase
      .from('sermons')
      .select('view_count')
      .eq('id', sermonId)
      .single<SermonRow>();
    
    if (!sermon) throw new Error('Sermón no encontrado');
    
    const { error } = await supabase
      .from('sermons')
      .update<SermonUpdate>({ view_count: (sermon.view_count || 0) + 1 })
      .eq('id', sermonId);
    
    if (error) throw error;
    return true;
  },
};

// Servicios para blog
export const blogService = {
  // Obtener todos los posts
  async getAllPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  // Obtener un post por slug
  async getPostBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single<BlogPostRow>();
    
    if (error) throw error;
    return data;
  },
  
  // Crear un nuevo post
  async createPost(postData: BlogPostInsert) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert<BlogPostInsert>([postData])
      .select();
    
    if (error) throw error;
    return data[0];
  },
  
  // Actualizar un post
  async updatePost(postId: string, postData: BlogPostUpdate) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update<BlogPostUpdate>(postData)
      .eq('id', postId);
    
    if (error) throw error;
    return data;
  },
  
  // Eliminar un post
  async deletePost(postId: string) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    return true;
  },
  
  // Incrementar el contador de vistas
  async incrementViewCount(postId: string) {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('views')
      .eq('id', postId)
      .single<BlogPostRow>();
    
    if (!post) throw new Error('Post no encontrado');
    
    const { error } = await supabase
      .from('blog_posts')
      .update<BlogPostUpdate>({ views: (post.views || 0) + 1 })
      .eq('id', postId);
    
    if (error) throw error;
    return true;
  },
};

// Servicio de comentarios
export const commentService = {
  // Obtener comentarios por tipo de post y ID
  async getCommentsByPost(postType: 'blog' | 'sermon' | 'event', postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_type', postType)
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error al obtener comentarios:', error);
      throw error;
    }

    return data || [];
  },

  // Crear un nuevo comentario
  async createComment(comment: CommentInsert) {
    const { data, error } = await supabase
      .from('comments')
      .insert<CommentInsert>([comment])
      .select()
      .single<CommentRow>();

    if (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }

    return data;
  },

  // Actualizar un comentario
  async updateComment(id: string, updates: Partial<CommentUpdate>) {
    const { data, error } = await supabase
      .from('comments')
      .update<CommentUpdate>({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single<CommentRow>();

    if (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }

    return data;
  },

  // Eliminar un comentario
  async deleteComment(id: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }

    return true;
  },

  // Obtener comentarios pendientes de aprobación (para moderadores)
  async getPendingComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener comentarios pendientes:', error);
      throw error;
    }

    return data || [];
  },

  // Aprobar un comentario
  async approveComment(id: string) {
    return this.updateComment(id, { is_approved: true });
  },

  // Rechazar un comentario
  async rejectComment(id: string) {
    return this.deleteComment(id);
  },

  // Obtener estadísticas de comentarios
  async getCommentStats(postType: 'blog' | 'sermon' | 'event', postId: string) {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_type', postType)
      .eq('post_id', postId)
      .eq('is_approved', true);

    if (error) {
      console.error('Error al obtener estadísticas de comentarios:', error);
      throw error;
    }

    return count || 0;
  }
};