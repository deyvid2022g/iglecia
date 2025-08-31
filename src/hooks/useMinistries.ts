import { useState, useEffect, useCallback } from 'react'
import { supabase, type Ministry } from '../lib/supabase'
import { useAuth } from './useAuth'

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

      let query = supabase
        .from('ministries')
        .select(`
          *,
          profiles!ministries_leader_id_fkey(
            name,
            avatar_url,
            email
          )
        `)
        .order('display_order', { ascending: true })

      // Aplicar filtros
      if (options?.active !== undefined) {
        query = query.eq('is_active', options.active)
      }

      if (options?.targetAgeGroup) {
        query = query.eq('target_age_group', options.targetAgeGroup)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
        console.error('Error fetching ministries:', error)
      } else {
        setMinistries(data || [])
      }
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
      const { data, error } = await supabase
        .from('ministries')
        .insert(ministryData)
        .select()
        .single()

      if (!error && data) {
        setMinistries(prev => [...prev, data].sort((a, b) => a.display_order - b.display_order))
      }

      return { data, error }
    } catch (err) {
      console.error('Error creating ministry:', err)
      return { data: null, error: err }
    }
  }

  const updateMinistry = async (id: string, updates: Partial<Ministry>) => {
    try {
      const { data, error } = await supabase
        .from('ministries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (!error && data) {
        setMinistries(prev => prev.map(ministry => ministry.id === id ? data : ministry))
      }

      return { data, error }
    } catch (err) {
      console.error('Error updating ministry:', err)
      return { data: null, error: err }
    }
  }

  const deleteMinistry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ministries')
        .delete()
        .eq('id', id)

      if (!error) {
        setMinistries(prev => prev.filter(ministry => ministry.id !== id))
      }

      return { error }
    } catch (err) {
      console.error('Error deleting ministry:', err)
      return { error: err }
    }
  }

  const getMinistryBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select(`
          *,
          profiles!ministries_leader_id_fkey(
            name,
            avatar_url,
            email,
            bio
          ),
          ministry_activities(
            id,
            title,
            description,
            schedule,
            location,
            icon,
            is_active
          )
        `)
        .eq('slug', slug)
        .single()

      return { data, error }
    } catch (err) {
      console.error('Error getting ministry by slug:', err)
      return { data: null, error: err }
    }
  }

  const joinMinistry = async (ministryId: string, role: string = 'member') => {
    try {
      if (!user) {
        return { error: { message: 'Debes iniciar sesión para unirte a un ministerio' } }
      }

      const { error } = await supabase
        .from('ministry_members')
        .insert({
          ministry_id: ministryId,
          user_id: user.id,
          role,
          is_active: true
        })

      return { error }
    } catch (err) {
      console.error('Error joining ministry:', err)
      return { error: err }
    }
  }

  const leaveMinistry = async (ministryId: string) => {
    try {
      if (!user) {
        return { error: { message: 'Debes iniciar sesión' } }
      }

      const { error } = await supabase
        .from('ministry_members')
        .update({ is_active: false })
        .eq('ministry_id', ministryId)
        .eq('user_id', user.id)

      return { error }
    } catch (err) {
      console.error('Error leaving ministry:', err)
      return { error: err }
    }
  }

  const getMinistryMembers = async (ministryId: string) => {
    try {
      const { data, error } = await supabase
        .from('ministry_members')
        .select(`
          *,
          profiles(
            name,
            avatar_url,
            email
          )
        `)
        .eq('ministry_id', ministryId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false })

      return { data, error }
    } catch (err) {
      console.error('Error getting ministry members:', err)
      return { data: null, error: err }
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

        const { data, error } = await supabase
          .from('ministries')
          .select(`
            *,
            profiles!ministries_leader_id_fkey(
              name,
              avatar_url,
              email,
              bio
            ),
            ministry_activities(
              id,
              title,
              description,
              schedule,
              location,
              icon,
              is_active
            )
          `)
          .eq('slug', slug)
          .single()

        if (error) {
          setError(error.message)
        } else {
          setMinistry(data)
        }
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

        const { data, error } = await supabase
          .from('church_settings')
          .select('*')
          .eq('is_public', true)

        if (error) {
          setError(error.message)
        } else {
          const settingsObj = (data || []).reduce((acc, setting) => {
            let value = setting.value
            
            if (setting.type === 'number') {
              value = parseFloat(value)
            } else if (setting.type === 'boolean') {
              value = value === 'true'
            } else if (setting.type === 'json') {
              try {
                value = JSON.parse(value)
              } catch {
                value = setting.value
              }
            }
            
            acc[setting.key] = value
            return acc
          }, {} as Record<string, unknown>)
          
          setSettings(settingsObj)
        }
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