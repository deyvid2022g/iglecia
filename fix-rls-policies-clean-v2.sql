-- Script para corregir políticas RLS - Versión 2
-- Este script resuelve el error de política existente

-- 1. Eliminar TODAS las políticas existentes (incluyendo temp_admin_bypass)
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
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.profiles;

-- 2. Verificar que RLS esté habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear política temporal permisiva (ahora que eliminamos la anterior)
CREATE POLICY "temp_admin_bypass" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Verificar que la política se creó correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

/*
INSTRUCCIONES:
1. Ejecuta este script completo en el SQL Editor de Supabase
2. Luego ejecuta: update-camplaygo-to-admin.sql
3. Verifica que el usuario camplaygo005@gmail.com existe en Authentication
4. Prueba el login en: http://localhost:5173/
   - Email: camplaygo005@gmail.com
   - Password: Y3103031931c

ADVERTENCIA: La política temp_admin_bypass es MUY PERMISIVA.
Después de confirmar que el login funciona, deberías aplicar políticas más seguras.
*/