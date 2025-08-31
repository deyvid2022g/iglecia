-- =====================================================
-- CORRECCIÓN COMPLETA DE POLÍTICAS RLS PARA PERFILES
-- (Versión que maneja políticas existentes)
-- =====================================================

-- PASO 1: Eliminar TODAS las políticas existentes en la tabla profiles
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Perfiles públicos son visibles para todos" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "temp_profiles_bypass" ON public.profiles;

-- PASO 2: Crear política temporal muy permisiva para resolver el problema inmediato
CREATE POLICY "temp_admin_bypass" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- PASO 3: Verificar que la política se creó correctamente
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

-- PASO 4: Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================

/*
✅ ESTE SCRIPT RESUELVE EL PROBLEMA DE POLÍTICAS DUPLICADAS

📋 PASOS:
1. Ejecuta este script completo en el SQL Editor del Dashboard
2. Verifica que no haya errores
3. Ejecuta update-camplaygo-to-admin.sql para actualizar el rol
4. Crea el usuario en Authentication > Users:
   - Email: camplaygo005@gmail.com
   - Password: Y3103031931c
   - Email Confirm: ✅
5. Prueba el login en http://localhost:5173/

⚠️ IMPORTANTE:
Esta política temporal "temp_admin_bypass" es MUY PERMISIVA.
Una vez que tengas acceso administrativo, puedes crear políticas más restrictivas.

🔧 PARA POLÍTICAS MÁS SEGURAS (ejecutar después del login exitoso):

DROP POLICY IF EXISTS "temp_admin_bypass" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (true);

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

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
*/