-- Configuración completa de la base de datos Supabase para el proyecto Lugar de Refugio
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear tabla de usuarios personalizada
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de seguridad para la tabla users

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política para que los administradores puedan ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'pastor')
    )
  );

-- Política para que los administradores puedan actualizar cualquier usuario
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para insertar nuevos usuarios (solo durante el registro)
CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Función para crear automáticamente un registro en users cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Crear usuario administrador inicial (opcional)
-- Descomenta las siguientes líneas si quieres crear un usuario admin directamente
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--   gen_random_uuid(),
--   'lugarderefugio005@gmail.com',
--   crypt('tu_password_aqui', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW()
-- );

-- 7. Verificar que todo esté configurado correctamente
SELECT 
  'Tabla users creada' as status,
  COUNT(*) as total_users
FROM public.users;

-- Mostrar políticas activas
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
WHERE tablename = 'users';