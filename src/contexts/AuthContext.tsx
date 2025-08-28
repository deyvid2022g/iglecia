import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { getAuthErrorMessage } from '../utils/authUtils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pastor' | 'editor' | 'member';
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Eliminamos la interfaz UserData ya que es idéntica a User y no es necesaria

interface UserMetadata {
  name?: string;
  role?: 'admin' | 'pastor' | 'editor' | 'member';
  avatar_url?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ya no necesitamos los usuarios simulados, ahora usamos Supabase

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [_session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Verificar si hay una sesión activa en Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoading(true);
        
        if (session?.user) {
          // Obtener los metadatos del usuario desde Supabase
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single<User>();

          if (userData && !error) {
            setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userData.name || '',
            role: userData.role || 'member',
            avatar_url: userData.avatar_url,
            phone: userData.phone,
            created_at: userData.created_at || new Date().toISOString(),
            updated_at: userData.updated_at || new Date().toISOString()
          });
          } else {
            // Si no hay datos en la tabla users, crear un usuario básico
            const userMetadata = session.user.user_metadata as UserMetadata;
            setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userMetadata.name || '',
            role: userMetadata.role || 'member',
            avatar_url: userMetadata.avatar_url,
            phone: userMetadata.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Cargar la sesión inicial
    const loadInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        // Obtener los metadatos del usuario desde Supabase
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single<User>();

        if (userData && !error) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userData.name || '',
            role: userData.role || 'member',
            avatar_url: userData.avatar_url,
            phone: userData.phone,
            created_at: userData.created_at || new Date().toISOString(),
            updated_at: userData.updated_at || new Date().toISOString()
          });
        } else {
          // Si no hay datos en la tabla users, crear un usuario básico
          const userMetadata = session.user.user_metadata as UserMetadata;
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: userMetadata.name || '',
            role: userMetadata.role || 'member',
            avatar_url: userMetadata.avatar_url,
            phone: userMetadata.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
      
      setLoading(false);
    };
    
    loadInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Error de inicio de sesión:', error.message);
        setLoading(false);
        
        // Usar utilidad para obtener mensaje de error amigable
        throw new Error(getAuthErrorMessage(error));
      }
      
      // El usuario se establece a través del listener de onAuthStateChange
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error('Error inesperado durante el inicio de sesión:', error);
      setLoading(false);
      throw error; // Re-lanzar el error para que pueda ser capturado en LoginPage
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Registrar el usuario en Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: 'member',
            phone: userData.phone
          }
        }
      });
      
      if (signUpError) {
        console.error('Error al registrar usuario:', signUpError.message);
        setLoading(false);
        
        // Usar utilidad para obtener mensaje de error amigable
        throw new Error(getAuthErrorMessage(signUpError));
      }
      
      // El perfil de usuario se crea automáticamente mediante el trigger handle_new_user
      // No es necesario insertar manualmente en la tabla users
      
      // El usuario se establece a través del listener de onAuthStateChange
      setLoading(false);
      return true;
    } catch (error: any) {
      console.error('Error inesperado durante el registro:', error);
      setLoading(false);
      throw error; // Re-lanzar el error para que pueda ser capturado en LoginPage
    }
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Definir permisos basados en roles
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_events', 'manage_sermons', 'manage_blog'],
      pastor: ['read', 'write', 'manage_events', 'manage_sermons', 'manage_blog'],
      editor: ['read', 'write', 'manage_blog'],
      member: ['read']
    };
    
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}