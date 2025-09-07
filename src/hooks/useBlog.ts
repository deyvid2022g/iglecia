import { useState, useEffect, useCallback } from 'react'
import { localData, type BlogPost } from '../lib/localData'
import { useAuth } from './useAuth'

export interface BlogState {
  posts: BlogPost[]
  loading: boolean
  error: string | null
}

export interface BlogActions {
  createPost: (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>) => Promise<{ data: BlogPost | null; error: Error | null }>
  updatePost: (id: string, updates: Partial<BlogPost>) => Promise<{ data: BlogPost | null; error: Error | null }>
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

      // Usar el servicio de datos locales
      const data = await localData.getBlogPosts({
        published: options?.published,
        limit: options?.limit
      })

      // Aplicar filtros adicionales si es necesario
      let filteredPosts = data

      if (options?.author) {
        filteredPosts = data.filter(post => post.author_id === options.author)
      }

      setPosts(filteredPosts)
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



  const _updatePost = async (id: string, updates: Partial<BlogPost>) => {
    try {
      // Si se está publicando el post, agregar fecha de publicación
      if (updates.published && !updates.published_at) {
        updates.published_at = new Date().toISOString()
      }

      const data = await localData.updateBlogPost(id, updates)

      if (data) {
        setPosts(prev => prev.map(post => post.id === id ? data : post))
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error updating blog post:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _deletePost = async (id: string) => {
    try {
      await localData.deleteBlogPost(id)
      setPosts(prev => prev.filter(post => post.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting blog post:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _getPostBySlug = async (slug: string) => {
    try {
      const data = await localData.getBlogPostBySlug(slug)
      return { data, error: null }
    } catch (err) {
      console.error('Error getting blog post by slug:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _incrementViewCount = async (id: string) => {
    try {
      // Incrementar contador de vistas localmente
      setPosts(prev => prev.map(post => 
        post.id === id 
          ? { ...post, view_count: post.view_count + 1 }
          : post
      ))

      return { error: null }
    } catch (err) {
      console.error('Error incrementing view count:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _toggleLike = async (postId: string) => {
    try {
      if (!user) {
        return { error: new Error('Debes iniciar sesión para dar like') }
      }

      // Simular toggle de like localmente
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, like_count: post.like_count + (Math.random() > 0.5 ? 1 : -1) }
          : post
      ))

      return { error: null }
    } catch (err) {
      console.error('Error toggling like:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const refreshPosts = async () => {
    await fetchPosts()
  }

  return {
    posts,
    loading,
    error,
    createPost: async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>): Promise<{ data: BlogPost | null; error: Error | null }> => {
      try {
        const data = await localData.createBlogPost({
          ...postData,
          author_id: user?.id || 'anonymous',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          published_at: postData.published ? new Date().toISOString() : null
        })

        if (data) {
          setPosts(prev => [data, ...prev])
          return { data, error: null }
        }

        return { data: null, error: new Error('Error creating post') }
      } catch (err) {
        console.error('Error creating blog post:', err)
        return { data: null, error: err as Error }
      }
    },
    updatePost: async (id: string, updates: Partial<BlogPost>): Promise<{ data: BlogPost | null; error: Error | null }> => {
      try {
        // If publishing the post, add publication date
        if (updates.published && !updates.published_at) {
          updates.published_at = new Date().toISOString()
        }

        const data = await localData.updateBlogPost(id, updates)

        if (data) {
          setPosts(prev => prev.map(post => post.id === id ? data : post))
          return { data, error: null }
        }

        return { data: null, error: new Error('Error updating post') }
      } catch (err) {
        console.error('Error updating blog post:', err)
        return { data: null, error: err as Error }
      }
    },
    deletePost: _deletePost,
    getPostBySlug: _getPostBySlug,
    incrementViewCount: _incrementViewCount,
    toggleLike: _toggleLike,
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

        const data = await localData.getBlogPostBySlug(slug)
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
  const [categories, setCategories] = useState<{ id: string; name: string; description?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        // Usar categorías simuladas localmente
        const mockCategories = [
          { id: '1', name: 'Devocionales', description: 'Reflexiones diarias' },
          { id: '2', name: 'Enseñanzas', description: 'Estudios bíblicos' },
          { id: '3', name: 'Testimonios', description: 'Historias de fe' },
          { id: '4', name: 'Eventos', description: 'Actividades de la iglesia' }
        ]
        setCategories(mockCategories)
      } catch (err) {
        setError('Error al cargar categorías')
        console.error('Error fetching categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
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

  const addComment = async (content: string, parentId?: string) => {
    try {
      if (!user) {
        return { error: new Error('Debes iniciar sesión para comentar') }
      }

      // Simular agregar comentario localmente
      const newComment = {
        id: Date.now().toString(),
        content,
        author: user.name || user.email,
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