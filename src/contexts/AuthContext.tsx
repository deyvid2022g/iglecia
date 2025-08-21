import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'pastor' | 'editor' | 'member';
  avatar?: string;
  phone?: string;
  joinDate: string;
  lastLogin?: string;
  permissions: string[];
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

// Datos de usuarios simulados (en producción vendría de una API)
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Pastor Juan Pérez',
    email: 'pastor@iglesiavidanueva.com',
    password: 'admin123',
    role: 'admin',
    avatar: '/trabajo.png',
    phone: '+57 302 494 1293',
    joinDate: '2020-01-15',
    lastLogin: '2025-01-25T10:30:00Z',
    permissions: ['manage_users', 'manage_content', 'manage_donations', 'manage_events', 'view_analytics']
  },
  {
    id: '2',
    name: 'Pastora María Gómez',
    email: 'maria@iglesiavidanueva.com',
    password: 'pastor123',
    role: 'pastor',
    avatar: '/trabajo.png',
    phone: '+57 301 555 0123',
    joinDate: '2020-03-20',
    lastLogin: '2025-01-24T16:45:00Z',
    permissions: ['manage_content', 'manage_events', 'view_donations']
  },
  {
    id: '3',
    name: 'Carlos Ruiz',
    email: 'carlos@iglesiavidanueva.com',
    password: 'editor123',
    role: 'editor',
    avatar: '/trabajo.png',
    phone: '+57 300 555 0456',
    joinDate: '2021-06-10',
    lastLogin: '2025-01-23T14:20:00Z',
    permissions: ['manage_content', 'manage_events']
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana@ejemplo.com',
    password: 'member123',
    role: 'member',
    avatar: '/trabajo.png',
    phone: '+57 315 555 0789',
    joinDate: '2023-02-14',
    lastLogin: '2025-01-25T09:15:00Z',
    permissions: []
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('churchUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('churchUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      const userWithLastLogin = {
        ...userWithoutPassword,
        lastLogin: new Date().toISOString()
      };
      
      setUser(userWithLastLogin);
      localStorage.setItem('churchUser', JSON.stringify(userWithLastLogin));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar si el email ya existe
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      setLoading(false);
      return false;
    }
    
    // Crear nuevo usuario
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: 'member',
      phone: userData.phone,
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      permissions: []
    };
    
    setUser(newUser);
    localStorage.setItem('churchUser', JSON.stringify(newUser));
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('churchUser');
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
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