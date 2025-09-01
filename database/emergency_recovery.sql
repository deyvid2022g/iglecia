-- Script de Recuperación de Emergencia para Error 500
-- Ejecutar SOLO si el diagnóstico revela problemas críticos
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de usuarios ⚠️

-- PASO 1: Backup de datos importantes (ejecutar primero)
CREATE TABLE IF NOT EXISTS backup_profiles AS 
SELECT * FROM public.profiles;

CREATE TABLE IF NOT EXISTS backup_users AS 
SELECT id, email, created_at, raw_user_meta_data FROM auth.users;

-- PASO 2: Limpiar completamente el sistema de autenticación
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- PASO 3: Eliminar todos los usuarios y perfiles
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- PASO 4: Recrear la función handle_new_user (versión simplificada)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log del inicio de la función
  RAISE LOG 'handle_new_user: Iniciando para usuario %', NEW.email;
  
  BEGIN
    -- Insertar perfil básico
    INSERT INTO public.profiles (
      id,
      name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
      NEW.email,
      CASE 
        WHEN NEW.email = 'admin@iglesia.com' THEN 'admin'
        ELSE 'member'
      END,
      true,
      NOW(),
      NOW()
    );
    
    RAISE LOG 'handle_new_user: Perfil creado exitosamente para %', NEW.email;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: Error creando perfil para %: %', NEW.email, SQLERRM;
    -- No lanzar excepción para no bloquear el registro
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 5: Recrear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 6: Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- PASO 7: Verificar y ajustar políticas RLS
DROP POLICY IF EXISTS "Usuarios pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Permitir inserción de perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Administradores pueden eliminar perfiles" ON public.profiles;
DROP POLICY IF EXISTS "system_function_insert" ON public.profiles;

-- Políticas RLS simplificadas
CREATE POLICY "Acceso completo para service_role" ON public.profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Acceso completo para supabase_auth_admin" ON public.profiles
  FOR ALL TO supabase_auth_admin USING (true) WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden ver perfiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios pueden actualizar su perfil" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Inserción automática de perfiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Inserción pública de perfiles" ON public.profiles
  FOR INSERT TO public WITH CHECK (true);

-- PASO 8: Crear usuario administrador con método alternativo
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generar ID único
  new_user_id := gen_random_uuid();
  
  -- Insertar en auth.users
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
    new_user_id,
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
  
  RAISE NOTICE 'Usuario admin@iglesia.com creado con ID: %', new_user_id;
  
  -- El trigger debería crear automáticamente el perfil
  -- Pero por seguridad, verificamos y creamos manualmente si es necesario
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = new_user_id) THEN
    INSERT INTO public.profiles (
      id,
      name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      'Administrador',
      'admin@iglesia.com',
      'admin',
      true,
      NOW(),
      NOW()
    );
    RAISE NOTICE 'Perfil creado manualmente para admin@iglesia.com';
  ELSE
    RAISE NOTICE 'Perfil ya existe para admin@iglesia.com (creado por trigger)';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error en creación de usuario: %', SQLERRM;
END $$;

-- PASO 9: Verificación final
SELECT 
  'Verificación Final' as estado,
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmado,
  p.name,
  p.role,
  p.is_active,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ Perfil OK'
    ELSE '❌ Perfil faltante'
  END as estado_perfil
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@iglesia.com';

-- PASO 10: Verificar función y trigger
SELECT 
  'Estado del Sistema' as info,
  (
    SELECT COUNT(*) 
    FROM pg_proc 
    WHERE proname = 'handle_new_user'
  ) as funcion_existe,
  (
    SELECT COUNT(*) 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) as trigger_existe;

/*
🚨 INSTRUCCIONES CRÍTICAS:

1. SOLO ejecutar este script si el diagnóstico anterior falló
2. Este script ELIMINARÁ todos los usuarios existentes
3. Creará un sistema de autenticación completamente nuevo
4. Después de ejecutar, usar estas credenciales:
   - Email: admin@iglesia.com
   - Password: admin123

5. Si este script también falla, el problema podría ser:
   - Configuración del proyecto Supabase
   - Problemas con la extensión pgcrypto
   - Limitaciones del plan de Supabase
   - Configuración de JWT incorrecta

6. En ese caso, considera:
   - Crear un nuevo proyecto Supabase
   - Contactar soporte de Supabase
   - Usar autenticación alternativa (Firebase, Auth0, etc.)
*/