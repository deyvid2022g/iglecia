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
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

// Define Sermon type for Firebase
export interface Sermon {
  id: string
  title: string
  description: string
  speaker_name: string
  preached_date: string
  video_url?: string
  audio_url?: string
  transcript?: string
  tags?: string[]
  category_id?: string
  series_id?: string
  is_published: boolean
  featured: boolean
  view_count: number
  like_count: number
  comment_count: number
  created_by: string
  created_at: string
  updated_at: string
  slug: string
}

export interface SermonsState {
  sermons: Sermon[]
  loading: boolean
  error: string | null
}

export interface SermonsActions {
  createSermon: (sermonData: Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>) => Promise<{ data: Sermon | null; error: Error | null }>
  updateSermon: (id: string, updates: Partial<Sermon>) => Promise<{ data: Sermon | null; error: Error | null }>
  deleteSermon: (id: string) => Promise<{ error: Error | null }>
  getSermonBySlug: (slug: string) => Promise<{ data: Sermon | null; error: Error | null }>
  incrementViewCount: (id: string) => Promise<{ error: Error | null }>
  toggleLike: (sermonId: string) => Promise<{ error: Error | null }>
  refreshSermons: () => Promise<void>
}

export const useSermons = (options?: {
  published?: boolean
  limit?: number
  speaker?: string
  category?: string
  featured?: boolean
}): SermonsState & SermonsActions => {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchSermons = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const sermonsRef = collection(db, 'sermons')
      let firestoreQuery = query(sermonsRef, orderBy('preached_date', 'desc'))

      // Aplicar filtros
      if (options?.published !== undefined) {
        firestoreQuery = query(firestoreQuery, where('is_published', '==', options.published))
      }

      if (options?.speaker) {
        firestoreQuery = query(firestoreQuery, where('speaker_name', '==', options.speaker))
      }

      if (options?.category) {
        firestoreQuery = query(firestoreQuery, where('category_id', '==', options.category))
      }

      if (options?.featured !== undefined) {
        firestoreQuery = query(firestoreQuery, where('featured', '==', options.featured))
      }

      if (options?.limit) {
        firestoreQuery = query(firestoreQuery, firestoreLimit(options.limit))
      }

      const querySnapshot = await getDocs(firestoreQuery)
      const sermonsData: Sermon[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        sermonsData.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
          updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
          preached_date: data.preached_date?.toDate?.()?.toISOString() || data.preached_date
        } as Sermon)
      })

      setSermons(sermonsData)
    } catch (err) {
      setError('Error al cargar sermones')
      console.error('Error in fetchSermons:', err)
    } finally {
      setLoading(false)
    }
  }, [options?.published, options?.limit, options?.speaker, options?.category, options?.featured])

  useEffect(() => {
    fetchSermons()
  }, [fetchSermons, options?.published, options?.limit, options?.speaker, options?.category, options?.featured])

  const createSermon = async (sermonData: Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'comment_count'>) => {
    try {
      if (!user) {
        return { data: null, error: new Error('Usuario no autenticado') }
      }

      const newSermon = {
        ...sermonData,
        created_by: user.uid,
        view_count: 0,
        like_count: 0,
        comment_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }

      const sermonsRef = collection(db, 'sermons')
      const docRef = await addDoc(sermonsRef, newSermon)
      
      // Obtener el documento creado
      const createdDoc = await getDoc(docRef)
      const createdData = createdDoc.data()
      
      const sermon: Sermon = {
        id: docRef.id,
        ...createdData,
        created_at: createdData?.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: createdData?.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Sermon

      // Actualizar la lista local
      await fetchSermons()
      
      return { data: sermon, error: null }
    } catch (err) {
      console.error('Error creating sermon:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const updateSermon = async (id: string, updates: Partial<Sermon>) => {
    try {
      const sermonRef = doc(db, 'sermons', id)
      const updateData = {
        ...updates,
        updated_at: serverTimestamp()
      }
      
      await updateDoc(sermonRef, updateData)
      
      // Obtener el documento actualizado
      const updatedDoc = await getDoc(sermonRef)
      const updatedData = updatedDoc.data()
      
      const sermon: Sermon = {
        id: updatedDoc.id,
        ...updatedData,
        created_at: updatedData?.created_at?.toDate?.()?.toISOString() || updatedData?.created_at,
        updated_at: updatedData?.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Sermon

      // Actualizar la lista local
      setSermons(prev => prev.map(s => 
        s.id === id ? sermon : s
      ))

      return { data: sermon, error: null }
    } catch (err) {
      console.error('Error updating sermon:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const deleteSermon = async (id: string) => {
    try {
      const sermonRef = doc(db, 'sermons', id)
      await deleteDoc(sermonRef)

      // Actualizar la lista local
      setSermons(prev => prev.filter(sermon => sermon.id !== id))

      return { error: null }
    } catch (err) {
      console.error('Error deleting sermon:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const getSermonBySlug = async (slug: string) => {
    try {
      const sermonsRef = collection(db, 'sermons')
      const q = query(sermonsRef, where('slug', '==', slug))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return { data: null, error: new Error('Sermón no encontrado') }
      }
      
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      
      const sermon: Sermon = {
        id: doc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
        preached_date: data.preached_date?.toDate?.()?.toISOString() || data.preached_date
      } as Sermon

      return { data: sermon, error: null }
    } catch (err) {
      console.error('Error getting sermon by slug:', err)
      return { data: null, error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const incrementViewCount = async (id: string) => {
    try {
      const sermonRef = doc(db, 'sermons', id)
      await updateDoc(sermonRef, {
        view_count: increment(1)
      })

      setSermons(prev => prev.map(sermon => 
        sermon.id === id 
          ? { ...sermon, view_count: sermon.view_count + 1 }
          : sermon
      ))

      return { error: null }
    } catch (err) {
      console.error('Error incrementing view count:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const toggleLike = async (sermonId: string) => {
    try {
      if (!user) {
        return { error: new Error('Usuario no autenticado') }
      }

      const likesRef = collection(db, 'sermon_likes')
      const q = query(likesRef, where('sermon_id', '==', sermonId), where('user_id', '==', user.uid))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        // Eliminar like
        const likeDoc = querySnapshot.docs[0]
        await deleteDoc(doc(db, 'sermon_likes', likeDoc.id))
        
        // Decrementar contador
        const sermonRef = doc(db, 'sermons', sermonId)
        await updateDoc(sermonRef, {
          like_count: increment(-1)
        })
      } else {
        // Agregar like
        await addDoc(likesRef, {
          sermon_id: sermonId,
          user_id: user.uid,
          created_at: serverTimestamp()
        })
        
        // Incrementar contador
        const sermonRef = doc(db, 'sermons', sermonId)
        await updateDoc(sermonRef, {
          like_count: increment(1)
        })
      }

      return { error: null }
    } catch (err) {
      console.error('Error toggling like:', err)
      return { error: err instanceof Error ? err : new Error('Unknown error occurred') }
    }
  }

  const refreshSermons = async () => {
    await fetchSermons()
  }

  return {
    sermons,
    loading,
    error,
    createSermon,
    updateSermon,
    deleteSermon,
    getSermonBySlug,
    incrementViewCount,
    toggleLike,
    refreshSermons
  }
}

// Hook específico para obtener un sermón por slug
export const useSermon = (slug: string) => {
  const [sermon, setSermon] = useState<Sermon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSermon = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        const sermonsRef = collection(db, 'sermons')
        const q = query(sermonsRef, where('slug', '==', slug))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setError('Sermón no encontrado')
          setSermon(null)
        } else {
          const doc = querySnapshot.docs[0]
          const data = doc.data()
          
          const sermonData: Sermon = {
            id: doc.id,
            ...data,
            created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
            updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at,
            preached_date: data.preached_date?.toDate?.()?.toISOString() || data.preached_date
          } as Sermon
          
          setSermon(sermonData)
        }
      } catch (err) {
        setError('Error al cargar sermón')
        console.error('Error fetching sermon:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSermon()
  }, [slug])

  return { sermon, loading, error }
}

// Hook para sermones destacados
export const useFeaturedSermons = (limit: number = 3) => {
  return useSermons({
    published: true,
    featured: true,
    limit
  })
}

// Hook para sermones recientes
export const useRecentSermons = (limit: number = 6) => {
  return useSermons({
    published: true,
    limit
  })
}

// Hook para sermones por predicador
export const useSermonsBySpeaker = (speaker: string) => {
  return useSermons({
    published: true,
    speaker
  })
}

// Hook para categorías de sermones
export const useSermonCategories = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; description?: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const categoriesRef = collection(db, 'sermon_categories')
        const q = query(
          categoriesRef, 
          where('is_active', '==', true),
          orderBy('name')
        )
        const querySnapshot = await getDocs(q)
        
        const categoriesData: { id: string; name: string; description?: string }[] = []
        querySnapshot.forEach((doc) => {
          categoriesData.push({
            id: doc.id,
            ...doc.data()
          } as { id: string; name: string; description?: string })
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