-- Script para eliminar todos los usuarios y crear un nuevo administrador
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Eliminar todos los perfiles existentes
DELETE FROM public.profiles;

-- 2. Eliminar todos los usuarios de auth (esto también eliminará las sesiones)
DELETE FROM auth.users;

-- 3. Crear nuevo usuario administrador
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@iglesia.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  '',
  NOW(),
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Administrador"}',
  false,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  false,
  NULL
);

-- 4. Crear perfil para el administrador
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
  id,
  'Administrador',
  email,
  'admin',
  true,
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@iglesia.com';

-- 5. Verificar que el usuario fue creado correctamente
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.name,
  p.role,
  p.is_active
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@iglesia.com';

/*
INSTRUCCIONES:
1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/toopbtydsiepeoisuecg
2. Ve a la sección "SQL Editor"
3. Copia y pega todo este script
4. Ejecuta el script
5. Verifica que la consulta final muestre el usuario creado

CREDENCIALES DEL NUEVO ADMINISTRADOR:
Email: admin@iglesia.com
Password: admin123
Rol: admin

Después de ejecutar este script, intenta hacer login con estas credenciales.
*/