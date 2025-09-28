import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, authService } from '../services/authService';
import { setSessionToken } from '../lib/supabase';

interface Session {
  access_token: string;
  expires_at: number;
  user: AuthUser;
}

type AuthContextValue = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; name?: string; phone?: string; role?: string }) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const currentSession = authService.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Establecer el token en el cliente de Supabase si existe una sesión
      if (currentSession) {
        setSessionToken(currentSession.access_token);
      }
      
      setLoading(false);
    };

    init();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Iniciando sesión con:', { email });
      
      const result = await authService.signIn(email, password);
      
      if (!result) {
        const error = new Error('Credenciales inválidas');
        console.error('Error en inicio de sesión:', error);
        return { error };
      } else {
        console.log('Sesión iniciada correctamente:', result);
        setSession(result.session);
        setUser(result.user);
        return { data: result, error: null };
      }
    } catch (err) {
      console.error('Error inesperado en signIn:', err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, metadata?: { full_name?: string; phone?: string; name?: string; role?: string }) => {
    try {
      // Validar datos antes de enviar
      if (!email || !password) {
        console.error('Error: Email y contraseña son obligatorios');
        return { error: new Error('Email y contraseña son obligatorios') };
      }
      
      // Obtener el nombre completo
      const fullName = metadata?.full_name || metadata?.name || email.split('@')[0];
      
      console.log('Registrando usuario con datos:', { email, fullName });
      
      try {
        const result = await authService.signUp(email, password, { full_name: fullName });
        console.log('Usuario registrado:', result);
        
        setSession(result.session);
        setUser(result.user);
        
        return { error: null, data: result };
      } catch (error) {
        console.error('Error en registro:', error);
        return { error, data: null };
      }
    } catch (err) {
      console.error('Error inesperado en signUp:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setSession(null);
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return { error };
    }
  };

  // Diagnostic log for Provider mounting
  console.info('AuthProvider mounted', { pathname: window.location.pathname });

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  // Diagnostic log for context value
  console.info('useAuth context value:', ctx);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};