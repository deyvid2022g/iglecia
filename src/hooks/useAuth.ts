import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'
import { logError, AppError } from '../lib/errors'

// Tipos de Supabase
type User = Database['public']['Tables']['users']['Row']
type Session = any // Tipo de sesión de Supabase

// Tipo Profile compatible con Supabase
export interface Profile {
  id: string
  full_name: string | null
  email: string
  role: string
  avatar_url: string | null
  last_login: string | null
  created_at: string
  updated_at: string
}

// Clase de error de autenticación
class AuthenticationError extends AppError {
  constructor(message: string, context?: any) {
    super(message, 401, true, context)
    this.name = 'AuthenticationError'
  }
}

export interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: AppError | null }>
  signUp: (email: string, password: string, userData: { full_name: string; phone?: string }) => Promise<{ error: AppError | null }>
  signOut: () => Promise<{ error: AppError | null }>
  resetPassword: (email: string) => Promise<{ error: AppError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: AppError | null }>
}

// Función para convertir User de Supabase a Profile
function userToProfile(user: User): Profile {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
    last_login: user.last_login,
    created_at: user.created_at,
    updated_at: user.updated_at
  }
}

export const useAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Obtener sesión inicial de Supabase
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setSession(session)
          
          // Obtener perfil del usuario
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error) throw error
          
          setUser(profile)
          setProfile(userToProfile(profile))
        }
      } catch (err) {
        const appError = new AppError('Error al obtener la sesión', 500, true, { action: 'getInitialSession' })
        logError(appError, { originalError: err })
        setError(appError.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(session)
        
        // Obtener perfil del usuario
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (!error && profile) {
          setUser(profile)
          setProfile(userToProfile(profile))
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setSession(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      if (data.user) {
        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) throw profileError
        
        setUser(profile)
        setSession(data.session)
        setProfile(userToProfile(profile))
      }
      
      return { error: null }
    } catch (err: any) {
      const appError = new AuthenticationError(err.message || 'Error al iniciar sesión', { action: 'signIn', email, originalError: err })
      logError(appError)
      setError(appError.message)
      return { error: appError }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: { full_name: string; phone?: string }) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone
          }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        // El perfil se creará automáticamente por el trigger de la base de datos
        // Intentar obtener el perfil
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (!profileError && profile) {
          setUser(profile)
          setSession(data.session)
          setProfile(userToProfile(profile))
        }
      }
      
      return { error: null }
    } catch (err: any) {
      const appError = new AppError(err.message || 'Error al registrar usuario', 500, true, { action: 'signUp', email, originalError: err })
      logError(appError)
      setError(appError.message)
      return { error: appError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      setUser(null)
      setSession(null)
      setProfile(null)
      
      return { error: null }
    } catch (err: any) {
      const appError = new AppError(err.message || 'Error al cerrar sesión', 500, true, { action: 'signOut', originalError: err })
      logError(appError)
      setError(appError.message)
      return { error: appError }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      
      if (error) throw error
      
      return { error: null }
    } catch (err: any) {
      const appError = new AppError(err.message || 'Error al enviar email de recuperación', 500, true, { action: 'resetPassword', email, originalError: err })
      logError(appError)
      setError(appError.message)
      return { error: appError }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null)
      
      if (!user) {
        const appError = new AuthenticationError('Usuario no autenticado', { action: 'updateProfile' })
        logError(appError)
        setError(appError.message)
        return { error: appError }
      }
      
      // Actualizar perfil en Supabase
      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update({
          full_name: updates.full_name,
          avatar_url: updates.avatar_url
        })
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) throw error
      
      setUser(updatedProfile)
      setProfile(userToProfile(updatedProfile))
      
      return { error: null }
    } catch (err: any) {
      const appError = new AppError(err.message || 'Error al actualizar perfil', 500, true, { action: 'updateProfile', userId: user?.id, originalError: err })
      logError(appError)
      setError(appError.message)
      return { error: appError }
    }
  }

  return {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  }
}

// Hook para verificar si el usuario tiene un rol específico
export const useRole = (requiredRole?: string | string[]) => {
  const { profile, loading } = useAuth()
  
  const hasRole = () => {
    if (!profile || !requiredRole) return true
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(profile.role)
    }
    
    return profile.role === requiredRole
  }
  
  return {
    hasRole: hasRole(),
    role: profile?.role,
    loading
  }
}

// Hook para verificar permisos específicos
export const usePermissions = () => {
  const { profile } = useAuth()
  
  const canManageEvents = profile?.role === 'admin' || profile?.role === 'pastor' || profile?.role === 'leader'
  const canManageSermons = profile?.role === 'admin' || profile?.role === 'pastor'
const canManageBlog = ['admin', 'pastor', 'editor'].includes(profile?.role ?? '')
  const canManageUsers = profile?.role === 'admin' || profile?.role === 'pastor'
  const canManageSettings = profile?.role === 'admin'
  
  return {
    canManageEvents,
    canManageSermons,
    canManageBlog,
    canManageUsers,
    canManageSettings,
    isAdmin: profile?.role === 'admin',
    isPastor: profile?.role === 'pastor',
    isEditor: profile?.role === 'editor' as string,
    isMember: profile?.role === 'member'
  }
}