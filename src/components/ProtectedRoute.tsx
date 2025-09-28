import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string | string[];
  adminOnly?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole, 
  adminOnly = false 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  
  // Funciones de permisos simplificadas basadas en el usuario
  const hasPermission = (_permission?: string): boolean => {
    if (!user) return false;
    // Para simplificar, asumimos que todos los usuarios autenticados tienen permisos básicos
    // En una implementación real, esto vendría de la base de datos o metadata del usuario
    return true;
  };

  const hasRole = (_role?: string): boolean => {
    if (!user) return false;
    // Para simplificar, asumimos que todos los usuarios autenticados tienen rol básico
    // En una implementación real, esto vendría de la base de datos o metadata del usuario
    return true;
  };

  const isAdmin = (): boolean => {
    if (!user) return false;
    // Para simplificar, verificamos si el email contiene 'admin' o es un email específico
    // En una implementación real, esto vendría de la base de datos
    return user.email?.includes('admin') || user.email === 'camplaygo@gmail.com';
  };

  // Verificar si el usuario tiene el rol requerido
  const hasRequiredRole = () => {
    if (!requiredRole) return true;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(role => hasRole(role));
    }
    
    return hasRole(requiredRole);
  };

  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando permisos divinos" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si es solo para admin
  if (adminOnly && !isAdmin()) {
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

  // Si no tiene el rol requerido, mostrar mensaje de acceso denegado
  if (!hasRequiredRole()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acceso Denegado
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            No tienes permisos para acceder a esta página.
            {requiredRole && (
              <span className="block mt-1">
                Se requiere rol: {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}
              </span>
            )}
            <span className="block mt-1 text-xs">
              Tu rol actual: Usuario
            </span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>;
}