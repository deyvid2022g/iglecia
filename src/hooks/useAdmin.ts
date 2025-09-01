import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
  createdAt: Date;
  isActive: boolean;
}

export interface AdminActions {
  isAdmin: boolean;
  isLoading: boolean;
  users: AdminUser[];
  checkAdminStatus: () => Promise<boolean>;
  getUserProfile: (uid: string) => Promise<AdminUser | null>;
  updateUserRole: (uid: string, role: string, permissions: string[]) => Promise<void>;
  deactivateUser: (uid: string) => Promise<void>;
  activateUser: (uid: string) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  getAllUsers: () => Promise<void>;
  createUserProfile: (user: User, role?: string) => Promise<void>;
}

export const useAdmin = (): AdminActions => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);

  // Verificar si el usuario actual es administrador
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }

    try {
      // Verificar custom claims
      const idTokenResult = await user.getIdTokenResult();
      const isAdminClaim = idTokenResult.claims.admin === true;

      if (isAdminClaim) {
        setIsAdmin(true);
        setIsLoading(false);
        return true;
      }

      // Si no hay claims, verificar en Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isAdminRole = userData.role === 'admin';
        setIsAdmin(isAdminRole);
        setIsLoading(false);
        return isAdminRole;
      }

      setIsAdmin(false);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }
  };

  // Obtener perfil de usuario
  const getUserProfile = async (uid: string): Promise<AdminUser | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid: data.uid,
          email: data.email,
          displayName: data.displayName || '',
          role: data.role || 'user',
          permissions: data.permissions || ['read'],
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive !== false
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  // Actualizar rol de usuario
  const updateUserRole = async (uid: string, role: string, permissions: string[]): Promise<void> => {
    if (!isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }

    try {
      await updateDoc(doc(db, 'users', uid), {
        role,
        permissions,
        updatedAt: new Date()
      });
      
      // Actualizar la lista local
      await getAllUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  // Desactivar usuario
  const deactivateUser = async (uid: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }

    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive: false,
        updatedAt: new Date()
      });
      
      // Actualizar la lista local
      await getAllUsers();
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  };

  // Activar usuario
  const activateUser = async (uid: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }

    try {
      await updateDoc(doc(db, 'users', uid), {
        isActive: true,
        updatedAt: new Date()
      });
      
      // Actualizar la lista local
      await getAllUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  };

  // Eliminar usuario (solo marca como eliminado)
  const deleteUser = async (uid: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('No tienes permisos de administrador');
    }

    try {
      await deleteDoc(doc(db, 'users', uid));
      
      // Actualizar la lista local
      await getAllUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // Obtener todos los usuarios
  const getAllUsers = async (): Promise<void> => {
    if (!isAdmin) {
      return;
    }

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: AdminUser[] = [];
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersData.push({
          uid: data.uid,
          email: data.email,
          displayName: data.displayName || '',
          role: data.role || 'user',
          permissions: data.permissions || ['read'],
          createdAt: data.createdAt?.toDate() || new Date(),
          isActive: data.isActive !== false
        });
      });
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  };

  // Crear perfil de usuario
  const createUserProfile = async (user: User, role: string = 'user'): Promise<void> => {
    try {
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        role,
        permissions: role === 'admin' ? ['read', 'write', 'delete', 'manage_users'] : ['read'],
        createdAt: new Date(),
        isActive: true
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Verificar estado de admin al cargar
  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, [user]);

  // Cargar usuarios si es admin
  useEffect(() => {
    if (isAdmin) {
      getAllUsers();
    }
  }, [isAdmin]);

  return {
    isAdmin,
    isLoading,
    users,
    checkAdminStatus,
    getUserProfile,
    updateUserRole,
    deactivateUser,
    activateUser,
    deleteUser,
    getAllUsers,
    createUserProfile
  };
};