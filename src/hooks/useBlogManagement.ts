import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Interfaces
export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image_url?: string
  author_id: string
  category_id?: string
  tags?: string[]
  is_published: boolean
  is_featured: boolean
  published_at?: string
  view_count: number
  like_count: number
  comment_count: number
  reading_time_minutes?: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
  
  // Relations
  author?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  category?: BlogCategory
  comments?: BlogComment[]
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  is_active: boolean
  post_count: number
  display_order: number
  created_at: string
  updated_at: string
}

export interface BlogComment {
  id: string
  post_id: string
  author_name: string
  author_email: string
  author_website?: string
  content: string
  is_approved: boolean
  parent_id?: string
  created_at: string
  updated_at: string
  
  // Relations
  replies?: BlogComment[]
  post?: BlogPost
}

export interface BlogStats {
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  featuredPosts: number
  postsThisMonth: number
  totalViews: number
  totalLikes: number
  totalComments: number
  pendingComments: number
}

export interface BlogFilters {
  search: string
  category: string
  status: 'all' | 'published' | 'draft' | 'featured'
  author: string
  dateFrom: string
  dateTo: string
  sortBy: 'created_at' | 'published_at' | 'title' | 'view_count' | 'like_count'
  sortOrder: 'asc' | 'desc'
}

