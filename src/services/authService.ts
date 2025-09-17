import { supabase } from '../lib/supabase'
import * as bcrypt from 'bcryptjs'

export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'admin' | 'pastor' | 'leader' | 'editor' | 'member' | 'user'
}

interface Session {
  access_token: string
  expires_at: number
  user: AuthUser
}

class AuthService {
  private session: Session | null = null;
  
  // Login con email y contraseña
  async signIn(email: string, password: string) {
    try {
      // Buscar usuario por email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error || !user) {
        throw new Error('Credenciales inválidas');
      }
      
      // Verificar contraseña
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      
      if (!passwordMatch) {
        throw new Error('Credenciales inválidas');
      }
      
      // Crear sesión y guardarla en Supabase
      const session = await this.createSession(user);
      this.session = session;
      
      // Guardar sesión en localStorage
      localStorage.setItem('auth_session', JSON.stringify(session));
      
      return { 
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          role: user.role
        }, 
        session 
      };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  // Registro de nuevos usuarios
  async signUp(email: string, password: string, metadata: { full_name?: string; name?: string; phone?: string; role?: string }) {
    try {
      const fullName = metadata.full_name || metadata.name || email.split('@')[0];
      
      // Verificar si el usuario ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (checkError) {
        console.error('Error al verificar usuario existente:', checkError);
      }
      
      if (existingUser) {
        throw new Error('El usuario ya existe');
      }
      
      // Generar hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Crear usuario en la base de datos
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([
          { 
            email: email.toLowerCase(), 
            password_hash: passwordHash,
            full_name: fullName,
            role: metadata.role || 'user'
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Error detallado al crear usuario:', error);
        throw new Error(`Error al crear el usuario: ${error.message}`);
      }
      
      if (!newUser) {
        console.error('No se pudo crear el usuario');
        throw new Error('No se pudo crear el usuario');
      }
      
      const createdUser = newUser;
      
      // Crear sesión y guardarla en Supabase
      const session = await this.createSession(createdUser);
      this.session = session;
      
      // Guardar sesión en localStorage
      localStorage.setItem('auth_session', JSON.stringify(session));
      
      return { 
        user: {
          id: createdUser.id,
          email: createdUser.email,
          full_name: createdUser.full_name,
          avatar_url: createdUser.avatar_url,
          role: createdUser.role
        }, 
        session 
      };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  // Logout
  async signOut() {
    try {
      // Obtener la sesión actual
      const currentSession = this.getSession();
      
      if (currentSession) {
        // Eliminar la sesión de Supabase
        await supabase
          .from('sessions')
          .delete()
          .eq('access_token', currentSession.access_token);
      }
      
      this.session = null;
      localStorage.removeItem('auth_session');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const session = this.getSession();
      return session?.user || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Obtener sesión actual
  async getCurrentSession() {
    try {
      return this.getSession();
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // Escuchar cambios en el estado de autenticación
  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Implementación simple para compatibilidad
    const currentSession = this.getSession();
    if (currentSession) {
      callback('SIGNED_IN', currentSession);
    }
    
    // No hay un verdadero listener de eventos, pero podemos simular la interfaz
    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  }
  
  // Crear una sesión para el usuario y guardarla en Supabase
  private async createSession(user: any): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días
    
    const accessToken = this.generateToken(user.id);
    
    // Guardar la sesión en la tabla sessions de Supabase
    const { error } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: user.id,
          access_token: accessToken,
          expires_at: expiresAt.toISOString()
        }
      ]);
      
    if (error) {
      console.error('Error al guardar la sesión en Supabase:', error);
    }
    
    return {
      access_token: accessToken,
      expires_at: expiresAt.getTime(),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role || 'user'
      }
    };
  }
  
  // Generar un token simple
  private generateToken(userId: string): string {
    return `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  
  // Obtener la sesión del localStorage
  getSession(): Session | null {
    if (this.session) {
      return this.session;
    }
    
    const sessionStr = localStorage.getItem('auth_session');
    if (!sessionStr) {
      return null;
    }
    
    try {
      const session = JSON.parse(sessionStr) as Session;
      
      // Verificar si la sesión ha expirado
      if (session.expires_at < Date.now()) {
        localStorage.removeItem('auth_session');
        return null;
      }
      
      this.session = session;
      return session;
    } catch (error) {
      console.error('Error parsing session:', error);
      localStorage.removeItem('auth_session');
      return null;
    }
  }
  
  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const session = this.getSession();
    return !!session;
  }
  
  // Obtener datos del perfil del usuario desde la tabla users
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as AuthUser;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Esta implementación ya existe arriba, se elimina para evitar duplicación
}

export const authService = new AuthService()