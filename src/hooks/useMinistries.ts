import { useState, useEffect, useCallback } from 'react'
import { type Ministry } from '../lib/supabase'
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

// Datos mock para ministerios
const getDefaultMinistries = (): Ministry[] => [
  {
    id: '1',
    slug: 'alabanza-y-adoracion',
    name: 'Alabanza y Adoración',
    description: 'Ministerio dedicado a dirigir la adoración en los servicios y eventos especiales',
    mission: 'Guiar a la congregación en adoración genuina a Dios',
    vision: 'Ser un ministerio que inspire corazones a adorar en espíritu y verdad',
    leader_id: 'user1',
    target_age_group: 'all',
    meeting_schedule: 'Domingos 8:00 AM - Ensayo, Domingos 10:00 AM - Servicio',
    location: 'Santuario Principal',
    contact_email: 'alabanza@iglesia.com',
    contact_phone: '+1234567890',
    requirements: ['Conocimiento básico de música', 'Compromiso con los ensayos', 'Corazón de adoración'],
    benefits: ['Crecimiento musical', 'Liderazgo en adoración', 'Comunidad musical'],
    is_active: true,
    is_recruiting: true,
    max_members: 15,
    current_members: 8,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    slug: 'jovenes',
    name: 'Ministerio de Jóvenes',
    description: 'Ministerio enfocado en el crecimiento espiritual y desarrollo de los jóvenes',
    mission: 'Formar jóvenes comprometidos con Cristo y su propósito',
    vision: 'Jóvenes que transformen su generación para Cristo',
    leader_id: 'user2',
    target_age_group: 'youth',
    meeting_schedule: 'Viernes 7:00 PM',
    location: 'Salón de Jóvenes',
    contact_email: 'jovenes@iglesia.com',
    contact_phone: '+1234567891',
    requirements: ['Edad entre 13-25 años', 'Deseo de crecer espiritualmente'],
    benefits: ['Amistad cristiana', 'Actividades recreativas', 'Formación bíblica'],
    is_active: true,
    is_recruiting: true,
    max_members: 50,
    current_members: 32,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '3',
    slug: 'ninos',
    name: 'Ministerio Infantil',
    description: 'Ministerio dedicado a la enseñanza y cuidado de los niños',
    mission: 'Enseñar a los niños el amor de Jesús de manera creativa y divertida',
    vision: 'Niños que conozcan y amen a Jesús desde temprana edad',
    leader_id: 'user3',
    target_age_group: 'children',
    meeting_schedule: 'Domingos 10:00 AM',
    location: 'Salón Infantil',
    contact_email: 'ninos@iglesia.com',
    contact_phone: '+1234567892',
    requirements: ['Amor por los niños', 'Paciencia', 'Creatividad'],
    benefits: ['Impacto en vidas jóvenes', 'Desarrollo de habilidades pedagógicas'],
    is_active: true,
    is_recruiting: true,
    max_members: 20,
    current_members: 12,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z'
  }
]

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

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400))

      // Obtener ministerios del localStorage o usar datos por defecto
      const storedMinistries = localStorage.getItem('ministries')
      let existingMinistries: Ministry[] = storedMinistries ? JSON.parse(storedMinistries) : getDefaultMinistries()

      // Guardar en localStorage si no existían
      if (!storedMinistries) {
        localStorage.setItem('ministries', JSON.stringify(existingMinistries))
      }

      // Aplicar filtros
      if (options?.active !== undefined) {
        existingMinistries = existingMinistries.filter(ministry => ministry.is_active === options.active)
      }

      if (options?.targetAgeGroup) {
        existingMinistries = existingMinistries.filter(ministry => 
          ministry.target_age_group === options.targetAgeGroup || ministry.target_age_group === 'all'
        )
      }

      // Ordenar por nombre
      existingMinistries.sort((a, b) => a.name.localeCompare(b.name))

      // Aplicar límite
      if (options?.limit) {
        existingMinistries = existingMinistries.slice(0, options.limit)
      }

      setMinistries(existingMinistries)
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
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      // Obtener ministerios del localStorage
      const storedMinistries = localStorage.getItem('ministries')
      const existingMinistries: Ministry[] = storedMinistries ? JSON.parse(storedMinistries) : getDefaultMinistries()

      // Crear nuevo ministerio con datos mock
      const newMinistry: Ministry = {
        ...ministryData,
        id: `ministry_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Agregar a la lista
      const updatedMinistries = [...existingMinistries, newMinistry]
      localStorage.setItem('ministries', JSON.stringify(updatedMinistries))

      // Actualizar estado local
      setMinistries(prev => [...prev, newMinistry])

      return { data: newMinistry, error: null }
    } catch (err) {
      console.error('Error creating ministry:', err)
      return { data: null, error: err as Error }
    }
  }

  const updateMinistry = async (id: string, updates: Partial<Ministry>) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      // Obtener ministerios del localStorage
      const storedMinistries = localStorage.getItem('ministries')
      const existingMinistries: Ministry[] = storedMinistries ? JSON.parse(storedMinistries) : getDefaultMinistries()

      // Encontrar y actualizar el ministerio
      const ministryIndex = existingMinistries.findIndex(ministry => ministry.id === id)
      if (ministryIndex === -1) {
        throw new Error('Ministerio no encontrado')
      }

      const updatedMinistry = {
        ...existingMinistries[ministryIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }

      existingMinistries[ministryIndex] = updatedMinistry
      localStorage.setItem('ministries', JSON.stringify(existingMinistries))

      // Actualizar estado local
      setMinistries(prev => prev.map(ministry => ministry.id === id ? updatedMinistry : ministry))

      return { data: updatedMinistry, error: null }
    } catch (err) {
      console.error('Error updating ministry:', err)
      return { data: null, error: err as Error }
    }
  }

  const deleteMinistry = async (id: string) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      // Obtener ministerios del localStorage
      const storedMinistries = localStorage.getItem('ministries')
      const existingMinistries: Ministry[] = storedMinistries ? JSON.parse(storedMinistries) : getDefaultMinistries()

      // Filtrar para remover el ministerio
      const updatedMinistries = existingMinistries.filter(ministry => ministry.id !== id)
      localStorage.setItem('ministries', JSON.stringify(updatedMinistries))

      // Actualizar estado local
      setMinistries(prev => prev.filter(ministry => ministry.id !== id))

      return { error: null }
    } catch (err) {
      console.error('Error deleting ministry:', err)
      return { error: err as Error }
    }
  }

  const getMinistryBySlug = async (slug: string) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300))

      // Obtener ministerios del localStorage
      const storedMinistries = localStorage.getItem('ministries')
      const existingMinistries: Ministry[] = storedMinistries ? JSON.parse(storedMinistries) : getDefaultMinistries()

      // Buscar el ministerio por slug
      const foundMinistry = existingMinistries.find(ministry => ministry.slug === slug)

      if (!foundMinistry) {
        return { data: null, error: new Error('Ministerio no encontrado') }
      }

      return { data: foundMinistry, error: null }
    } catch (err) {
      console.error('Error getting ministry by slug:', err)
      return { data: null, error: err as Error }
    }
  }

  const joinMinistry = async (ministryId: string, role: string = 'member') => {
    try {
      if (!user) {
        return { error: { message: 'Debes iniciar sesión para unirte a un ministerio' } as Error }
      }

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400))

      // Obtener miembros del localStorage
      const storedMembers = localStorage.getItem('ministry_members')
      const existingMembers: { ministryId: string; userId: string; role: string; isActive: boolean }[] = 
        storedMembers ? JSON.parse(storedMembers) : []

      // Verificar si ya es miembro
      const existingMember = existingMembers.find(member => 
        member.ministryId === ministryId && member.userId === user.id
      )

      if (existingMember) {
        return { error: { message: 'Ya eres miembro de este ministerio' } as Error }
      }

      // Agregar nuevo miembro
      existingMembers.push({
        ministryId,
        userId: user.id,
        role,
        isActive: true
      })

      localStorage.setItem('ministry_members', JSON.stringify(existingMembers))

      return { error: null }
    } catch (err) {
      console.error('Error joining ministry:', err)
      return { error: err as Error }
    }
  }

  const leaveMinistry = async (ministryId: string) => {
    try {
      if (!user) {
        return { error: { message: 'Debes iniciar sesión' } as Error }
      }

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400))

      // Obtener miembros del localStorage
      const storedMembers = localStorage.getItem('ministry_members')
      const existingMembers: { ministryId: string; userId: string; role: string; isActive: boolean }[] = 
        storedMembers ? JSON.parse(storedMembers) : []

      // Filtrar para remover al usuario del ministerio
      const updatedMembers = existingMembers.filter(member => 
        !(member.ministryId === ministryId && member.userId === user.id)
      )

      localStorage.setItem('ministry_members', JSON.stringify(updatedMembers))

      return { error: null }
    } catch (err) {
      console.error('Error leaving ministry:', err)
      return { error: err as Error }
    }
  }

  const getMinistryMembers = async (ministryId: string) => {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300))

      // Obtener miembros del localStorage
      const storedMembers = localStorage.getItem('ministry_members')
      const existingMembers: { ministryId: string; userId: string; role: string; isActive: boolean }[] = 
        storedMembers ? JSON.parse(storedMembers) : []

      // Filtrar miembros del ministerio específico
      const ministryMembers = existingMembers
        .filter(member => member.ministryId === ministryId && member.isActive)
        .map(member => ({
          id: member.userId,
          name: `Usuario ${member.userId}`,
          role: member.role
        }))

      return { data: ministryMembers, error: null }
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

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300))

        // Obtener ministerios del localStorage
        const storedMinistries = localStorage.getItem('ministries')
        const ministries: Ministry[] = storedMinistries ? JSON.parse(storedMinistries) : getDefaultMinistries()

        // Buscar ministerio por slug
        const foundMinistry = ministries.find(m => m.slug === slug)

        if (!foundMinistry) {
          setError('Ministerio no encontrado')
        } else {
          setMinistry(foundMinistry)
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

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 200))

        // Configuraciones públicas simuladas
        const mockSettings = {
          church_name: 'Iglesia Cristiana Central',
          church_address: 'Calle Principal 123, Ciudad',
          church_phone: '+1234567890',
          church_email: 'info@iglesia.com',
          service_times: 'Domingos 10:00 AM y 6:00 PM',
          welcome_message: 'Bienvenidos a nuestra iglesia'
        }

        setSettings(mockSettings)
      } catch (err) {
        setError('Error al cargar configuraciones')
        console.error('Error fetching settings:', err)
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