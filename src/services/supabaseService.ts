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
  // Leer todas las filas
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Leer columnas específicas
  async getUsersWithColumns(columns: string) {
    const { data, error } = await supabase
      .from('users')
      .select(columns);
    
    if (error) throw error;
    return data;
  },

  // Con paginación
  async getUsersWithPagination(start: number, end: number) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .range(start, end);
    
    if (error) throw error;
    return data;
  },

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

  // Filtrado avanzado
  async getUsersWithFilters(filters: {
    email?: string;
    role?: string;
    nameContains?: string;
    createdAfter?: string;
  }) {
    let query = supabase.from('users').select('*');

    if (filters.email) {
      query = query.eq('email', filters.email);
    }
    if (filters.role) {
      query = query.eq('role', filters.role);
    }
    if (filters.nameContains) {
      query = query.ilike('name', `%${filters.nameContains}%`);
    }
    if (filters.createdAfter) {
      query = query.gte('created_at', filters.createdAfter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Buscar usuarios por múltiples roles
  async getUsersByRoles(roles: string[]) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', roles);
    
    if (error) throw error;
    return data;
  },

  // Insertar una fila
  async createUser(userData: UserInsert) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Insertar múltiples filas
  async createMultipleUsers(usersData: UserInsert[]) {
    const { data, error } = await supabase
      .from('users')
      .insert(usersData)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Upsert (insertar o actualizar)
  async upsertUser(userData: UserInsert) {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Actualizar un usuario
  async updateUser(userId: string, userData: UserUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Actualizar múltiples usuarios por filtro
  async updateUsersByRole(role: string, userData: UserUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('role', role)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Eliminar un usuario
  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  },

  // Eliminar usuarios por filtro
  async deleteUsersByRole(role: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('role', role);
    
    if (error) throw error;
    return true;
  },

  // Suscribirse a todos los cambios
  subscribeToAllChanges(callback: (payload: any) => void) {
    return supabase
      .channel('custom-all-users-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        callback
      )
      .subscribe();
  },

  // Suscribirse a inserciones
  subscribeToInserts(callback: (payload: any) => void) {
    return supabase
      .channel('custom-insert-users-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'users' },
        callback
      )
      .subscribe();
  },

  // Suscribirse a actualizaciones
  subscribeToUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('custom-update-users-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        callback
      )
      .subscribe();
  },

  // Suscribirse a eliminaciones
  subscribeToDeletes(callback: (payload: any) => void) {
    return supabase
      .channel('custom-delete-users-channel')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'users' },
        callback
      )
      .subscribe();
  },

  // Suscribirse a filas específicas
  subscribeToSpecificUser(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('custom-filter-users-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'users', 
          filter: `id=eq.${userId}` 
        },
        callback
      )
      .subscribe();
  },

  // Suscribirse a usuarios por rol
  subscribeToUsersByRole(role: string, callback: (payload: any) => void) {
    return supabase
      .channel('custom-role-users-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'users', 
          filter: `role=eq.${role}` 
        },
        callback
      )
      .subscribe();
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