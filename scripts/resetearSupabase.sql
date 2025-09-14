-- Script para resetear Supabase a su estado inicial
-- ADVERTENCIA: Este script eliminará TODOS los datos y configuraciones personalizadas
-- Ejecutar en el SQL Editor de Supabase Dashboard

-- 1. Eliminar todas las tablas personalizadas
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
-- Agrega aquí otras tablas personalizadas que hayas creado

-- 2. Eliminar todas las funciones personalizadas
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
-- Agrega aquí otras funciones personalizadas que hayas creado

-- 3. Eliminar todos los triggers personalizados
-- Los triggers ya se eliminaron con CASCADE en las funciones

-- 4. Eliminar todas las políticas RLS personalizadas
-- Las políticas ya se eliminaron con CASCADE en las tablas

-- 5. Eliminar todos los tipos personalizados
-- Agrega aquí tipos personalizados que hayas creado

-- 6. Eliminar todos los usuarios de auth (CUIDADO: esto eliminará TODOS los usuarios)
-- Esta operación es irreversible y eliminará todos los usuarios registrados
TRUNCATE auth.users CASCADE;

-- 7. Recrear la tabla users básica
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'leader', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Habilitar RLS en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS básicas
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 10. Crear función trigger para nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Verificar que el usuario no existe ya en la tabla
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    INSERT INTO public.users (id, email, name)
    VALUES (
      NEW.id, 
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', '')
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log el error pero no fallar el registro
    RAISE WARNING 'Error creating user record: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 11. Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Crear política especial para el trigger
CREATE POLICY "Allow trigger to insert users" ON public.users
  FOR INSERT TO supabase_auth_admin
  WITH CHECK (true);