import { useState, useEffect } from 'react'
import { localAuth, type LocalUser as User, type LocalSession as Session } from '../lib/localAuth'
import { logError, AppError } from '../lib/errors'

// Tipo Profile compatible con el sistema local
export interface Profile {
  id: string
  full_name: string
  email: string
  role: 'admin' | 'pastor' | 'leader' | 'member' | 'editor'
  avatar_url?: string
  phone?: string
  bio?: string
  created_at: string
  updated_at?: string
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

// Función para convertir LocalUser a Profile
function userToProfile(user: User): Profile {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    avatar_url: user.avatar_url,
    phone: user.phone,
    bio: user.bio,
    created_at: user.created_at,
    updated_at: user.last_login
  }
}

export const useAuth = (): AuthState & AuthActions => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Obtener sesión inicial del sistema local
    const getInitialSession = async () => {
      try {
        const currentSession = localAuth.getSession()
        
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          setProfile(userToProfile(currentSession.user))
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

    // Verificar sesión periódicamente (cada 5 minutos)
    const interval = setInterval(() => {
      const currentSession = localAuth.getSession()
      if (!currentSession && user) {
        // Sesión expirada
        setUser(null)
        setProfile(null)
        setSession(null)
      }
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await localAuth.signIn(email, password)
      
      if (result) {
        setUser(result.user)
        setSession(result.session)
        setProfile(userToProfile(result.user))
        return { error: null }
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
      
      const result = await localAuth.signUp(email, password, userData.full_name)
      
      setUser(result.user)
      setSession(result.session)
      setProfile(userToProfile(result.user))
      
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
      
      localAuth.signOut()
      
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
      
      await localAuth.resetPassword(email)
      
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
      
      // Convertir updates de Profile a LocalUser
      const userUpdates: Partial<User> = {
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        phone: updates.phone,
        bio: updates.bio
      }
      
      const updatedUser = await localAuth.updateProfile(user.id, userUpdates)
      
      setUser(updatedUser)
      setProfile(userToProfile(updatedUser))
      
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