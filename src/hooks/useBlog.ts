import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

// Firebase type definitions
export interface BlogPost {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_id: string;
  category_id?: string;
  tags?: string[];
  featured_image?: string;
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  seo_title?: string;
  seo_description?: string;
  reading_time?: number;
}

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

      const postsRef = collection(db, 'blog_posts')
      let q = query(postsRef, orderBy('published_at', 'desc'))

      // Aplicar filtros
      if (options?.published !== undefined) {
        q = query(q, where('is_published', '==', options.published))
      }

      if (options?.category) {
        q = query(q, where('category_id', '==', options.category))
      }

      if (options?.featured !== undefined) {
        q = query(q, where('is_featured', '==', options.featured))
      }

      if (options?.author) {
        q = query(q, where('author_id', '==', options.author))
      }

      if (options?.limit) {
        q = query(q, firestoreLimit(options.limit))
      }

      const querySnapshot = await getDocs(q)
      const postsData: BlogPost[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        postsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
          published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at
        } as BlogPost)
      })

      setPosts(postsData)
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

      const postRef = doc(db, 'blog_posts', id)
      const updateData = {
        ...updates,
        updated_at: serverTimestamp()
      }
      
      await updateDoc(postRef, updateData)
      
      // Get the updated document
      const updatedDoc = await getDoc(postRef)
      if (updatedDoc.exists()) {
        const data = updatedDoc.data()
        const updatedPost = {
          id: updatedDoc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
          published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at
        } as BlogPost
        
        setPosts(prev => prev.map(post => post.id === id ? updatedPost : post))
        return { data: updatedPost, error: null }
      }

      return { data: null, error: new Error('Document not found after update') }
    } catch (err) {
      console.error('Error updating blog post:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _deletePost = async (id: string) => {
    try {
      const postRef = doc(db, 'blog_posts', id)
      await deleteDoc(postRef)
      
      setPosts(prev => prev.filter(post => post.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting blog post:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const _getPostBySlug = async (slug: string) => {
    try {
      const postsRef = collection(db, 'blog_posts')
      const q = query(postsRef, where('slug', '==', slug))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return { data: null, error: new Error('Post not found') }
      }
      
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      const post = {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
        published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at
      } as BlogPost

      return { data: post, error: null }
    } catch (err) {
      console.error('Error getting blog post by slug:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
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
        const postsRef = collection(db, 'blog_posts')
        const newPostData = {
          ...postData,
          author_id: user?.uid,
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          published_at: postData.is_published ? new Date().toISOString() : null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        }
        
        const docRef = await addDoc(postsRef, newPostData)
        const newDoc = await getDoc(docRef)
        
        if (newDoc.exists()) {
          const data = newDoc.data()
          const newPost = {
            id: newDoc.id,
            ...data,
            created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
            updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
            published_at: data.published_at?.toDate?.()?.toISOString() || data.published_at
          } as BlogPost
          
          setPosts(prev => [newPost, ...prev])
          return { data: newPost, error: null }
        }
        
        return { data: null, error: new Error('Failed to create post') }
      } catch (err) {
        console.error('Error creating blog post:', err)
        return { data: null, error: err as Error }
      }
    },
    updatePost: async (id: string, updates: Partial<BlogPost>): Promise<{ data: BlogPost | null; error: Error | null }> => {
      return await _updatePost(id, updates)
    },
    deletePost: async (id: string): Promise<{ error: Error | null }> => {
      return await _deletePost(id)
    },
    getPostBySlug: async (slug: string): Promise<{ data: BlogPost | null; error: Error | null }> => {
      return await _getPostBySlug(slug)
    },
    incrementViewCount: async (id: string): Promise<{ error: Error | null }> => {
      try {
        const postRef = doc(db, 'blog_posts', id)
        const postDoc = await getDoc(postRef)
        
        if (postDoc.exists()) {
          const currentViewCount = postDoc.data().view_count || 0
          await updateDoc(postRef, {
            view_count: currentViewCount + 1,
            updated_at: serverTimestamp()
          })
          
          setPosts(prev => prev.map(post => 
            post.id === id 
              ? { ...post, view_count: post.view_count + 1 }
              : post
          ))
        }

        return { error: null }
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
        const likesRef = collection(db, 'likes')
        const q = query(
          likesRef,
          where('user_id', '==', user.uid),
          where('content_type', '==', 'blog_post'),
          where('content_id', '==', postId)
        )
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          // Remove like
          const likeDoc = querySnapshot.docs[0]
          await deleteDoc(doc(db, 'likes', likeDoc.id))
          return { error: null }
        } else {
          // Add like
          await addDoc(likesRef, {
            user_id: user.uid,
            content_type: 'blog_post',
            content_id: postId,
            created_at: serverTimestamp()
          })
          return { error: null }
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

        const postsRef = collection(db, 'blog_posts')
        const q = query(postsRef, where('slug', '==', slug))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0]
          const data = doc.data()
          const blogPost: BlogPost = {
            id: doc.id,
            created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            title: data.title,
            slug: data.slug,
            content: data.content,
            excerpt: data.excerpt,
            author_id: data.author_id,
            category_id: data.category_id,
            tags: data.tags || [],
            featured_image: data.featured_image,
            is_published: data.is_published,
            is_featured: data.is_featured,
            published_at: data.published_at?.toDate?.()?.toISOString(),
            view_count: data.view_count || 0,
            like_count: data.like_count || 0,
            comment_count: data.comment_count || 0,
            seo_title: data.seo_title,
            seo_description: data.seo_description,
            reading_time: data.reading_time
          }
          setPost(blogPost)
        } else {
          setError('Post no encontrado')
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

        const categoriesRef = collection(db, 'blog_categories')
        const q = query(
          categoriesRef,
          where('is_active', '==', true),
          orderBy('name')
        )
        const querySnapshot = await getDocs(q)
        
        const categoriesData: { id: string; name: string; description?: string }[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          categoriesData.push({
            id: doc.id,
            name: data.name,
            description: data.description
          })
        })
        
        setCategories(categoriesData)
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

        const commentsRef = collection(db, 'comments')
        const q = query(
          commentsRef,
          where('content_type', '==', contentType),
          where('content_id', '==', contentId),
          where('is_approved', '==', true),
          orderBy('created_at', 'asc')
        )
        const querySnapshot = await getDocs(q)
        
        const commentsData: { id: string; content: string; author: string; created_at: string; likes?: number }[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          commentsData.push({
            id: doc.id,
            content: data.content,
            author: data.author || 'Usuario',
            created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            likes: data.likes || 0
          })
        })
        
        setComments(commentsData)
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

      const commentData = {
        user_id: user.uid,
        content_type: contentType,
        content_id: contentId,
        parent_id: parentId || null,
        content,
        is_approved: false, // Los comentarios requieren aprobación
        author: user.displayName || user.email || 'Usuario',
        created_at: serverTimestamp(),
        likes: 0
      }

      const commentsRef = collection(db, 'comments')
      const docRef = await addDoc(commentsRef, commentData)
      
      const newComment = {
        id: docRef.id,
        ...commentData,
        created_at: new Date().toISOString()
      }

      // Solo agregar si está aprobado (para admins podría estar auto-aprobado)
      if (newComment.is_approved) {
        setComments(prev => [...prev, newComment])
      }

      return { data: newComment, error: null }
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