// Sistema de autenticación local para reemplazar Supabase
// Utiliza localStorage para persistir datos de usuario

export interface LocalUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pastor' | 'leader' | 'member';
  avatar_url?: string;
  phone?: string;
  bio?: string;
  created_at: string;
  last_login?: string;
}

export interface LocalSession {
  user: LocalUser;
  access_token: string;
  expires_at: number;
}

class LocalAuthService {
  private readonly USERS_KEY = 'iglesia_users';
  private readonly SESSION_KEY = 'iglesia_session';
  private readonly PROFILES_KEY = 'iglesia_profiles';

  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    const existingUsers = this.getStoredUsers();
    if (existingUsers.length === 0) {
      // Crear usuarios por defecto
      const defaultUsers: LocalUser[] = [
        {
          id: 'admin-001',
          email: 'admin@lugarderefugio.com',
          full_name: 'Administrador',
          role: 'admin',
          created_at: new Date().toISOString(),
        },
        {
          id: 'pastor-001',
          email: 'pastor@lugarderefugio.com',
          full_name: 'Pastor Principal',
          role: 'pastor',
          created_at: new Date().toISOString(),
        },
        {
          id: 'member-001',
          email: 'miembro@lugarderefugio.com',
          full_name: 'Miembro de Prueba',
          role: 'member',
          created_at: new Date().toISOString(),
        }
      ];
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
    }
  }

  private getStoredUsers(): LocalUser[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: LocalUser[]) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private generateUserId(): string {
    return 'user-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Simular login
  async signIn(email: string, password: string): Promise<{ user: LocalUser; session: LocalSession } | null> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = this.getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // En un sistema real, aquí verificarías la contraseña
    // Por simplicidad, aceptamos cualquier contraseña para usuarios existentes
    
    // Actualizar último login
    user.last_login = new Date().toISOString();
    this.saveUsers(users);

    const session: LocalSession = {
      user,
      access_token: this.generateToken(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    
    return { user, session };
  }

  // Simular registro
  async signUp(email: string, password: string, fullName: string): Promise<{ user: LocalUser; session: LocalSession }> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = this.getStoredUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    const newUser: LocalUser = {
      id: this.generateUserId(),
      email: email.toLowerCase(),
      full_name: fullName,
      role: 'member',
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);

    const session: LocalSession = {
      user: newUser,
      access_token: this.generateToken(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000)
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    
    return { user: newUser, session };
  }

  // Obtener sesión actual
  getSession(): LocalSession | null {
    const sessionData = localStorage.getItem(this.SESSION_KEY);
    if (!sessionData) return null;

    const session: LocalSession = JSON.parse(sessionData);
    
    // Verificar si la sesión ha expirado
    if (Date.now() > session.expires_at) {
      this.signOut();
      return null;
    }

    return session;
  }

  // Obtener usuario actual
  getUser(): LocalUser | null {
    const session = this.getSession();
    return session?.user || null;
  }

  // Cerrar sesión
  signOut(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Actualizar perfil
  async updateProfile(userId: string, updates: Partial<LocalUser>): Promise<LocalUser> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const users = this.getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveUsers(users);

    // Actualizar sesión si es el usuario actual
    const session = this.getSession();
    if (session && session.user.id === userId) {
      session.user = users[userIndex];
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }

    return users[userIndex];
  }

  // Resetear contraseña (simulado)
  async resetPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = this.getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // En un sistema real, aquí enviarías un email
    console.log(`Email de reseteo enviado a: ${email}`);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  // Obtener todos los usuarios (solo para admin)
  async getAllUsers(): Promise<LocalUser[]> {
    const currentUser = this.getUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('No tienes permisos para ver todos los usuarios');
    }
    
    return this.getStoredUsers();
  }
}

// Instancia singleton
export const localAuth = new LocalAuthService();

// Tipos para compatibilidad
export type { LocalUser as User, LocalSession as Session };