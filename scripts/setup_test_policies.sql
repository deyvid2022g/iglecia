-- Script para configurar políticas de prueba en Supabase
-- Este script permite operaciones de prueba sin autenticación

-- Crear políticas adicionales para permitir operaciones de prueba
-- Estas políticas son más permisivas y solo deben usarse en entornos de desarrollo/prueba

-- Política para permitir inserción de usuarios de prueba (emails que contengan 'test')
CREATE POLICY "Allow test user insertion" ON public.users
    FOR INSERT WITH CHECK (email LIKE '%test%' OR email LIKE '%integration%');

-- Política para permitir lectura de usuarios de prueba
CREATE POLICY "Allow test user read" ON public.users
    FOR SELECT USING (email LIKE '%test%' OR email LIKE '%integration%');

-- Política para permitir actualización de usuarios de prueba
CREATE POLICY "Allow test user update" ON public.users
    FOR UPDATE USING (email LIKE '%test%' OR email LIKE '%integration%');

-- Política para permitir eliminación de usuarios de prueba
CREATE POLICY "Allow test user delete" ON public.users
    FOR DELETE USING (email LIKE '%test%' OR email LIKE '%integration%');

-- Verificar que las políticas se crearon correctamente
DO $$
BEGIN
    -- Contar políticas existentes
    IF (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') < 4 THEN
        RAISE WARNING 'Advertencia: Menos de 4 políticas encontradas para la tabla users';
    ELSE
        RAISE NOTICE 'Éxito: Políticas de prueba configuradas correctamente';
    END IF;
END;
$$;

-- Mostrar todas las políticas actuales
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
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY policyname;