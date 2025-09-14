import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '../services/supabaseService';

// Mock de Supabase
const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockQueryBuilder),
    channel: vi.fn(() => mockChannel),
  },
}));

describe('UserService - Operaciones CRUD Completas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Operaciones de Lectura', () => {
    it('debería obtener todos los usuarios', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', name: 'Usuario 1', role: 'user' },
        { id: '2', email: 'user2@test.com', name: 'Usuario 2', role: 'admin' },
      ];

      mockQueryBuilder.select.mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
    });

    it('debería obtener usuarios con columnas específicas', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
      ];

      mockQueryBuilder.select.mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      const result = await userService.getUsersWithColumns('id,email');

      expect(result).toEqual(mockUsers);
    });

    it('debería obtener usuarios con paginación', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', name: 'Usuario 1' },
      ];

      // Configurar el encadenamiento: select().range()
      mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.range.mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      const result = await userService.getUsersWithPagination(0, 9);

      expect(result).toEqual(mockUsers);
    });

    it('debería obtener un usuario por ID', async () => {
      const mockUser = { id: '1', email: 'user1@test.com', name: 'Usuario 1' };

      // Configurar el encadenamiento: select().eq().single()
      mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.single.mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const result = await userService.getUserById('1');

      expect(result).toEqual(mockUser);
    });

    it('debería obtener usuarios por múltiples roles', async () => {
      const mockUsers = [
        { id: '1', role: 'admin' },
        { id: '2', role: 'moderator' },
      ];

      // Configurar el encadenamiento: select().in()
      mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.in.mockResolvedValue({
        data: mockUsers,
        error: null,
      });

      const result = await userService.getUsersByRoles(['admin', 'moderator']);

      expect(result).toEqual(mockUsers);
    });
  });

  describe('Operaciones de Inserción', () => {
    it('debería crear un usuario', async () => {
      const userData = {
        email: 'nuevo@test.com',
        name: 'Nuevo Usuario',
        role: 'user',
      };

      const mockCreatedUser = { id: '3', ...userData };

      mockQueryBuilder.select.mockResolvedValue({
        data: [mockCreatedUser],
        error: null,
      });

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockCreatedUser);
    });

    it('debería crear múltiples usuarios', async () => {
      const usersData = [
        { email: 'user1@test.com', name: 'Usuario 1', role: 'user' },
        { email: 'user2@test.com', name: 'Usuario 2', role: 'user' },
      ];

      const mockCreatedUsers = [
        { id: '1', ...usersData[0] },
        { id: '2', ...usersData[1] },
      ];

      mockQueryBuilder.select.mockResolvedValue({
        data: mockCreatedUsers,
        error: null,
      });

      const result = await userService.createMultipleUsers(usersData);

      expect(result).toEqual(mockCreatedUsers);
    });

    it('debería hacer upsert de un usuario', async () => {
      const userData = {
        id: '1',
        email: 'actualizado@test.com',
        name: 'Usuario Actualizado',
        role: 'admin',
      };

      mockQueryBuilder.select.mockResolvedValue({
        data: [userData],
        error: null,
      });

      const result = await userService.upsertUser(userData);

      expect(result).toEqual(userData);
    });
  });

  describe('Operaciones de Actualización', () => {
    it('debería actualizar un usuario', async () => {
      const userId = '1';
      const updateData = { name: 'Nombre Actualizado' };
      const mockUpdatedUser = { id: '1', name: 'Nombre Actualizado', email: 'test@test.com' };

      // Configurar el encadenamiento: update().eq().select()
      mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.select.mockResolvedValue({
        data: [mockUpdatedUser],
        error: null,
      });

      const result = await userService.updateUser(userId, updateData);

      expect(result).toEqual(mockUpdatedUser);
    });

    it('debería actualizar múltiples usuarios por rol', async () => {
      const role = 'user';
      const updateData = { role: 'premium_user' };
      const mockUpdatedUsers = [
        { id: '1', role: 'premium_user' },
        { id: '2', role: 'premium_user' },
      ];

      mockQueryBuilder.select.mockResolvedValue({
        data: mockUpdatedUsers,
        error: null,
      });

      const result = await userService.updateUsersByRole(role, updateData);

      expect(result).toEqual(mockUpdatedUsers);
    });
  });

  describe('Operaciones de Eliminación', () => {
    it('debería eliminar un usuario', async () => {
      const userId = '1';

      // Configurar el encadenamiento: delete().eq()
      mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.eq.mockResolvedValue({
        error: null,
      });

      const result = await userService.deleteUser(userId);

      expect(result).toBe(true);
    });

    it('debería eliminar usuarios por rol', async () => {
      const role = 'inactive';

      // Configurar el encadenamiento: delete().eq()
      mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.eq.mockResolvedValue({
        error: null,
      });

      const result = await userService.deleteUsersByRole(role);

      expect(result).toBe(true);
    });
  });

  describe('Suscripciones en Tiempo Real', () => {
    it('debería suscribirse a todos los cambios', () => {
      const callback = vi.fn();

      const result = userService.subscribeToAllChanges(callback);

      expect(result).toBeDefined();
    });

    it('debería suscribirse a inserciones', () => {
      const callback = vi.fn();

      const result = userService.subscribeToInserts(callback);

      expect(result).toBeDefined();
    });

    it('debería suscribirse a actualizaciones', () => {
      const callback = vi.fn();

      const result = userService.subscribeToUpdates(callback);

      expect(result).toBeDefined();
    });

    it('debería suscribirse a eliminaciones', () => {
      const callback = vi.fn();

      const result = userService.subscribeToDeletes(callback);

      expect(result).toBeDefined();
    });

    it('debería suscribirse a un usuario específico', () => {
      const userId = '123';
      const callback = vi.fn();

      const result = userService.subscribeToSpecificUser(userId, callback);

      expect(result).toBeDefined();
    });

    it('debería suscribirse a usuarios por rol', () => {
      const role = 'admin';
      const callback = vi.fn();

      const result = userService.subscribeToUsersByRole(role, callback);

      expect(result).toBeDefined();
    });
  });

  describe('Manejo de Errores', () => {
    it('debería lanzar error cuando falla getAllUsers', async () => {
      const mockError = new Error('Error de base de datos');

      mockQueryBuilder.select.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(userService.getAllUsers()).rejects.toThrow('Error de base de datos');
    });

    it('debería lanzar error cuando falla createUser', async () => {
      const userData = { email: 'test@test.com', name: 'Test', role: 'user' };
      const mockError = new Error('Error al crear usuario');

      mockQueryBuilder.select.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(userService.createUser(userData)).rejects.toThrow('Error al crear usuario');
    });

    it('debería lanzar error cuando falla updateUser', async () => {
      const mockError = new Error('Error al actualizar usuario');

      // Configurar el encadenamiento: update().eq().select()
      mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.select.mockResolvedValue({
        data: null,
        error: mockError,
      });

      await expect(userService.updateUser('1', { name: 'Nuevo nombre' })).rejects.toThrow('Error al actualizar usuario');
    });

    it('debería lanzar error cuando falla deleteUser', async () => {
      const mockError = new Error('Error al eliminar usuario');

      // Configurar el encadenamiento: delete().eq()
      mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.eq.mockResolvedValue({
        error: mockError,
      });

      await expect(userService.deleteUser('1')).rejects.toThrow('Error al eliminar usuario');
    });
  });
});