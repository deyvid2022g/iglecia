-- Migración para permitir operaciones del CLI con clave anónima
-- Fecha: 2024-01-15
-- Descripción: Agregar políticas que permitan al CLI funcionar con la clave anónima

-- Política para permitir inserción de categorías con clave anónima
CREATE POLICY "Allow anonymous category creation for CLI" ON sermon_categories
  FOR INSERT WITH CHECK (true);

-- Política para permitir inserción de sermones con clave anónima  
CREATE POLICY "Allow anonymous sermon creation for CLI" ON sermons
  FOR INSERT WITH CHECK (true);

-- Política para permitir lectura de categorías con clave anónima
CREATE POLICY "Allow anonymous category reading for CLI" ON sermon_categories
  FOR SELECT USING (true);

-- Política para permitir actualización de sermones con clave anónima
CREATE POLICY "Allow anonymous sermon updates for CLI" ON sermons
  FOR UPDATE USING (true);

-- Política para permitir eliminación de sermones con clave anónima (para pruebas)
CREATE POLICY "Allow anonymous sermon deletion for CLI" ON sermons
  FOR DELETE USING (true);

-- Comentario: Estas políticas son para desarrollo y testing del CLI
-- En producción, se deben usar políticas más restrictivas con autenticación adecuada