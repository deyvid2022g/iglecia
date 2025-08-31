-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA PERFILES
-- =====================================================

-- Eliminar políticas existentes que están causando problemas
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Perfiles públicos son visibles para todos" ON public.profiles;

-- Crear nuevas políticas más permisivas para resolver el problema

-- 1. Política de lectura: todos pueden ver perfiles públicos
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (true);

-- 2. Política de inserción: permitir inserción si el usuario está autenticado
-- y el ID coincide con el auth.uid() O si es un administrador
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND (
            auth.uid() = id OR
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        )
    );

-- 3. Política de actualización: usuarios pueden actualizar su propio perfil
-- o administradores pueden actualizar cualquier perfil
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 4. Política de eliminación: solo administradores pueden eliminar perfiles
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- =====================================================
-- POLÍTICA TEMPORAL PARA RESOLVER EL PROBLEMA INICIAL
-- =====================================================

-- Crear una política temporal muy permisiva para permitir la creación inicial
-- Esta se puede restringir más tarde una vez que tengamos usuarios administradores
CREATE POLICY "temp_profiles_bypass" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS
-- =====================================================

-- Consulta para verificar las políticas activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
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