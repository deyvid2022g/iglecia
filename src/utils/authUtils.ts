import { supabase } from '../lib/supabase';

/**
 * Utilidades para el manejo de autenticación
 */

/**
 * Reenvía el email de confirmación a un usuario
 * @param email - Email del usuario
 * @returns Promise<boolean> - true si se envió correctamente
 */
export const resendConfirmationEmail = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      console.error('Error al reenviar email de confirmación:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inesperado al reenviar email:', error);
    return false;
  }
};

/**
 * Solicita un email de recuperación de contraseña
 * @param email - Email del usuario
 * @returns Promise<boolean> - true si se envió correctamente
 */
export const sendPasswordResetEmail = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Error al enviar email de recuperación:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error inesperado al enviar email de recuperación:', error);
    return false;
  }
};

/**
 * Valida si un email tiene un formato correcto
 * @param email - Email a validar
 * @returns boolean - true si es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida si una contraseña cumple con los requisitos mínimos
 * @param password - Contraseña a validar
 * @returns object - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obtiene un mensaje de error amigable basado en el error de Supabase
 * @param error - Error de Supabase
 * @returns string - Mensaje de error amigable
 */
export const getAuthErrorMessage = (error: any): string => {
  if (!error || !error.message) {
    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }
  
  const message = error.message.toLowerCase();
  
  if (message.includes('invalid login credentials')) {
    return 'Credenciales incorrectas. Verifica tu email y contraseña.';
  }
  
  if (message.includes('email not confirmed')) {
    return 'Por favor confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.';
  }
  
  if (message.includes('user already registered')) {
    return 'Este correo electrónico ya está registrado.';
  }
  
  if (message.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  
  if (message.includes('invalid email')) {
    return 'El formato del correo electrónico no es válido.';
  }
  
  if (message.includes('too many requests')) {
    return 'Demasiados intentos. Espera unos minutos antes de intentar de nuevo.';
  }
  
  if (message.includes('signup is disabled')) {
    return 'El registro está temporalmente deshabilitado.';
  }
  
  if (message.includes('email link is invalid or has expired')) {
    return 'El enlace de confirmación ha expirado. Solicita uno nuevo.';
  }
  
  // Si no coincide con ningún patrón conocido, devolver el mensaje original
  return error.message;
};

/**
 * Verifica si el usuario actual tiene un rol específico
 * @param userRole - Rol del usuario actual
 * @param requiredRole - Rol requerido
 * @returns boolean - true si tiene el rol o uno superior
 */
export const hasRole = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    member: 1,
    editor: 2,
    pastor: 3,
    admin: 4
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * Verifica si el usuario actual tiene un permiso específico
 * @param userRole - Rol del usuario actual
 * @param permission - Permiso requerido
 * @returns boolean - true si tiene el permiso
 */
export const hasPermission = (userRole: string, permission: string): boolean => {
  const rolePermissions = {
    admin: ['read', 'write', 'delete', 'manage_users', 'manage_events', 'manage_sermons', 'manage_blog'],
    pastor: ['read', 'write', 'manage_events', 'manage_sermons', 'manage_blog'],
    editor: ['read', 'write', 'manage_blog'],
    member: ['read']
  };
  
  return rolePermissions[userRole as keyof typeof rolePermissions]?.includes(permission) || false;
};