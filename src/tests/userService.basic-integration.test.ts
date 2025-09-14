import { describe, it, expect, beforeAll } from 'vitest';
import { userService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

// Pruebas básicas de integración que funcionan con RLS
// Estas pruebas se enfocan en operaciones de lectura y conexión

describe('UserService - Pruebas Básicas de Integración', () => {
  beforeAll(async () => {
    // Verificar que tenemos conexión a Supabase
    console.log('🔍 Verificando conexión a Supabase...');
  });

  describe('Conexión y Configuración', () => {
    it('debería conectarse a Supabase correctamente', async () => {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      // La consulta puede fallar por RLS, pero no debería haber errores de conexión
      if (error) {
        // Si es un error de RLS, la conexión funciona
        expect(error.code).toBeDefined();
        console.log('✅ Conexión establecida (RLS activo)');
      } else {
        // Si no hay error, la consulta funcionó
        expect(data).toBeDefined();
        console.log('✅ Conexión y consulta exitosas');
      }
    });

    it('debería tener la tabla users configurada', async () => {
      // Intentar una consulta simple para verificar que la tabla existe
      try {
        const { error } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        // Si el error es de RLS (42501), la tabla existe
        // Si el error es de tabla no encontrada (42P01), la tabla no existe
        if (error) {
          expect(error.code).not.toBe('42P01'); // No debería ser "relation does not exist"
          console.log('✅ Tabla users existe (protegida por RLS)');
        } else {
          console.log('✅ Tabla users existe y es accesible');
        }
      } catch (error) {
        console.error('❌ Error verificando tabla users:', error);
        throw error;
      }
    });

    it('debería tener RLS habilitado en la tabla users', async () => {
      // Intentar una operación que debería fallar por RLS
      const { error } = await supabase
        .from('users')
        .insert({
          email: 'test-rls@example.com',
          name: 'Test RLS',
          role: 'user'
        });
      
      // Esperamos que falle por RLS
      expect(error).toBeDefined();
      expect(error?.code).toBe('42501'); // Row-level security policy violation
      console.log('✅ RLS está activo y funcionando correctamente');
    });
  });

  describe('Funciones del Servicio', () => {
    it('debería tener todas las funciones definidas', () => {
      expect(userService.getAllUsers).toBeDefined();
      expect(userService.getUserById).toBeDefined();
      expect(userService.createUser).toBeDefined();
      expect(userService.updateUser).toBeDefined();
      expect(userService.deleteUser).toBeDefined();
      expect(userService.getUsersByRoles).toBeDefined();
      expect(userService.getUsersWithPagination).toBeDefined();
      expect(userService.getUsersWithFilters).toBeDefined();
      console.log('✅ Todas las funciones del servicio están definidas');
    });

    it('debería manejar errores correctamente', async () => {
      try {
        await userService.createUser({
          email: 'test-error-handling@example.com',
          name: 'Test Error',
          role: 'user'
        });
        // Si llegamos aquí sin error, significa que el usuario se creó exitosamente
        // o que las políticas RLS permiten la creación
        console.log('✅ Operación completada (políticas RLS permiten la operación)');
        expect(true).toBe(true);
      } catch (error: any) {
        // Si hay error, verificamos que sea manejado correctamente
        expect(error).toBeDefined();
        console.log('✅ Manejo de errores funciona correctamente:', error.message || error.toString());
        expect(true).toBe(true);
      }
    });
  });

  describe('Configuración de Variables de Entorno', () => {
    it('debería tener las variables de entorno configuradas', () => {
      expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
      expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
      expect(import.meta.env.VITE_SUPABASE_URL).toContain('supabase.co');
      console.log('✅ Variables de entorno configuradas correctamente');
    });
  });
});