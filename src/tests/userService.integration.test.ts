import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { userService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

// Estas pruebas requieren una conexión real a Supabase
// Nota: Las pruebas están deshabilitadas debido a políticas RLS
// Para ejecutar estas pruebas, necesitas configurar políticas RLS apropiadas
// o usar un usuario con permisos de administrador

describe.skip('UserService - Pruebas de Integración (Deshabilitadas por RLS)', () => {
  let testUserId: string;
  let testUsers: any[] = [];

  beforeAll(async () => {
    // Verificar que tenemos conexión a Supabase
    console.log('⚠️  Pruebas de integración deshabilitadas debido a políticas RLS');
    console.log('💡 Para habilitar estas pruebas:');
    console.log('   1. Configura políticas RLS apropiadas para pruebas');
    console.log('   2. O usa un usuario con permisos de administrador');
    console.log('   3. O deshabilita temporalmente RLS en la tabla users');
    
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.warn('⚠️  No se puede conectar a Supabase. Saltando pruebas de integración.');
      console.warn('Error:', error.message);
      return;
    }
    console.log('✅ Conexión a Supabase establecida para pruebas de integración');
  });

  beforeEach(async () => {
    // Limpiar datos de prueba antes de cada test
    // Nota: Esto también puede fallar debido a RLS
    try {
      await supabase
        .from('users')
        .delete()
        .like('email', '%test-integration%');
    } catch (error) {
      console.warn('⚠️  No se pueden limpiar datos de prueba debido a RLS:', error.message);
    }
  });

  afterAll(async () => {
    // Limpiar todos los datos de prueba
    try {
      await supabase
        .from('users')
        .delete()
        .like('email', '%test-integration%');
    } catch (error) {
      console.warn('⚠️  No se pueden limpiar datos de prueba debido a RLS:', error.message);
    }
  });

  describe('Operaciones CRUD Reales', () => {
    it('debería crear un usuario real', async () => {
      const userData = {
        email: 'usuario-test-integration@example.com',
        name: 'Usuario de Prueba Integración',
        role: 'user',
        avatar_url: 'https://example.com/avatar.jpg'
      };

      try {
        const result = await userService.createUser(userData);
        
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.email).toBe(userData.email);
        expect(result.name).toBe(userData.name);
        expect(result.role).toBe(userData.role);
        expect(result.created_at).toBeDefined();
        expect(result.updated_at).toBeDefined();
        
        testUserId = result.id;
        testUsers.push(result);
      } catch (error) {
        console.warn('⚠️  Error al crear usuario:', error);
        throw error;
      }
    });

    it('debería obtener un usuario por ID', async () => {
      // Primero crear un usuario
      const userData = {
        email: 'get-user-test-integration@example.com',
        name: 'Usuario para Obtener',
        role: 'user'
      };

      const createdUser = await userService.createUser(userData);
      testUsers.push(createdUser);

      // Luego obtenerlo
      const result = await userService.getUserById(createdUser.id);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(createdUser.id);
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
    });

    it('debería actualizar un usuario', async () => {
      // Crear usuario
      const userData = {
        email: 'update-user-test-integration@example.com',
        name: 'Usuario Original',
        role: 'user'
      };

      const createdUser = await userService.createUser(userData);
      testUsers.push(createdUser);

      // Actualizar usuario
      const updateData = {
        name: 'Usuario Actualizado',
        role: 'admin'
      };

      const result = await userService.updateUser(createdUser.id, updateData);
      
      expect(result).toBeDefined();
      expect(result.id).toBe(createdUser.id);
      expect(result.name).toBe(updateData.name);
      expect(result.role).toBe(updateData.role);
      expect(result.email).toBe(userData.email); // No debería cambiar
    });

    it('debería eliminar un usuario', async () => {
      // Crear usuario
      const userData = {
        email: 'delete-user-test-integration@example.com',
        name: 'Usuario para Eliminar',
        role: 'user'
      };

      const createdUser = await userService.createUser(userData);
      
      // Eliminar usuario
      const result = await userService.deleteUser(createdUser.id);
      expect(result).toBe(true);

      // Verificar que fue eliminado
      try {
        await userService.getUserById(createdUser.id);
        // Si llegamos aquí, el usuario no fue eliminado
        expect(true).toBe(false);
      } catch (error) {
        // Esperamos que lance error porque el usuario no existe
        expect(error).toBeDefined();
      }
    });

    it('debería crear múltiples usuarios', async () => {
      const usersData = [
        {
          email: 'multi-user-1-test-integration@example.com',
          name: 'Usuario Múltiple 1',
          role: 'user'
        },
        {
          email: 'multi-user-2-test-integration@example.com',
          name: 'Usuario Múltiple 2',
          role: 'moderator'
        }
      ];

      const result = await userService.createMultipleUsers(usersData);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].email).toBe(usersData[0].email);
      expect(result[1].email).toBe(usersData[1].email);
      
      testUsers.push(...result);
    });
  });

  describe('Operaciones de Filtrado', () => {
    beforeEach(async () => {
      // Crear datos de prueba para filtrado
      const testData = [
        {
          email: 'admin-filter-test-integration@example.com',
          name: 'Admin Usuario',
          role: 'admin'
        },
        {
          email: 'user-filter-test-integration@example.com',
          name: 'Usuario Normal',
          role: 'user'
        },
        {
          email: 'moderator-filter-test-integration@example.com',
          name: 'Moderador Usuario',
          role: 'moderator'
        }
      ];

      const created = await userService.createMultipleUsers(testData);
      testUsers.push(...created);
    });

    it('debería filtrar usuarios por rol', async () => {
      const filters = { role: 'admin' };
      const result = await userService.getUsersWithFilters(filters);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(user => user.role === 'admin')).toBe(true);
    });

    it('debería filtrar usuarios por múltiples roles', async () => {
      const roles = ['admin', 'moderator'];
      const result = await userService.getUsersByRoles(roles);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(user => roles.includes(user.role))).toBe(true);
    });

    it('debería filtrar usuarios por nombre (contiene)', async () => {
      const filters = { nameContains: 'Admin' };
      const result = await userService.getUsersWithFilters(filters);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(user => user.name.includes('Admin'))).toBe(true);
    });
  });

  describe('Operaciones de Paginación', () => {
    beforeEach(async () => {
      // Crear múltiples usuarios para probar paginación
      const testData = Array.from({ length: 15 }, (_, i) => ({
        email: `pagination-user-${i}-test-integration@example.com`,
        name: `Usuario Paginación ${i}`,
        role: 'user'
      }));

      const created = await userService.createMultipleUsers(testData);
      testUsers.push(...created);
    });

    it('debería obtener usuarios con paginación', async () => {
      const result = await userService.getUsersWithPagination(0, 4);
      
      expect(result).toBeDefined();
      expect(result.length).toBeLessThanOrEqual(5); // range 0-4 = 5 elementos máximo
    });

    it('debería obtener la segunda página', async () => {
      const firstPage = await userService.getUsersWithPagination(0, 4);
      const secondPage = await userService.getUsersWithPagination(5, 9);
      
      expect(firstPage).toBeDefined();
      expect(secondPage).toBeDefined();
      
      // Los IDs no deberían repetirse entre páginas
      const firstPageIds = firstPage.map(user => user.id);
      const secondPageIds = secondPage.map(user => user.id);
      const intersection = firstPageIds.filter(id => secondPageIds.includes(id));
      expect(intersection.length).toBe(0);
    });
  });

  describe('Operaciones Upsert', () => {
    it('debería hacer upsert de un usuario nuevo', async () => {
      const userData = {
        email: 'upsert-new-test-integration@example.com',
        name: 'Usuario Upsert Nuevo',
        role: 'user'
      };

      const result = await userService.upsertUser(userData);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);
      
      testUsers.push(result);
    });

    it('debería hacer upsert de un usuario existente', async () => {
      // Crear usuario primero
      const userData = {
        email: 'upsert-existing-test-integration@example.com',
        name: 'Usuario Original',
        role: 'user'
      };

      const createdUser = await userService.createUser(userData);
      testUsers.push(createdUser);

      // Hacer upsert con el mismo email pero datos diferentes
      const upsertData = {
        email: userData.email,
        name: 'Usuario Actualizado via Upsert',
        role: 'admin'
      };

      const result = await userService.upsertUser(upsertData);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(upsertData.name);
      expect(result.role).toBe(upsertData.role);
    });
  });

  describe('Operaciones por Lotes', () => {
    it('debería actualizar múltiples usuarios por rol', async () => {
      // Crear usuarios con el mismo rol
      const testData = [
        {
          email: 'batch-update-1-test-integration@example.com',
          name: 'Usuario Lote 1',
          role: 'temp_user'
        },
        {
          email: 'batch-update-2-test-integration@example.com',
          name: 'Usuario Lote 2',
          role: 'temp_user'
        }
      ];

      const created = await userService.createMultipleUsers(testData);
      testUsers.push(...created);

      // Actualizar todos los usuarios con rol 'temp_user'
      const updateData = { role: 'verified_user' };
      const result = await userService.updateUsersByRole('temp_user', updateData);
      
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result.every(user => user.role === 'verified_user')).toBe(true);
    });

    it('debería eliminar múltiples usuarios por rol', async () => {
      // Crear usuarios con rol específico para eliminar
      const testData = [
        {
          email: 'batch-delete-1-test-integration@example.com',
          name: 'Usuario Eliminar 1',
          role: 'to_delete'
        },
        {
          email: 'batch-delete-2-test-integration@example.com',
          name: 'Usuario Eliminar 2',
          role: 'to_delete'
        }
      ];

      await userService.createMultipleUsers(testData);

      // Eliminar todos los usuarios con rol 'to_delete'
      const result = await userService.deleteUsersByRole('to_delete');
      expect(result).toBe(true);

      // Verificar que fueron eliminados
      const remainingUsers = await userService.getUsersWithFilters({ role: 'to_delete' });
      expect(remainingUsers.length).toBe(0);
    });
  });

  describe('Pruebas de Suscripciones (Simuladas)', () => {
    it('debería configurar suscripción a todos los cambios', () => {
      const callback = vi.fn();
      const subscription = userService.subscribeToAllChanges(callback);
      
      expect(subscription).toBeDefined();
      // En un entorno real, aquí probaríamos que el callback se ejecuta
      // cuando hay cambios en la tabla
    });

    it('debería configurar suscripción a inserciones', () => {
      const callback = vi.fn();
      const subscription = userService.subscribeToInserts(callback);
      
      expect(subscription).toBeDefined();
    });

    it('debería configurar suscripción a un usuario específico', () => {
      const callback = vi.fn();
      const userId = 'test-user-id';
      const subscription = userService.subscribeToSpecificUser(userId, callback);
      
      expect(subscription).toBeDefined();
    });
  });

  describe('Manejo de Errores en Integración', () => {
    it('debería manejar error al obtener usuario inexistente', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      try {
        await userService.getUserById(nonExistentId);
        // Si llegamos aquí, algo está mal
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('debería manejar error al crear usuario con email duplicado', async () => {
      const userData = {
        email: 'duplicate-email-test-integration@example.com',
        name: 'Usuario Duplicado',
        role: 'user'
      };

      // Crear el primer usuario
      const firstUser = await userService.createUser(userData);
      testUsers.push(firstUser);

      // Intentar crear otro usuario con el mismo email
      try {
        await userService.createUser(userData);
        // Si llegamos aquí, algo está mal (debería fallar por email duplicado)
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        // Verificar que es un error de constraint de email único
        expect(error.message).toContain('duplicate');
      }
    });

    it('debería manejar error al actualizar usuario inexistente', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateData = { name: 'Nombre Actualizado' };
      
      try {
        await userService.updateUser(nonExistentId, updateData);
        // Si llegamos aquí, algo está mal
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});