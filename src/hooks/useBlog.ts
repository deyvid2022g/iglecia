import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'
import { useAuth } from './useAuth'
import * as BlogService from '../services/blogService'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert']
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

export interface BlogState {
  posts: BlogPost[]
  loading: boolean
  error: string | null
}

export interface BlogActions {
  createPost: (postData: BlogPostInsert) => Promise<{ data: BlogPost | null; error: Error | null }>
  updatePost: (id: string, updates: BlogPostUpdate) => Promise<{ data: BlogPost | null; error: Error | null }>
  deletePost: (id: string) => Promise<{ error: Error | null }>
  getPostBySlug: (slug: string) => Promise<{ data: BlogPost | null; error: Error | null }>
  incrementViewCount: (id: string) => Promise<{ error: Error | null }>
  toggleLike: (postId: string) => Promise<{ error: Error | null }>
  refreshPosts: () => Promise<void>
}

export const useBlog = (options?: {
  published?: boolean
  limit?: number
  category?: string
  featured?: boolean
  author?: string
}): BlogState & BlogActions => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar el servicio de Supabase para obtener posts
      const data = await BlogService.getPosts(options)
      setPosts(data || [])
    } catch (err) {
      setError('Error al cargar posts del blog')
      console.error('Error in fetchPosts:', err)
    } finally {
      setLoading(false)
    }
  }, [options?.published, options?.limit, options?.category, options?.featured, options?.author])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts, options?.published, options?.limit, options?.category, options?.featured, options?.author])

  // Función interna para actualizar posts (se puede usar en el futuro)
  // Funciones internas no utilizadas - eliminadas para limpiar el código

  const refreshPosts = async () => {
    await fetchPosts()
  }

  return {
    posts,
    loading,
    error,
    createPost: async (postData: BlogPostInsert): Promise<{ data: BlogPost | null; error: Error | null }> => {
      try {
        const { data, error } = await BlogService.createPost(postData)
        if (error) {
          throw error
        }
        if (data) {
          setPosts(prev => [data, ...prev])
        }
        return { data, error: null }
      } catch (err) {
        console.error('Error creating blog post:', err)
        return { data: null, error: err as Error }
      }
    },
    updatePost: async (id: string, updates: BlogPostUpdate): Promise<{ data: BlogPost | null; error: Error | null }> => {
      try {
        const { data, error } = await BlogService.updatePost(id, updates)
        if (error) {
          throw error
        }
        if (data) {
          setPosts(prev => prev.map(post => post.id === id ? data : post))
        }
        return { data, error: null }
      } catch (err) {
        console.error('Error updating blog post:', err)
        return { data: null, error: err as Error }
      }
    },
    deletePost: async (id: string): Promise<{ error: Error | null }> => {
      try {
        await BlogService.deletePost(id)
        setPosts(prev => prev.filter(post => post.id !== id))
        return { error: null }
      } catch (err) {
        console.error('Error deleting blog post:', err)
        return { error: err as Error }
      }
    },
    getPostBySlug: async (slug: string): Promise<{ data: BlogPost | null; error: Error | null }> => {
      try {
        const { data, error } = await BlogService.getPostBySlug(slug)
        if (error) {
          throw error
        }
        return { data, error: null }
      } catch (err) {
        console.error('Error getting blog post by slug:', err)
        return { data: null, error: err as Error }
      }
    },
    incrementViewCount: async (id: string): Promise<{ error: Error | null }> => {
      try {
        const { error } = await BlogService.incrementViewCount(id)
        if (error) {
          throw error
        }
        setPosts(prev => prev.map(post => 
          post.id === id ? { ...post, view_count: post.view_count + 1 } : post
        ))
        return { error: null }
      } catch (err) {
        console.error('Error incrementing view count:', err)
        return { error: err as Error }
      }
    },
    toggleLike: async (postId: string): Promise<{ error: Error | null }> => {
      try {
        await BlogService.toggleLike(postId, user?.id || '')
        return { error: null }
      } catch (err) {
        console.error('Error toggling like:', err)
        return { error: err as Error }
      }
    },
    refreshPosts
  }
}

