-- Crear tabla de usuarios para autenticación personalizada
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para la tabla users
-- Permitir registro público de usuarios
CREATE POLICY "Allow public user registration" 
  ON users FOR INSERT 
  WITH CHECK (true);

-- Crear política para que los usuarios solo puedan ver y editar su propio perfil
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- Crear índice para búsquedas por email
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Insertar usuarios de prueba
INSERT INTO users (email, password_hash, full_name, role)
VALUES 
  ('admin@example.com', '$2a$10$X7VYHy.jXAYD8dHJrfiy3.YkZGRJCZldJzNxCrQHEMH8wJUm1CcXC', 'Admin User', 'admin'),
  ('user@example.com', '$2a$10$X7VYHy.jXAYD8dHJrfiy3.YkZGRJCZldJzNxCrQHEMH8wJUm1CcXC', 'Regular User', 'user')
ON CONFLICT (email) DO NOTHING;

-- Nota: Las contraseñas hasheadas corresponden a 'password123'