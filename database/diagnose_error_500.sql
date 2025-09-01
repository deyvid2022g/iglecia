-- Script de diagnóstico para error 500 'Database error granting user'
-- Ejecutar en SQL Editor de Supabase Dashboard

-- 1. Verificar si el usuario admin@iglesia.com existe
SELECT 
  'Usuario en auth.users' as tabla,
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  u.last_sign_in_at,
  u.raw_app_meta_data,
  u.raw_user_meta_data
FROM auth.users u 
WHERE u.email = 'admin@iglesia.com';

-- 2. Verificar si existe el perfil correspondiente
SELECT 
  'Perfil en profiles' as tabla,
  p.id,
  p.name,
  p.email,
  p.role,
  p.is_active,
  p.created_at,
  p.updated_at
FROM public.profiles p 
WHERE p.email = 'admin@iglesia.com';

-- 3. Verificar la función handle_new_user
SELECT 
  'Función handle_new_user' as info,
  p.proname as nombre_funcion,
  p.prosrc as codigo_funcion
FROM pg_proc p 
WHERE p.proname = 'handle_new_user';

-- 4. Verificar el trigger on_auth_user_created
SELECT 
  'Trigger on_auth_user_created' as info,
  t.tgname as nombre_trigger,
  t.tgenabled as habilitado,
  c.relname as tabla
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname = 'on_auth_user_created';

-- 5. Verificar políticas RLS en la tabla profiles
SELECT 
  'Políticas RLS profiles' as info,
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

-- 6. Verificar si RLS está habilitado en profiles
SELECT 
  'RLS Status' as info,
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'profiles';

-- 7. Intentar crear un perfil manualmente (para testing)
-- NOTA: Solo ejecutar si no existe el perfil
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'admin@iglesia.com') THEN
    INSERT INTO public.profiles (
      id,
      name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    ) 
    SELECT 
      u.id,
      'Administrador',
      u.email,
      'admin',
      true,
      NOW(),
      NOW()
    FROM auth.users u
    WHERE u.email = 'admin@iglesia.com';
    
    RAISE NOTICE 'Perfil creado manualmente para admin@iglesia.com';
  ELSE
    RAISE NOTICE 'El perfil ya existe para admin@iglesia.com';
  END IF;
END $$;

-- 8. Verificación final después del insert manual
SELECT 
  'Verificación final' as info,
  u.id as user_id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role,
  p.is_active,
  CASE 
    WHEN p.id IS NOT NULL THEN 'Perfil existe'
    ELSE 'Perfil faltante'
  END as estado_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@iglesia.com';

/*
INSTRUCCIONES:
1. Ve a: https://supabase.com/dashboard/project/toopbtydsiepeoisuecg
2. SQL Editor
3. Ejecuta este script completo
4. Revisa todos los resultados
5. Si el perfil se crea exitosamente, intenta hacer login nuevamente

Si el error persiste después de esto, el problema podría estar en:
- Configuración de JWT
- Políticas RLS muy restrictivas
- Problemas con la función handle_new_user
- Configuración del proyecto Supabase
*/