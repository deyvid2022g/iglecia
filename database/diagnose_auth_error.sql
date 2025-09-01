-- Script de diagnóstico para error 500 en /auth/v1/token
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar configuración de autenticación
SELECT 
    key,
    value
FROM auth.config
WHERE key IN (
    'SITE_URL',
    'JWT_SECRET',
    'JWT_EXP',
    'DISABLE_SIGNUP',
    'EXTERNAL_EMAIL_ENABLED',
    'MAILER_AUTOCONFIRM'
);

-- 2. Verificar si hay usuarios duplicados o con problemas
SELECT 
    email,
    COUNT(*) as count,
    array_agg(id) as user_ids,
    array_agg(email_confirmed_at) as confirmations
FROM auth.users 
WHERE email = 'camplaygo005@gmail.com'
GROUP BY email
HAVING COUNT(*) > 1;

-- 3. Verificar estado del usuario específico
SELECT 
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    phone_confirmed_at IS NOT NULL as phone_confirmed,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
FROM auth.users 
WHERE email = 'camplaygo005@gmail.com';

-- 4. Verificar intentos de login recientes (si existe la tabla)
-- SELECT 
--     created_at,
--     user_id,
--     ip_address,
--     user_agent
-- FROM auth.audit_log_entries 
-- WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'camplaygo005@gmail.com')
-- ORDER BY created_at DESC
-- LIMIT 10;

-- 5. Verificar si hay problemas con la función de hash de contraseña
SELECT 
    email,
    LENGTH(encrypted_password) as password_length,
    encrypted_password LIKE '$2%' as is_bcrypt_format
FROM auth.users 
WHERE email = 'camplaygo005@gmail.com';

-- 6. Verificar perfiles asociados
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.created_at,
    u.email as auth_email,
    u.created_at as auth_created
FROM public.profiles p
FULL OUTER JOIN auth.users u ON p.id = u.id
WHERE p.email = 'camplaygo005@gmail.com' OR u.email = 'camplaygo005@gmail.com';

-- 7. Verificar que no hay conflictos en las políticas RLS
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
AND cmd = 'INSERT'
ORDER BY policyname;

-- 8. Probar autenticación básica (ejecutar como función)
CREATE OR REPLACE FUNCTION test_auth_basic()
RETURNS TABLE(
    test_name text,
    result text,
    details text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Test 1: Verificar que auth.users existe
    BEGIN
        PERFORM 1 FROM auth.users LIMIT 1;
        RETURN QUERY SELECT 'auth.users_accessible'::text, 'PASS'::text, 'Table accessible'::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'auth.users_accessible'::text, 'FAIL'::text, SQLERRM::text;
    END;
    
    -- Test 2: Verificar que public.profiles existe
    BEGIN
        PERFORM 1 FROM public.profiles LIMIT 1;
        RETURN QUERY SELECT 'profiles_accessible'::text, 'PASS'::text, 'Table accessible'::text;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'profiles_accessible'::text, 'FAIL'::text, SQLERRM::text;
    END;
    
    -- Test 3: Verificar función handle_new_user
    BEGIN
        PERFORM 1 FROM pg_proc WHERE proname = 'handle_new_user';
        IF FOUND THEN
            RETURN QUERY SELECT 'handle_new_user_exists'::text, 'PASS'::text, 'Function exists'::text;
        ELSE
            RETURN QUERY SELECT 'handle_new_user_exists'::text, 'FAIL'::text, 'Function not found'::text;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 'handle_new_user_exists'::text, 'FAIL'::text, SQLERRM::text;
    END;
    
END;
$$;

-- Ejecutar tests
SELECT * FROM test_auth_basic();

-- Limpiar función de test
DROP FUNCTION test_auth_basic();