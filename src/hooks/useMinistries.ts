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

export interface Ministry {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string;
  leader_id?: string;
  target_age_group?: string;
  meeting_day?: string;
  meeting_time?: string;
  meeting_location?: string;
  contact_email?: string;
  contact_phone?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  requirements?: string;
  benefits?: string;
  social_links?: Record<string, string>;
}

export interface MinistriesState {
  ministries: Ministry[]
  loading: boolean
  error: string | null
}

export interface MinistriesActions {
  createMinistry: (ministryData: Omit<Ministry, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Ministry | null; error: Error | null }>
  updateMinistry: (id: string, updates: Partial<Ministry>) => Promise<{ data: Ministry | null; error: Error | null }>
  deleteMinistry: (id: string) => Promise<{ error: Error | null }>
  getMinistryBySlug: (slug: string) => Promise<{ data: Ministry | null; error: Error | null }>
  joinMinistry: (ministryId: string, role?: string) => Promise<{ error: Error | null }>
  leaveMinistry: (ministryId: string) => Promise<{ error: Error | null }>
  getMinistryMembers: (ministryId: string) => Promise<{ data: { id: string; name: string; role: string }[] | null; error: Error | null }>
  refreshMinistries: () => Promise<void>
}

export const useMinistries = (options?: {
  active?: boolean
  targetAgeGroup?: string
  limit?: number
}): MinistriesState & MinistriesActions => {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchMinistries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const ministriesRef = collection(db, 'ministries')
      let q = query(ministriesRef, orderBy('display_order', 'asc'))

      // Aplicar filtros
      if (options?.active !== undefined) {
        q = query(q, where('is_active', '==', options.active))
      }

      if (options?.targetAgeGroup) {
        q = query(q, where('target_age_group', '==', options.targetAgeGroup))
      }

      if (options?.limit) {
        q = query(q, firestoreLimit(options.limit))
      }

      const querySnapshot = await getDocs(q)
      const ministriesData: Ministry[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        ministriesData.push({
          id: doc.id,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          name: data.name,
          slug: data.slug,
          description: data.description,
          leader_id: data.leader_id,
          target_age_group: data.target_age_group,
          meeting_day: data.meeting_day,
          meeting_time: data.meeting_time,
          meeting_location: data.meeting_location,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          image_url: data.image_url,
          is_active: data.is_active,
          display_order: data.display_order || 0,
          requirements: data.requirements,
          benefits: data.benefits,
          social_links: data.social_links || {}
        })
      })
      
      setMinistries(ministriesData)
    } catch (err) {
      setError('Error al cargar ministerios')
      console.error('Error in fetchMinistries:', err)
    } finally {
      setLoading(false)
    }
  }, [options?.active, options?.targetAgeGroup, options?.limit])

  useEffect(() => {
    fetchMinistries()
  }, [fetchMinistries, options?.active, options?.targetAgeGroup, options?.limit])

  const createMinistry = async (ministryData: Omit<Ministry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const ministriesRef = collection(db, 'ministries')
      const docRef = await addDoc(ministriesRef, {
        ...ministryData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })

      const newDoc = await getDoc(docRef)
      if (newDoc.exists()) {
        const data = newDoc.data()
        const newMinistry: Ministry = {
          id: newDoc.id,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          name: data.name,
          slug: data.slug,
          description: data.description,
          leader_id: data.leader_id,
          target_age_group: data.target_age_group,
          meeting_day: data.meeting_day,
          meeting_time: data.meeting_time,
          meeting_location: data.meeting_location,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          image_url: data.image_url,
          is_active: data.is_active,
          display_order: data.display_order || 0,
          requirements: data.requirements,
          benefits: data.benefits,
          social_links: data.social_links || {}
        }
        
        setMinistries(prev => [...prev, newMinistry].sort((a, b) => a.display_order - b.display_order))
        return { data: newMinistry, error: null }
      }

      return { data: null, error: new Error('Failed to create ministry') }
    } catch (err) {
      console.error('Error creating ministry:', err)
      return { data: null, error: err as Error }
    }
  }

  const updateMinistry = async (id: string, updates: Partial<Ministry>) => {
    try {
      const ministryRef = doc(db, 'ministries', id)
      await updateDoc(ministryRef, {
        ...updates,
        updated_at: serverTimestamp()
      })

      const updatedDoc = await getDoc(ministryRef)
      if (updatedDoc.exists()) {
        const data = updatedDoc.data()
        const updatedMinistry: Ministry = {
          id: updatedDoc.id,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          name: data.name,
          slug: data.slug,
          description: data.description,
          leader_id: data.leader_id,
          target_age_group: data.target_age_group,
          meeting_day: data.meeting_day,
          meeting_time: data.meeting_time,
          meeting_location: data.meeting_location,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          image_url: data.image_url,
          is_active: data.is_active,
          display_order: data.display_order || 0,
          requirements: data.requirements,
          benefits: data.benefits,
          social_links: data.social_links || {}
        }
        
        setMinistries(prev => prev.map(ministry => ministry.id === id ? updatedMinistry : ministry))
        return { data: updatedMinistry, error: null }
      }

      return { data: null, error: new Error('Ministry not found') }
    } catch (err) {
      console.error('Error updating ministry:', err)
      return { data: null, error: err as Error }
    }
  }

  const deleteMinistry = async (id: string) => {
    try {
      const ministryRef = doc(db, 'ministries', id)
      await deleteDoc(ministryRef)
      
      setMinistries(prev => prev.filter(ministry => ministry.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting ministry:', err)
      return { error: err as Error }
    }
  }

  const getMinistryBySlug = async (slug: string) => {
    try {
      const ministriesRef = collection(db, 'ministries')
      const q = query(ministriesRef, where('slug', '==', slug))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return { data: null, error: new Error('Ministry not found') }
      }
      
      const doc = querySnapshot.docs[0]
      const data = doc.data()
      const ministry: Ministry = {
        id: doc.id,
        created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        name: data.name,
        slug: data.slug,
        description: data.description,
        leader_id: data.leader_id,
        target_age_group: data.target_age_group,
        meeting_day: data.meeting_day,
        meeting_time: data.meeting_time,
        meeting_location: data.meeting_location,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        image_url: data.image_url,
        is_active: data.is_active,
        display_order: data.display_order || 0,
        requirements: data.requirements,
        benefits: data.benefits,
        social_links: data.social_links || {}
      }

      return { data: ministry, error: null }
    } catch (err) {
      console.error('Error getting ministry by slug:', err)
      return { data: null, error: err as Error }
    }
  }

  const joinMinistry = async (ministryId: string, role: string = 'member') => {
    try {
      if (!user) {
        return { error: new Error('Debes iniciar sesión para unirte a un ministerio') }
      }

      const ministryMembersRef = collection(db, 'ministry_members')
      await addDoc(ministryMembersRef, {
        ministry_id: ministryId,
        user_id: user.uid,
        role,
        is_active: true,
        joined_at: serverTimestamp()
      })

      return { error: null }
    } catch (err) {
      console.error('Error joining ministry:', err)
      return { error: err as Error }
    }
  }

  const leaveMinistry = async (ministryId: string) => {
    try {
      if (!user) {
        return { error: new Error('Debes iniciar sesión') }
      }

      const ministryMembersRef = collection(db, 'ministry_members')
      const q = query(
        ministryMembersRef, 
        where('ministry_id', '==', ministryId),
        where('user_id', '==', user.uid)
      )
      const querySnapshot = await getDocs(q)
      
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { is_active: false })
      )
      
      await Promise.all(updatePromises)
      return { error: null }
    } catch (err) {
      console.error('Error leaving ministry:', err)
      return { error: err as Error }
    }
  }

  const getMinistryMembers = async (ministryId: string) => {
    try {
      const ministryMembersRef = collection(db, 'ministry_members')
      const q = query(
        ministryMembersRef,
        where('ministry_id', '==', ministryId),
        where('is_active', '==', true),
        orderBy('joined_at', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const membersData: { id: string; name: string; role: string }[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        membersData.push({
          id: doc.id,
          name: data.name || 'Usuario',
          role: data.role || 'member'
        })
      })

      return { data: membersData, error: null }
    } catch (err) {
      console.error('Error getting ministry members:', err)
      return { data: null, error: err as Error }
    }
  }

  const refreshMinistries = async () => {
    await fetchMinistries()
  }

  return {
    ministries,
    loading,
    error,
    createMinistry,
    updateMinistry,
    deleteMinistry,
    getMinistryBySlug,
    joinMinistry,
    leaveMinistry,
    getMinistryMembers,
    refreshMinistries
  }
}

