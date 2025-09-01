-- Script para diagnosticar el error 'Database error granting user' para camplaygo005@gmail.com
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si el usuario existe en auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'camplaygo005@gmail.com';

-- 2. Verificar si existe perfil en la tabla profiles
SELECT 
    id,
    email,
    full_name,
    phone,
    role,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'camplaygo005@gmail.com';

-- 3. Verificar políticas RLS actuales en la tabla profiles
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
WHERE tablename = 'profiles';

-- 4. Verificar si RLS está habilitado en la tabla profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 5. Verificar la función handle_new_user
SELECT 
    proname,
    prosrc,
    provolatile,
    prosecdef
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 6. Verificar el trigger on_auth_user_created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. Intentar crear manualmente el perfil para el usuario (si existe en auth.users)
-- NOTA: Solo ejecutar si el usuario existe en auth.users pero no en profiles
/*
INSERT INTO public.profiles (id, email, full_name, phone, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'phone', ''),
    'user'
FROM auth.users 
WHERE email = 'camplaygo005@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE email = 'camplaygo005@gmail.com'
);
*/

-- 8. Verificar permisos de la función handle_new_user
SELECT 
    p.proname,
    p.prosecdef,
    r.rolname as owner
FROM pg_proc p
JOIN pg_roles r ON p.proowner = r.oid
WHERE p.proname = 'handle_new_user';

-- 9. Verificar logs de errores recientes (si están disponibles)
-- NOTA: Esto puede no estar disponible dependiendo de la configuración
/*
SELECT 
    log_time,
    message,
    detail,
    hint
FROM pg_log 
WHERE message ILIKE '%camplaygo005@gmail.com%'
ORDER BY log_time DESC
LIMIT 10;
*/