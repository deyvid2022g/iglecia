-- Migración para corregir políticas RLS de la tabla users
-- Fecha: 2024-01-XX
-- Descripción: Agregar política para permitir inserción pública de usuarios

BEGIN;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow public user registration" ON users;

-- Crear política para permitir registro público de usuarios
CREATE POLICY "Allow public user registration" 
  ON users FOR INSERT 
  WITH CHECK (true);

-- Crear política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid()::text = id::text);

-- Crear política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- Crear política para que los administradores puedan ver todos los usuarios
CREATE POLICY "Admins can view all users" 
  ON users FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = auth.uid()::text 
      AND u.role = 'admin'
    )
  );

COMMIT;