// Hook específico para obtener un ministerio por slug
export const useMinistry = (slug: string) => {
  const [ministry, setMinistry] = useState<Ministry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMinistry = async () => {
      if (!slug) return

      try {
        setLoading(true)
        setError(null)

        const ministriesRef = collection(db, 'ministries')
        const q = query(ministriesRef, where('slug', '==', slug))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setError('Ministerio no encontrado')
          setMinistry(null)
          return
        }
        
        const doc = querySnapshot.docs[0]
        const data = doc.data()
        const ministryData: Ministry = {
          id: doc.id,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          name: data.name,
          slug: data.slug,
          description: data.description,
          leader_id: data.leader_id,
          target_age_group: data.target_age_group,
          meeting_day: data.meeting_day,
          meeting_time: data.meeting_time,
          meeting_location: data.meeting_location,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          image_url: data.image_url,
          is_active: data.is_active,
          display_order: data.display_order || 0,
          requirements: data.requirements,
          benefits: data.benefits,
          social_links: data.social_links || {}
        }
        
        setMinistry(ministryData)
      } catch (err) {
        setError('Error al cargar ministerio')
        console.error('Error fetching ministry:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMinistry()
  }, [slug])

  return { ministry, loading, error }
}

// Hook para ministerios activos
export const useActiveMinistries = () => {
  return useMinistries({
    active: true
  })
}

// Hook para ministerios por grupo de edad
export const useMinistriesByAgeGroup = (ageGroup: string) => {
  return useMinistries({
    active: true,
    targetAgeGroup: ageGroup
  })
}

// Hook para configuraciones públicas de la iglesia
export const usePublicChurchSettings = () => {
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)

        const settingsRef = collection(db, 'church_settings')
        const q = query(settingsRef, where('is_public', '==', true))
        const querySnapshot = await getDocs(q)
        
        const settingsObj: Record<string, unknown> = {}
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          let value = data.value
          
          if (data.type === 'number') {
            value = parseFloat(value)
          } else if (data.type === 'boolean') {
            value = value === 'true'
          } else if (data.type === 'json') {
            try {
              value = JSON.parse(value)
            } catch {
              value = data.value
            }
          }
          
          settingsObj[data.key] = value
        })
        
        setSettings(settingsObj)
      } catch (err) {
        setError('Error al cargar configuraciones')
        console.error('Error fetching church settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const getSetting = (key: string, defaultValue?: unknown) => {
    return settings[key] ?? defaultValue
  }

  return {
    settings,
    loading,
    error,
    getSetting
  }
}