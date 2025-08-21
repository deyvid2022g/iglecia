import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  adminOnly?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole, 
  adminOnly = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando permisos divinos" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si es solo para admin
  if (adminOnly && !hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificar permisos específicos
  if (requiredPermission && !hasPermission(requiredPermission) && !hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Permisos Insuficientes</h1>
          <p className="text-gray-600 mb-6">
            Necesitas permisos adicionales para acceder a esta funcionalidad.
            Contacta al administrador si crees que deberías tener acceso.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificar roles específicos
  if (requiredRole && !hasRole(requiredRole) && !hasRole('admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-2xl">👤</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Rol Requerido</h1>
          <p className="text-gray-600 mb-6">
            Esta sección está disponible solo para usuarios con rol de {requiredRole}.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}