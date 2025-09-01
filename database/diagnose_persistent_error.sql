-- Script para diagnosticar error persistente 'Database error granting user'
-- Ejecutar en Supabase SQL Editor paso a paso

-- PASO 1: Verificar usuario en auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data,
    aud,
    role
FROM auth.users 
WHERE email = 'camplaygo005@gmail.com';

-- PASO 2: Verificar perfil existente
SELECT 
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM public.profiles 
WHERE email = 'camplaygo005@gmail.com';

-- PASO 3: Verificar políticas RLS que pueden estar bloqueando
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- PASO 4: Verificar función handle_new_user
SELECT 
    proname,
    prosrc,
    provolatile,
    prosecdef
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- PASO 5: Verificar trigger
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- PASO 6: Intentar crear perfil manualmente (SOLO SI NO EXISTE)
-- DESCOMENTA SOLO SI EL PASO 2 NO DEVUELVE RESULTADOS
/*
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    is_active,
    join_date,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'camplaygo005@gmail.com'),
    'camplaygo005@gmail.com',
    'Administrador',
    'admin',
    '+573001234567',
    true,
    NOW(),
    NOW(),
    NOW()
);
*/

-- PASO 7: Verificar logs de errores recientes (si están disponibles)
-- Esta consulta puede no funcionar dependiendo de la configuración
/*
SELECT 
    timestamp,
    level,
    msg,
    error_code
FROM postgres_logs 
WHERE msg ILIKE '%granting user%' 
ORDER BY timestamp DESC 
LIMIT 10;
*/