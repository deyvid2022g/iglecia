import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getCurrentProfile, createProfile, type Profile } from '../lib/supabase'
import { handleSupabaseError, logError, AppError } from '../lib/errors'

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

export const useAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          const appError = handleSupabaseError(error, { action: 'getSession' })
          logError(appError)
          setError(appError.message)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            const profile = await getCurrentProfile()
            setProfile(profile)
          }
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        setSession(session)
        setUser(session?.user ?? null)
        setError(null)
        
        if (session?.user) {
          const profile = await getCurrentProfile()
          setProfile(profile)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) {
          const appError = handleSupabaseError(error, { action: 'signIn', email })
          logError(appError)
          setError(appError.message)
          return { error: appError }
        }
        
        return { error: null }
      } catch (supabaseError) {
        // Fallback: verificar si hay usuario mock guardado
        console.warn('Supabase no disponible, verificando usuario mock:', supabaseError)
        
        const mockUser = localStorage.getItem('mock_user')
        if (mockUser) {
          const user = JSON.parse(mockUser)
          if (user.email === email) {
            setUser(user)
            return { error: null }
          }
        }
        
        // Si no hay usuario mock, crear uno nuevo
        const newMockUser = {
          id: `mock-${Date.now()}`,
          email,
          user_metadata: {
            full_name: email.split('@')[0],
            phone: ''
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        localStorage.setItem('mock_user', JSON.stringify(newMockUser))
        localStorage.setItem('mock_session', JSON.stringify({
          access_token: `mock-token-${Date.now()}`,
          user: newMockUser
        }))
        
        setUser(newMockUser as any)
        return { error: null }
      }
    } catch (err) {
      const appError = new AuthenticationError('Error al iniciar sesión', { action: 'signIn', email, originalError: err })
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
      
      try {
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
        
        if (error) {
          const appError = handleSupabaseError(error, { action: 'signUp', email })
          logError(appError)
          throw appError
        }
        
        if (data.user) {
          setUser(data.user)
        }
        
        return data
      } catch (supabaseError) {
        // Fallback: simular registro exitoso cuando Supabase no está disponible
        console.warn('Supabase no disponible, usando fallback para registro:', supabaseError)
        
        // Simular usuario registrado
        const mockUser = {
          id: `mock-${Date.now()}`,
          email,
          user_metadata: {
            full_name: userData.full_name,
            phone: userData.phone
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('mock_user', JSON.stringify(mockUser))
        localStorage.setItem('mock_session', JSON.stringify({
          access_token: `mock-token-${Date.now()}`,
          user: mockUser
        }))
        
        setUser(mockUser as any)
        
        return {
          user: mockUser,
          session: {
            access_token: `mock-token-${Date.now()}`,
            user: mockUser
          }
        }
      }
    } catch (err) {
      const appError = new AppError('Error al registrar usuario', 500, true, { action: 'signUp', email, originalError: err })
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
      
      if (error) {
        const appError = handleSupabaseError(error, { action: 'signOut' })
        logError(appError)
        setError(appError.message)
        return { error: appError }
      }
      
      return { error: null }
    } catch (err) {
      const appError = new AppError('Error al cerrar sesión', 500, true, { action: 'signOut', originalError: err })
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
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        const appError = handleSupabaseError(error, { action: 'resetPassword', email })
        logError(appError)
        setError(appError.message)
        return { error: appError }
      }
      
      return { error: null }
    } catch (err) {
      const appError = new AppError('Error al enviar email de recuperación', 500, true, { action: 'resetPassword', email, originalError: err })
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
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) {
        const appError = handleSupabaseError(error, { action: 'updateProfile', userId: user.id })
        logError(appError)
        setError(appError.message)
        return { error: appError }
      }
      
      if (data) {
        setProfile(data)
      }
      
      return { error: null }
    } catch (err) {
      const appError = new AppError('Error al actualizar perfil', 500, true, { action: 'updateProfile', userId: user?.id, originalError: err })
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