-- Migración para corregir recursión infinita en políticas RLS
-- Fecha: 2024-01-XX
-- Descripción: Eliminar política recursiva y simplificar políticas RLS

BEGIN;

-- Eliminar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow public user registration" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Política simple para registro público
CREATE POLICY "Allow public user registration" 
  ON users FOR INSERT 
  WITH CHECK (true);

-- Política para que los usuarios vean su propio perfil
-- Usando auth.uid() directamente sin conversión problemática
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Política para que los usuarios actualicen su propio perfil
CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Política simplificada para administradores usando auth.jwt()
-- Esto evita la recursión al no consultar la tabla users
CREATE POLICY "Admins can view all users" 
  ON users FOR SELECT 
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
    OR 
    auth.uid() = id
  );

COMMIT;