import { useState, useEffect } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { logError, AppError } from '../lib/errors'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'admin' | 'pastor' | 'editor' | 'leader' | 'member'
  created_at: string
  updated_at: string
  last_login?: string
}

export interface AuthState {
  user: User | null
  profile: Profile | null
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get user profile from Firestore
  const getUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', userId))
      if (profileDoc.exists()) {
        return profileDoc.data() as Profile
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Helper function to create user profile in Firestore
  const createUserProfile = async (user: User, userData: { full_name: string; phone?: string }): Promise<Profile> => {
    const profile: Profile = {
      id: user.uid,
      email: user.email!,
      full_name: userData.full_name,
      phone: userData.phone,
      role: 'member',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await setDoc(doc(db, 'profiles', user.uid), profile)
    return profile
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email)
      
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Obtener perfil del usuario
        const userProfile = await getUserProfile(firebaseUser.uid)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error: AppError | null }> => {
    try {
      setLoading(true)
      setError(null)
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user) {
        // Actualizar last_login en el perfil
        try {
          await updateDoc(doc(db, 'profiles', user.uid), {
            last_login: serverTimestamp()
          })
        } catch (updateError) {
          console.warn('Error updating last_login:', updateError)
          // No fallar el login por este error
        }
      }

      return { error: null }
    } catch (err: any) {
      const appError = new AppError(
        err.code === 'auth/user-not-found' ? 'Usuario no encontrado' :
        err.code === 'auth/wrong-password' ? 'Contraseña incorrecta' :
        err.code === 'auth/invalid-email' ? 'Email inválido' :
        err.code === 'auth/user-disabled' ? 'Usuario deshabilitado' :
        'Error al iniciar sesión',
        400,
        true,
        { action: 'signIn', email, firebaseCode: err.code }
      )
      logError(appError, { originalError: err })
      setError(appError.message)
      
      return { error: appError }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: { full_name: string; phone?: string }): Promise<{ error: AppError | null }> => {
    try {
      setLoading(true)
      setError(null)
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user) {
        // Actualizar el perfil de Firebase Auth
        await firebaseUpdateProfile(user, {
          displayName: userData.full_name
        })

        // Crear perfil en Firestore
        try {
          await createUserProfile(user, userData)
        } catch (profileError) {
          console.warn('Error creating profile:', profileError)
          // No fallar el registro por este error
        }
      }

      return { error: null }
    } catch (err: any) {
      const appError = new AppError(
        err.code === 'auth/email-already-in-use' ? 'El email ya está en uso' :
        err.code === 'auth/weak-password' ? 'La contraseña es muy débil' :
        err.code === 'auth/invalid-email' ? 'Email inválido' :
        'Error al registrarse',
        400,
        true,
        { action: 'signUp', email, firebaseCode: err.code }
      )
      logError(appError, { originalError: err })
      setError(appError.message)
      return { error: appError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<{ error: AppError | null }> => {
    try {
      setLoading(true)
      setError(null)
      
      await firebaseSignOut(auth)
      
      // Limpiar estado local
      setUser(null)
      setProfile(null)
      
      return { error: null }
    } catch (err: any) {
      const appError = new AppError(
        'Error al cerrar sesión',
        500,
        true,
        { action: 'signOut', firebaseCode: err.code }
      )
      logError(appError, { originalError: err })
      setError(appError.message)
      return { error: appError }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<{ error: AppError | null }> => {
    try {
      setLoading(true)
      setError(null)
      
      await sendPasswordResetEmail(auth, email)
      
      return { error: null }
    } catch (err: any) {
      const appError = new AppError(
        err.code === 'auth/user-not-found' ? 'Usuario no encontrado' :
        err.code === 'auth/invalid-email' ? 'Email inválido' :
        'Error al enviar email de recuperación',
        400,
        true,
        { action: 'resetPassword', email, firebaseCode: err.code }
      )
      logError(appError, { originalError: err })
      setError(appError.message)
      return { error: appError }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>): Promise<{ error: AppError | null }> => {
    try {
      if (!user) {
        const appError = new AppError('Usuario no autenticado', 401, false, { action: 'updateProfile' })
        setError(appError.message)
        return { error: appError }
      }
      
      setLoading(true)
      setError(null)
      
      await updateDoc(doc(db, 'profiles', user.uid), {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      // Actualizar estado local
      if (profile) {
        setProfile({
          ...profile,
          ...updates,
          updated_at: new Date().toISOString()
        })
      }
      
      return { error: null }
    } catch (err: any) {
      const appError = new AppError(
        'Error al actualizar perfil',
        500,
        true,
        { action: 'updateProfile', userId: user?.uid, firebaseCode: err.code }
      )
      logError(appError, { originalError: err })
      setError(appError.message)
      return { error: appError }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile
  }
}

// Hook para obtener el rol del usuario actual
export const useRole = () => {
  const { profile } = useAuth()
  return profile?.role || 'member'
}

// Hook para verificar permisos
export const usePermissions = () => {
  const role = useRole()
  
  const permissions = {
    canManageUsers: ['admin'].includes(role),
    canManageContent: ['admin', 'pastor', 'editor'].includes(role),
    canViewReports: ['admin', 'pastor'].includes(role),
    canManageEvents: ['admin', 'pastor', 'editor', 'leader'].includes(role),
    canViewMembers: ['admin', 'pastor', 'leader'].includes(role)
  }
  
  return permissions
}