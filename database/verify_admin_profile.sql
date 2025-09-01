-- =====================================================
-- SCRIPT DE VERIFICACIÓN DEL PERFIL DE ADMINISTRADOR
-- =====================================================

-- 1. Verificar si el usuario existe en auth.users
SELECT 
    'Usuario en auth.users' as verificacion,
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'lugarderefugio005@gmail.com';

-- 2. Verificar si el perfil existe en public.profiles
SELECT 
    'Perfil en public.profiles' as verificacion,
    id,
    full_name,
    email,
    role,
    is_active,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'lugarderefugio005@gmail.com';

-- 3. Verificar políticas RLS para profiles
SELECT 
    'Políticas RLS para profiles' as verificacion,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Verificar función get_user_role
SELECT 
    'Función get_user_role disponible' as verificacion,
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'get_user_role';

-- 5. Probar función get_user_role (solo si hay sesión activa)
-- SELECT get_user_role() as rol_actual;

-- =====================================================
-- INSTRUCCIONES:
-- 1. Ejecutar este script en el SQL Editor de Supabase
-- 2. Revisar los resultados de cada consulta
-- 3. Si el usuario no existe, debe registrarse primero
-- 4. Si el perfil no existe, ejecutar setup_admin_permissions.sql
-- =====================================================