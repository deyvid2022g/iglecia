-- =====================================================
-- SOLUCIÓN PARA PROBLEMA DE LOGIN CON RLS
-- =====================================================
-- Este script soluciona el error "Database error granting user"
-- causado por políticas RLS muy restrictivas

-- =====================================================
-- PASO 1: LIMPIAR POLÍTICAS EXISTENTES
-- =====================================================

-- Eliminar todas las políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "temp_admin_bypass" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Perfiles públicos son visibles para todos" ON public.profiles;
DROP POLICY IF EXISTS "temp_profiles_bypass" ON public.profiles;

-- =====================================================
-- PASO 2: CREAR POLÍTICAS PERMISIVAS PARA LOGIN
-- =====================================================

-- Política para SELECT: Permitir que usuarios autenticados vean perfiles
CREATE POLICY "profiles_select_authenticated" ON public.profiles
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Política para INSERT: Permitir que usuarios autenticados creen perfiles
CREATE POLICY "profiles_insert_authenticated" ON public.profiles
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

-- Política para UPDATE: Permitir que usuarios actualicen su propio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Política para DELETE: Solo administradores pueden eliminar perfiles
CREATE POLICY "profiles_delete_admin" ON public.profiles
    FOR DELETE 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- =====================================================
-- PASO 3: VERIFICAR CONFIGURACIÓN
-- =====================================================

-- Asegurar que RLS esté habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 4: VERIFICACIONES
-- =====================================================

-- Mostrar políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
/*
1. Ve a tu Dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Copia y pega este script completo
5. Haz clic en "Run"
6. Verifica que no haya errores
7. Prueba el login en: http://localhost:5173/

Credenciales de prueba:
- Email: lugarderefugio005@gmail.com
- Password: L3123406452r

O:
- Email: camplaygo005@gmail.com  
- Password: Y3103031931c

Esta solución:
✅ Mantiene la seguridad RLS
✅ Permite el login correcto
✅ Permite la creación de perfiles
✅ Mantiene la arquitectura original
✅ Es más segura que deshabilitar RLS completamente
*/

-- =====================================================
-- SOLUCIÓN ALTERNATIVA (SOLO SI LA ANTERIOR FALLA)
-- =====================================================
/*
Si el script anterior no funciona, ejecuta esta línea como último recurso:

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

Esto deshabilitará RLS temporalmente para permitir el login.
Después de confirmar que funciona, puedes volver a habilitarlo:

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
*/