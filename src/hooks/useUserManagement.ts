import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  password_hash?: string
  full_name: string
  avatar_url?: string
  role: string
  created_at: string
  updated_at: string
}

interface UserFormData {
  email: string
  full_name: string
  role: string
  avatar_url?: string
  password?: string
}

interface UserStats {
  total: number
  admins: number
  users: number
  newThisMonth: number
}

interface UseUserManagementReturn {
  users: User[]
  stats: UserStats | null
  loading: boolean
  error: string | null
  createUser: (userData: UserFormData) => Promise<void>
  updateUser: (userId: string, userData: Partial<UserFormData>) => Promise<void>
  deleteUser: (userId: string) => Promise<void>
  refreshUsers: () => Promise<void>
  clearError: () => void
}

// Función helper para hacer requests usando MCP PostgREST
// Función auxiliar para manejar errores de Supabase
const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Error in ${operation}:`, error)
  throw new Error(`Error en ${operation}: ${error.message || 'Error desconocido'}`)
}

export const useUserManagement = (): UseUserManagementReturn => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener todos los usuarios usando Supabase directamente
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id,email,full_name,role,created_at,updated_at')
        .order('created_at', { ascending: false })
      
      if (error) {
        handleSupabaseError(error, 'cargar usuarios')
        return
      }
      
      setUsers(usersData || [])
      
      // Calcular estadísticas
      if (usersData && Array.isArray(usersData)) {
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const userStats: UserStats = {
          total: usersData.length,
          admins: usersData.filter(user => user.role === 'admin').length,
          users: usersData.filter(user => user.role === 'user').length,
          newThisMonth: usersData.filter(user => 
            new Date(user.created_at) >= firstDayOfMonth
          ).length
        }
        
        setStats(userStats)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = useCallback(async (userData: UserFormData) => {
    try {
      setError(null)
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        handleSupabaseError(error, 'crear usuario')
        return
      }
      
      if (newUser) {
        setUsers(prev => [newUser, ...prev])
        
        // Actualizar estadísticas
        setStats(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          admins: userData.role === 'admin' ? prev.admins + 1 : prev.admins,
          users: userData.role === 'user' ? prev.users + 1 : prev.users,
          newThisMonth: prev.newThisMonth + 1
        } : null)
      }
    } catch (err) {
      console.error('Error creating user:', err)
      setError('Error al crear el usuario')
      throw err
    }
  }, [])

  const updateUser = useCallback(async (userId: string, userData: Partial<UserFormData>) => {
    try {
      setError(null)
      
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) {
        handleSupabaseError(error, 'actualizar usuario')
        return
      }
      
      if (updatedUser) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ...updatedUser } : user
        ))
        
        // Si cambió el rol, actualizar estadísticas
        if (userData.role) {
          await fetchUsers() // Refrescar para recalcular estadísticas
        }
      }
    } catch (err) {
      console.error('Error updating user:', err)
      setError('Error al actualizar el usuario')
      throw err
    }
  }, [fetchUsers])

  const deleteUser = useCallback(async (userId: string) => {
    try {
      setError(null)
      
      const userToDelete = users.find(user => user.id === userId)
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
      
      if (error) {
        handleSupabaseError(error, 'eliminar usuario')
        return
      }
      
      setUsers(prev => prev.filter(user => user.id !== userId))
      
      // Actualizar estadísticas
      if (userToDelete && stats) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          admins: userToDelete.role === 'admin' ? Math.max(0, prev.admins - 1) : prev.admins,
          users: userToDelete.role === 'user' ? Math.max(0, prev.users - 1) : prev.users
        } : null)
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Error al eliminar el usuario')
      throw err
    }
  }, [users, stats])

  const refreshUsers = useCallback(async () => {
    await fetchUsers()
  }, [fetchUsers])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    stats,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
    clearError
  }
}