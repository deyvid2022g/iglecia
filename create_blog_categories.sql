-- Script para crear la tabla blog_categories
-- Ejecutar este script directamente en Supabase Dashboard > SQL Editor

-- Crear tabla de categorías del blog
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_blog_categories_order ON blog_categories(display_order);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_blog_categories_updated_at
    BEFORE UPDATE ON blog_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para blog_categories
CREATE POLICY "Blog categories are viewable by everyone" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Blog categories can be managed by admins and pastors" ON blog_categories
    FOR ALL USING (
        auth.role() = 'authenticated' AND (
            (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'pastor')
        )
    );

-- Insertar categorías por defecto
INSERT INTO blog_categories (name, slug, description, color, icon, display_order, is_active) VALUES
    ('Devocionales', 'devocionales', 'Reflexiones y estudios bíblicos diarios', '#10B981', 'book-open', 1, true),
    ('Testimonios', 'testimonios', 'Historias de fe y transformación personal', '#F59E0B', 'heart', 2, true),
    ('Enseñanzas', 'ensenanzas', 'Estudios bíblicos y doctrinales profundos', '#3B82F6', 'academic-cap', 3, true),
    ('Eventos', 'eventos', 'Noticias y anuncios de eventos especiales', '#8B5CF6', 'calendar', 4, true),
    ('Vida Cristiana', 'vida-cristiana', 'Consejos prácticos para el crecimiento espiritual', '#EF4444', 'user-group', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla blog_categories creada exitosamente' as resultado;
SELECT COUNT(*) as total_categorias FROM blog_categories;