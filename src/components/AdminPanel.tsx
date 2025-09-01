import React, { useState, useEffect } from 'react';
import { useAdmin, AdminUser } from '../hooks/useAdmin';
import { Users, Shield, UserCheck, UserX, Trash2, Edit, Plus } from 'lucide-react';

interface AdminPanelProps {
  className?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ className = '' }) => {
  const {
    isAdmin,
    isLoading,
    users,
    updateUserRole,
    deactivateUser,
    activateUser,
    deleteUser,
    getAllUsers
  } = useAdmin();

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (isAdmin) {
      getAllUsers();
    }
  }, [isAdmin]);

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewPermissions([...user.permissions]);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUserRole(selectedUser.uid, newRole, newPermissions);
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar usuario');
    }
  };

  const handleTogglePermission = (permission: string) => {
    if (newPermissions.includes(permission)) {
      setNewPermissions(newPermissions.filter(p => p !== permission));
    } else {
      setNewPermissions([...newPermissions, permission]);
    }
  };

  const handleDeactivateUser = async (uid: string) => {
    if (confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      try {
        await deactivateUser(uid);
      } catch (error) {
        console.error('Error deactivating user:', error);
        alert('Error al desactivar usuario');
      }
    }
  };

  const handleActivateUser = async (uid: string) => {
    try {
      await activateUser(uid);
    } catch (error) {
      console.error('Error activating user:', error);
      alert('Error al activar usuario');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await deleteUser(uid);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando panel de administración...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-800">Acceso Denegado</h3>
        </div>
        <p className="text-red-700 mt-2">
          No tienes permisos de administrador para acceder a este panel.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center">
          <Users className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-bold">Panel de Administración</h2>
        </div>
        <p className="text-blue-100 mt-1">Gestiona usuarios y permisos del sistema</p>
      </div>

      {/* Users Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.displayName || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.isActive ? (
                        <button
                          onClick={() => handleDeactivateUser(user.uid)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Desactivar usuario"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.uid)}
                          className="text-green-600 hover:text-green-900"
                          title="Activar usuario"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permisos
              </label>
              <div className="space-y-2">
                {['read', 'write', 'delete', 'manage_users'].map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes(permission)}
                      onChange={() => handleTogglePermission(permission)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {permission === 'read' && 'Lectura'}
                      {permission === 'write' && 'Escritura'}
                      {permission === 'delete' && 'Eliminación'}
                      {permission === 'manage_users' && 'Gestión de usuarios'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;