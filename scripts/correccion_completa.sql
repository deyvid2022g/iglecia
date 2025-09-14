
-- Script de corrección completa para errores de autenticación
-- Ejecutar en Supabase SQL Editor

-- 1. Habilitar RLS en tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;

-- 3. Crear políticas RLS correctas
-- Permitir que usuarios autenticados lean sus propios datos
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Permitir inserción durante registro (trigger)
CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir actualización de perfil propio
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Insertar usuarios de prueba
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'admin@iglesia.com', 'Administrador', 'admin', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'hola@hola.com', 'Usuario de Prueba', 'member', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 5. Verificar que el trigger existe y funciona
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail authentication
    RAISE WARNING 'Error in handle_new_user: % %', SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recrear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verificación final
SELECT 'Corrección completada' as status;
SELECT COUNT(*) as total_users FROM public.users;
