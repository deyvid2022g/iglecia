-- Migración inicial - Configuración base de Supabase
-- Archivo: 000_initial_setup.sql
-- Este archivo debe ejecutarse primero para configurar las funciones base

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear función para generar slugs automáticamente
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          unaccent(input_text),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ language 'plpgsql';

-- Crear función para validar emails
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ language 'plpgsql';

-- Crear función para validar teléfonos colombianos
CREATE OR REPLACE FUNCTION is_valid_colombian_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Acepta formatos: +57 XXX XXX-XXXX, +57 XXX XXXXXXX, +57XXXXXXXXXX
  RETURN phone ~* '^\+57\s?[0-9]{3}\s?[0-9]{3}[-\s]?[0-9]{4}$' OR
         phone ~* '^\+57\s?[0-9]{10}$' OR
         phone ~* '^[0-9]{10}$';
END;
$$ language 'plpgsql';

-- Crear función para limpiar HTML de texto
CREATE OR REPLACE FUNCTION strip_html_tags(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(input_text, '<[^>]*>', '', 'g');
END;
$$ language 'plpgsql';

-- Crear función para calcular tiempo de lectura estimado
CREATE OR REPLACE FUNCTION calculate_read_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  read_time INTEGER;
BEGIN
  -- Contar palabras (asumiendo promedio de 200 palabras por minuto)
  word_count := array_length(string_to_array(strip_html_tags(content), ' '), 1);
  read_time := GREATEST(1, ROUND(word_count / 200.0));
  RETURN read_time;
END;
$$ language 'plpgsql';

-- Crear función para generar excerpt automático
CREATE OR REPLACE FUNCTION generate_excerpt(content TEXT, max_length INTEGER DEFAULT 150)
RETURNS TEXT AS $$
DECLARE
  clean_content TEXT;
  excerpt TEXT;
BEGIN
  -- Limpiar HTML y obtener texto plano
  clean_content := strip_html_tags(content);
  
  -- Truncar al límite especificado
  IF length(clean_content) <= max_length THEN
    RETURN clean_content;
  ELSE
    excerpt := left(clean_content, max_length);
    -- Buscar el último espacio para no cortar palabras
    excerpt := left(excerpt, length(excerpt) - length(split_part(reverse(excerpt), ' ', 1)));
    RETURN excerpt || '...';
  END IF;
END;
$$ language 'plpgsql';

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Crear tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'leader', 'member', 'visitor')),
  join_date DATE DEFAULT CURRENT_DATE,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  bio TEXT,
  birth_date DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'other')),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Colombia',
  emergency_contact JSONB, -- {"name": string, "phone": string, "relationship": string}
  preferences JSONB DEFAULT '{}', -- Preferencias del usuario
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (is_valid_email(email)),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR is_valid_colombian_phone(phone))
);

-- Crear índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_join_date ON profiles(join_date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- Crear trigger para updated_at en profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Only admins can delete profiles" ON profiles
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role = 'admin' AND is_active = true
    )
  );

-- Función para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_login = NOW() 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para actualizar last_login en cada sesión
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION update_last_login();

COMMIT;