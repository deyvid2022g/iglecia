import { useState, useEffect, useCallback } from 'react'
import { supabase, type BlogPost } from '../lib/supabase'
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

      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(
            id,
            name,
            description,
            color
          ),
          profiles!blog_posts_author_id_fkey(
            name,
            avatar_url
          )
        `)
        .order('published_at', { ascending: false })

      // Aplicar filtros
      if (options?.published !== undefined) {
        query = query.eq('is_published', options.published)
      }

      if (options?.category) {
        query = query.eq('category_id', options.category)
      }

      if (options?.featured !== undefined) {
        query = query.eq('is_featured', options.featured)
      }

      if (options?.author) {
        query = query.eq('author_id', options.author)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
        console.error('Error fetching blog posts:', error)
      } else {
        setPosts(data || [])
      }
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
      if (updates.is_published && !updates.published_at) {
        updates.published_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        setPosts(prev => prev.map(post => post.id === id ? data : post))
      }

      return { data, error }
    } catch (err) {
      console.error('Error updating blog post:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (!error) {
        setPosts(prev => prev.filter(post => post.id !== id))
      }

      return { error }
    } catch (err) {
      console.error('Error deleting blog post:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _getPostBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(
            id,
            name,
            description,
            color
          ),
          profiles!blog_posts_author_id_fkey(
            name,
            avatar_url,
            bio
          )
        `)
        .eq('slug', slug)
        .single()

      return { data, error }
    } catch (err) {
      console.error('Error getting blog post by slug:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _incrementViewCount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          view_count: supabase.rpc('increment_view_count')
        })
        .eq('id', id)

      if (!error) {
        setPosts(prev => prev.map(post => 
          post.id === id 
            ? { ...post, view_count: post.view_count + 1 }
            : post
        ))
      }

      return { error }
    } catch (err) {
      console.error('Error incrementing view count:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _toggleLike = async (postId: string) => {
    try {
      if (!user) {
        return { error: { message: 'Debes iniciar sesión para dar like' } }
      }

      // Verificar si ya existe el like
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_type', 'blog_post')
        .eq('content_id', postId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        return { error: checkError }
      }

      if (existingLike) {
        // Quitar like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('content_type', 'blog_post')
          .eq('content_id', postId)

        return { error }
      } else {
        // Agregar like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            content_type: 'blog_post',
            content_id: postId
          })

        return { error }
      }
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
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            ...postData,
            author_id: user?.id,
            view_count: 0,
            like_count: 0,
            comment_count: 0,
            published_at: postData.is_published ? new Date().toISOString() : null
          })
          .select()
          .single()

        if (!error && data) {
          setPosts(prev => [data as BlogPost, ...prev])
          return { data: data as BlogPost, error: null }
        }

        return { data: null, error: error as Error }
      } catch (err) {
        console.error('Error creating blog post:', err)
        return { data: null, error: err as Error }
      }
    },
    updatePost: async (id: string, updates: Partial<BlogPost>): Promise<{ data: BlogPost | null; error: Error | null }> => {
      try {
        // If publishing the post, add publication date
        if (updates.is_published && !updates.published_at) {
          updates.published_at = new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('blog_posts')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (!error && data) {
          setPosts(prev => prev.map(post => post.id === id ? data as BlogPost : post))
          return { data: data as BlogPost, error: null }
        }

        return { data: null, error: error as Error }
      } catch (err) {
        console.error('Error updating blog post:', err)
        return { data: null, error: err as Error }
      }
    },
    deletePost: async (id: string): Promise<{ error: Error | null }> => {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id)

        if (!error) {
          setPosts(prev => prev.filter(post => post.id !== id))
        }

        return { error: error as Error | null }
      } catch (err) {
        console.error('Error deleting blog post:', err)
        return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
      }
    },
    getPostBySlug: async (slug: string): Promise<{ data: BlogPost | null; error: Error | null }> => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            blog_categories(
              id,
              name,
              description,
              color
            ),
            profiles!blog_posts_author_id_fkey(
              name,
              avatar_url,
              bio
            )
          `)
          .eq('slug', slug)
          .single()

        if (error) {
          return { data: null, error: error as Error }
        }

        return { data: data as BlogPost, error: null }
      } catch (err) {
        console.error('Error getting blog post by slug:', err)
        return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
      }
    },
    incrementViewCount: async (id: string): Promise<{ error: Error | null }> => {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            view_count: supabase.rpc('increment_view_count')
          })
          .eq('id', id)

        if (!error) {
          setPosts(prev => prev.map(post => 
            post.id === id 
              ? { ...post, view_count: post.view_count + 1 }
              : post
          ))
        }

        return { error: error as Error | null }
      } catch (err) {
        console.error('Error incrementing view count:', err)
        return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
      }
    },
    toggleLike: async (postId: string): Promise<{ error: Error | null }> => {
      try {
        if (!user) {
          return { error: new Error('Debes iniciar sesión para dar like') }
        }

        // Check if like already exists
        const { data: existingLike, error: checkError } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('content_type', 'blog_post')
          .eq('content_id', postId)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          return { error: checkError as Error }
        }

        if (existingLike) {
          // Remove like
          const { error } = await supabase
            .from('likes')
            .delete()
            .eq('user_id', user.id)
            .eq('content_type', 'blog_post')
            .eq('content_id', postId)

          return { error: error as Error | null }
        } else {
          // Add like
          const { error } = await supabase
            .from('likes')
            .insert({
              user_id: user.id,
              content_type: 'blog_post',
              content_id: postId
            })

          return { error: error as Error | null }
        }
      } catch (err) {
        console.error('Error toggling like:', err)
        return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
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

        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            blog_categories(
              id,
              name,
              description,
              color
            ),
            profiles!blog_posts_author_id_fkey(
              name,
              avatar_url,
              bio
            )
          `)
          .eq('slug', slug)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setPost(data)
        }
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

        const { data, error } = await supabase
          .from('blog_categories')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) {
          setError(error.message)
        } else {
          setCategories(data || [])
        }
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

        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles(
              name,
              avatar_url
            )
          `)
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('is_approved', true)
          .order('created_at', { ascending: true })

        if (error) {
          setError(error.message)
        } else {
          setComments(data || [])
        }
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
        return { error: { message: 'Debes iniciar sesión para comentar' } }
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          parent_id: parentId,
          content,
          is_approved: false // Los comentarios requieren aprobación
        })
        .select(`
          *,
          profiles(
            name,
            avatar_url
          )
        `)
        .single()

      if (!error && data) {
        // Solo agregar si está aprobado (para admins podría estar auto-aprobado)
        if (data.is_approved) {
          setComments(prev => [...prev, data])
        }
      }

      return { data, error }
    } catch (err) {
      console.error('Error adding comment:', err)
      return { data: null, error: err }
    }
  }

  return {
    comments,
    loading,
    error,
    addComment
  }
}