// Hook específico para obtener un post por slug
export const useBlogPost = (slug: string) => {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        const { data, error } = await BlogService.getPostBySlug(slug)
        if (error) {
          throw error
        }
        setPost(data)
      } catch (err) {
        setError('Error al cargar post del blog')
        console.error('Error fetching blog post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  return { post, loading, error }
}

// Hook para posts destacados
export const useFeaturedPosts = (_limit: number = 3) => {
  return useBlog({
    published: true,
    featured: true,
    limit: _limit
  })
}

// Hook para posts recientes
export const useRecentPosts = (_limit: number = 6) => {
  return useBlog({
    published: true,
    limit: _limit
  })
}

// Hook para posts por categoría
export const usePostsByCategory = (category: string) => {
  return useBlog({
    published: true,
    category
  })
}

// Hook para posts por autor
export const usePostsByAuthor = (author: string) => {
  return useBlog({
    published: true,
    author
  })
}

// Hook para categorías de blog
export const useBlogCategories = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; description?: string; slug?: string; color?: string; icon?: string; display_order?: number; is_active?: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      // Usar categorías simuladas localmente
      const mockCategories = [
        { 
          id: '1', 
          name: 'Devocionales', 
          description: 'Reflexiones diarias',
          slug: 'devocionales',
          color: '#3B82F6',
          icon: 'book-heart',
          display_order: 1,
          is_active: true
        },
        { 
          id: '2', 
          name: 'Enseñanzas', 
          description: 'Estudios bíblicos',
          slug: 'ensenanzas',
          color: '#10B981',
          icon: 'cross',
          display_order: 2,
          is_active: true
        },
        { 
          id: '3', 
          name: 'Testimonios', 
          description: 'Historias de fe',
          slug: 'testimonios',
          color: '#EF4444',
          icon: 'heart-handshake',
          display_order: 3,
          is_active: true
        },
        { 
          id: '4', 
          name: 'Eventos', 
          description: 'Actividades de la iglesia',
          slug: 'eventos',
          color: '#F59E0B',
          icon: 'calendar',
          display_order: 4,
          is_active: true
        }
      ]
      setCategories(mockCategories)
    } catch (err) {
      setError('Error al cargar categorías')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (categoryData: { name: string; description?: string; slug?: string; color?: string; icon?: string; display_order?: number; is_active?: boolean }) => {
    try {
      setLoading(true)
      setError(null)

      // Simular creación de categoría
      const newCategory = {
        id: Date.now().toString(),
        ...categoryData,
        display_order: categoryData.display_order || categories.length + 1,
        is_active: categoryData.is_active !== undefined ? categoryData.is_active : true
      }
      
      setCategories(prev => [...prev, newCategory])
      return { data: newCategory, error: null }
    } catch (err) {
      const error = 'Error al crear categoría'
      setError(error)
      console.error('Error creating category:', err)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<{ name: string; description?: string; slug?: string; color?: string; icon?: string; display_order?: number; is_active?: boolean }>) => {
    try {
      setLoading(true)
      setError(null)

      // Simular actualización de categoría
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...categoryData } : cat
      ))
      
      const updatedCategory = categories.find(cat => cat.id === id)
      return { data: updatedCategory, error: null }
    } catch (err) {
      const error = 'Error al actualizar categoría'
      setError(error)
      console.error('Error updating category:', err)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      // Simular eliminación de categoría
      setCategories(prev => prev.filter(cat => cat.id !== id))
      return { error: null }
    } catch (err) {
      const error = 'Error al eliminar categoría'
      setError(error)
      console.error('Error deleting category:', err)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return { 
    categories, 
    loading, 
    error, 
    fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  }
}

// Hook para comentarios
export const useComments = (contentType: 'blog_post' | 'sermon' | 'event', contentId: string) => {
  const [comments, setComments] = useState<{ id: string; content: string; author: string; created_at: string; likes?: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchComments = async () => {
      if (!contentId) return

      try {
        setLoading(true)
        setError(null)

        // Usar comentarios simulados localmente
        const mockComments = [
          {
            id: '1',
            content: 'Excelente reflexión, muy edificante.',
            author: 'María González',
            created_at: new Date().toISOString(),
            likes: 5
          },
          {
            id: '2', 
            content: 'Gracias por compartir esta palabra.',
            author: 'Juan Pérez',
            created_at: new Date().toISOString(),
            likes: 3
          }
        ]
        setComments(mockComments)
      } catch (err) {
        setError('Error al cargar comentarios')
        console.error('Error fetching comments:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [contentType, contentId])

  const addComment = async (content: string) => {
    try {
      if (!user) {
        return { error: new Error('Debes iniciar sesión para comentar') }
      }

      // Simular agregar comentario localmente
      const newComment = {
        id: Date.now().toString(),
        content,
        author: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.user_id || 'Usuario anónimo',
        created_at: new Date().toISOString(),
        likes: 0
      }

      setComments(prev => [...prev, newComment])
      return { data: newComment, error: null }
    } catch (err) {
      console.error('Error adding comment:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error') }
    }
  }

  return {
    comments,
    loading,
    error,
    addComment
  }
}