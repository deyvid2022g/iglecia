-- Script para verificar que el fix se aplicó correctamente
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar políticas RLS en la tabla profiles
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

-- 2. Verificar que la función handle_new_user existe y tiene SECURITY DEFINER
SELECT 
    p.proname as function_name,
    p.prosecdef as is_security_definer,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user'
AND n.nspname = 'public';

-- 3. Verificar que el trigger existe
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'on_auth_user_created';

-- 4. Verificar que RLS está habilitado en profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. Probar inserción manual (esto debería funcionar si las políticas están bien)
-- NOTA: Solo ejecutar si tienes un usuario autenticado
-- INSERT INTO public.profiles (id, full_name, email) 
-- VALUES (auth.uid(), 'Test User', 'test@example.com')
-- ON CONFLICT (id) DO NOTHING;

-- 6. Verificar usuarios existentes en auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at
FROM auth.users 
WHERE email = 'camplaygo005@gmail.com';

-- 7. Verificar perfiles existentes
SELECT 
    id,
    full_name,
    email,
    created_at
FROM public.profiles 
WHERE email = 'camplaygo005@gmail.com';