export const useBlogManagement = () => {
  // State
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [comments, setComments] = useState<BlogComment[]>([])
  const [stats, setStats] = useState<BlogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [filters, setFilters] = useState<BlogFilters>({
    search: '',
    category: '',
    status: 'all',
    author: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  // Error handling
  const handleError = (err: any, context: string) => {
    console.error(`Error in ${context}:`, err)
    setError(`Error en ${context}: ${err.message}`)
  }

  const clearError = () => setError(null)

  // Fetch functions
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          author:users(id,full_name,email,avatar_url),
          category:blog_categories(id,name,slug,color)
        `)
      
      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`)
      }
      
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }
      
      if (filters.status !== 'all') {
        switch (filters.status) {
          case 'published':
            query = query.eq('is_published', true)
            break
          case 'draft':
            query = query.eq('is_published', false)
            break
          case 'featured':
            query = query.eq('is_featured', true)
            break
        }
      }
      
      if (filters.author) {
        query = query.eq('author_id', filters.author)
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
      
      // Apply sorting
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })
      
      const { data, error } = await query
      
      if (error) throw error
      
      setPosts(data || [])
    } catch (err) {
      handleError(err, 'cargar posts')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })
      
      if (error) throw error
      
      setCategories(data || [])
    } catch (err) {
      handleError(err, 'cargar categorías')
    }
  }, [])

  const fetchComments = useCallback(async (postId?: string) => {
    try {
      let query = supabase
        .from('blog_interactions')
        .select(`
          *,
          post:blog_posts(id,title)
        `)
        .eq('interaction_type', 'comment')
        .order('created_at', { ascending: false })
      
      if (postId) {
        query = query.eq('post_id', postId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setComments(data || [])
    } catch (err) {
      handleError(err, 'cargar comentarios')
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      // Get basic post stats
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('id,is_published,is_featured,view_count,like_count,created_at')
      
      if (postsError) throw postsError
      
      // Get interaction stats (comentarios)
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('blog_interactions')
        .select('id,interaction_type')
      
      if (interactionsError) throw interactionsError
      
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const stats: BlogStats = {
        totalPosts: postsData?.length || 0,
        publishedPosts: postsData?.filter((p: any) => p.is_published).length || 0,
        draftPosts: postsData?.filter((p: any) => !p.is_published).length || 0,
        featuredPosts: postsData?.filter((p: any) => p.is_featured).length || 0,
        postsThisMonth: postsData?.filter((p: any) => new Date(p.created_at) >= thisMonth).length || 0,
        totalViews: postsData?.reduce((sum: number, p: any) => sum + (p.view_count || 0), 0) || 0,
        totalLikes: postsData?.reduce((sum: number, p: any) => sum + (p.like_count || 0), 0) || 0,
        totalComments: interactionsData?.filter((i: any) => i.interaction_type === 'comment').length || 0,
        pendingComments: 0 // blog_interactions no tiene campo is_approved
      }
      
      setStats(stats)
    } catch (err) {
      handleError(err, 'cargar estadísticas')
    }
  }, [])

  // CRUD operations for posts
  const createPost = async (postData: Partial<BlogPost>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...postData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      await fetchPosts()
      await fetchStats()
      return data
    } catch (err) {
      handleError(err, 'crear post')
      throw err
    }
  }

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      await fetchPosts()
      await fetchStats()
      return data
    } catch (err) {
      handleError(err, 'actualizar post')
      throw err
    }
  }

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await fetchPosts()
      await fetchStats()
    } catch (err) {
      handleError(err, 'eliminar post')
      throw err
    }
  }

  const publishPost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      await fetchPosts()
      await fetchStats()
    } catch (err) {
      handleError(err, 'publicar post')
      throw err
    }
  }

  const unpublishPost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_published: false,
          published_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      await fetchPosts()
      await fetchStats()
    } catch (err) {
      handleError(err, 'despublicar post')
      throw err
    }
  }

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          is_featured: isFeatured,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      await fetchPosts()
      await fetchStats()
    } catch (err) {
      handleError(err, 'cambiar destacado')
      throw err
    }
  }

  // CRUD operations for categories
  const createCategory = async (categoryData: Partial<BlogCategory>) => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .insert({
          ...categoryData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      await fetchCategories()
      return data
    } catch (err) {
      handleError(err, 'crear categoría')
      throw err
    }
  }

  const updateCategory = async (id: string, categoryData: Partial<BlogCategory>) => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .update({
          ...categoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      await fetchCategories()
      return data
    } catch (err) {
      handleError(err, 'actualizar categoría')
      throw err
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await fetchCategories()
    } catch (err) {
      handleError(err, 'eliminar categoría')
      throw err
    }
  }

  // CRUD operations for comments
  const approveComment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({
          is_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      await fetchComments()
      await fetchStats()
    } catch (err) {
      handleError(err, 'aprobar comentario')
      throw err
    }
  }

  const rejectComment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({
          is_approved: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      await fetchComments()
      await fetchStats()
    } catch (err) {
      handleError(err, 'rechazar comentario')
      throw err
    }
  }

  const deleteComment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await fetchComments()
      await fetchStats()
    } catch (err) {
      handleError(err, 'eliminar comentario')
      throw err
    }
  }

  const replyToComment = async (commentId: string, replyData: Partial<BlogComment>) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          ...replyData,
          parent_id: commentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      await fetchComments()
      await fetchStats()
      return data
    } catch (err) {
      handleError(err, 'responder comentario')
      throw err
    }
  }

  // Filter management
  const updateFilters = (newFilters: Partial<BlogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: 'all',
      author: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  // Utility functions
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  const generateExcerpt = (content: string, maxLength: number = 160): string => {
    const plainText = content.replace(/<[^>]*>/g, '')
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength).trim() + '...'
      : plainText
  }

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchCategories(),
        fetchStats()
      ])
      await fetchPosts()
    }

    initializeData()
  }, [])

  // Refetch posts when filters change
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    // Data
    posts,
    categories,
    comments,
    stats,
    filters,
    loading,
    error,

    // Post operations
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost,
    toggleFeatured,

    // Category operations
    createCategory,
    updateCategory,
    deleteCategory,

    // Comment operations
    fetchComments,
    approveComment,
    rejectComment,
    deleteComment,
    replyToComment,

    // Filter operations
    updateFilters,
    resetFilters,

    // Utility functions
    generateSlug,
    calculateReadingTime,
    generateExcerpt,

    // Refresh functions
    fetchPosts,
    fetchCategories,
    fetchStats,

    // Error handling
    clearError
  }
}

export default useBlogManagement