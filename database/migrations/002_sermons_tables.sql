-- Migración para tablas de prédicas/sermones
-- Archivo: 002_sermons_tables.sql

-- Crear tabla de categorías de sermones
CREATE TABLE IF NOT EXISTS sermon_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- Código hexadecimal para color
  icon VARCHAR(50), -- Nombre del ícono
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de sermones
CREATE TABLE IF NOT EXISTS sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  speaker_name VARCHAR(255) NOT NULL,
  speaker_bio TEXT,
  speaker_image_url TEXT,
  preached_date DATE NOT NULL,
  duration INTEGER, -- Duración en minutos
  video_url TEXT,
  audio_url TEXT,
  thumbnail_url TEXT,
  transcript TEXT, -- Transcripción completa
  has_transcript BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  category_id UUID REFERENCES sermon_categories(id) ON DELETE SET NULL,
  tags TEXT[], -- Array de tags
  scripture_references TEXT[], -- Referencias bíblicas
  series_name VARCHAR(255), -- Nombre de la serie si pertenece a una
  series_part INTEGER, -- Número de parte en la serie
  download_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de recursos adicionales para sermones
CREATE TABLE IF NOT EXISTS sermon_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sermon_id UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('pdf', 'image', 'link', 'document', 'video', 'audio')),
  file_url TEXT,
  external_url TEXT,
  file_size INTEGER, -- Tamaño en bytes
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de series de sermones
CREATE TABLE IF NOT EXISTS sermon_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  total_sermons INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar referencia a series en sermones
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES sermon_series(id) ON DELETE SET NULL;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_sermons_slug ON sermons(slug);
CREATE INDEX IF NOT EXISTS idx_sermons_preached_date ON sermons(preached_date DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_speaker ON sermons(speaker_name);
CREATE INDEX IF NOT EXISTS idx_sermons_category ON sermons(category_id);
CREATE INDEX IF NOT EXISTS idx_sermons_series ON sermons(series_id);
CREATE INDEX IF NOT EXISTS idx_sermons_featured ON sermons(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_sermons_published ON sermons(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_sermons_tags ON sermons USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_sermons_scripture ON sermons USING GIN(scripture_references);
CREATE INDEX IF NOT EXISTS idx_sermons_view_count ON sermons(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_sermons_like_count ON sermons(like_count DESC);

CREATE INDEX IF NOT EXISTS idx_sermon_categories_slug ON sermon_categories(slug);
CREATE INDEX IF NOT EXISTS idx_sermon_categories_active ON sermon_categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sermon_categories_order ON sermon_categories(display_order);

CREATE INDEX IF NOT EXISTS idx_sermon_resources_sermon ON sermon_resources(sermon_id);
CREATE INDEX IF NOT EXISTS idx_sermon_resources_type ON sermon_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_sermon_resources_public ON sermon_resources(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_sermon_series_slug ON sermon_series(slug);
CREATE INDEX IF NOT EXISTS idx_sermon_series_active ON sermon_series(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sermon_series_dates ON sermon_series(start_date, end_date);

-- Crear triggers para updated_at
CREATE TRIGGER update_sermon_categories_updated_at
  BEFORE UPDATE ON sermon_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermon_resources_updated_at
  BEFORE UPDATE ON sermon_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sermon_series_updated_at
  BEFORE UPDATE ON sermon_series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear función para actualizar contador de sermones en series
CREATE OR REPLACE FUNCTION update_series_sermon_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.series_id IS NOT NULL THEN
    UPDATE sermon_series 
    SET total_sermons = (
      SELECT COUNT(*) 
      FROM sermons 
      WHERE series_id = NEW.series_id AND is_published = true
    )
    WHERE id = NEW.series_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Actualizar serie anterior si cambió
    IF OLD.series_id IS NOT NULL AND OLD.series_id != COALESCE(NEW.series_id, '00000000-0000-0000-0000-000000000000'::UUID) THEN
      UPDATE sermon_series 
      SET total_sermons = (
        SELECT COUNT(*) 
        FROM sermons 
        WHERE series_id = OLD.series_id AND is_published = true
      )
      WHERE id = OLD.series_id;
    END IF;
    
    -- Actualizar nueva serie
    IF NEW.series_id IS NOT NULL THEN
      UPDATE sermon_series 
      SET total_sermons = (
        SELECT COUNT(*) 
        FROM sermons 
        WHERE series_id = NEW.series_id AND is_published = true
      )
      WHERE id = NEW.series_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.series_id IS NOT NULL THEN
    UPDATE sermon_series 
    SET total_sermons = (
      SELECT COUNT(*) 
      FROM sermons 
      WHERE series_id = OLD.series_id AND is_published = true
    )
    WHERE id = OLD.series_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar contador de sermones en series
CREATE TRIGGER update_series_sermon_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION update_series_sermon_count();

-- Habilitar Row Level Security (RLS)
ALTER TABLE sermon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_series ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para sermon_categories
CREATE POLICY "Sermon categories are viewable by everyone" ON sermon_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sermon categories can be managed by admins and pastors" ON sermon_categories
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para sermons
CREATE POLICY "Published sermons are viewable by everyone" ON sermons
  FOR SELECT USING (is_published = true);

CREATE POLICY "Unpublished sermons are viewable by creators, admins and pastors" ON sermons
  FOR SELECT USING (
    is_published = true OR
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Sermons can be created by authenticated users" ON sermons
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Sermons can be updated by creators, admins and pastors" ON sermons
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Sermons can be deleted by admins and pastors" ON sermons
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para sermon_resources
CREATE POLICY "Public sermon resources are viewable by everyone" ON sermon_resources
  FOR SELECT USING (is_public = true);

CREATE POLICY "Private sermon resources are viewable by authenticated users" ON sermon_resources
  FOR SELECT USING (
    is_public = true OR
    (auth.uid() IS NOT NULL AND is_public = false)
  );

CREATE POLICY "Sermon resources can be managed by admins and pastors" ON sermon_resources
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

-- Políticas de seguridad para sermon_series
CREATE POLICY "Active sermon series are viewable by everyone" ON sermon_series
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sermon series can be managed by admins and pastors" ON sermon_series
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Insertar categorías de ejemplo
INSERT INTO sermon_categories (name, slug, description, color, icon, display_order, is_active) VALUES
('Doctrina', 'doctrina', 'Enseñanzas fundamentales de la fe cristiana', '#3B82F6', 'book-open', 1, true),
('Vida Cristiana', 'vida-cristiana', 'Cómo vivir como cristiano en el día a día', '#10B981', 'heart', 2, true),
('Evangelismo', 'evangelismo', 'Compartir el evangelio y ganar almas', '#F59E0B', 'megaphone', 3, true),
('Familia', 'familia', 'Principios bíblicos para la familia', '#EF4444', 'home', 4, true),
('Oración', 'oracion', 'La importancia y práctica de la oración', '#8B5CF6', 'hands-praying', 5, true),
('Profético', 'profetico', 'Mensajes proféticos y revelación', '#F97316', 'eye', 6, true),
('Testimonios', 'testimonios', 'Testimonios de fe y milagros', '#06B6D4', 'star', 7, true),
('Especiales', 'especiales', 'Mensajes para ocasiones especiales', '#EC4899', 'gift', 8, true);

-- Insertar series de ejemplo
INSERT INTO sermon_series (name, slug, description, start_date, end_date, is_active) VALUES
('Fundamentos de la Fe', 'fundamentos-fe', 'Serie sobre los pilares fundamentales del cristianismo', '2024-01-01', '2024-03-31', true),
('El Carácter de Cristo', 'caracter-cristo', 'Desarrollando el carácter de Cristo en nuestras vidas', '2024-04-01', '2024-06-30', true),
('Promesas de Dios', 'promesas-dios', 'Explorando las promesas bíblicas para nuestras vidas', '2024-07-01', '2024-09-30', true),
('Navidad 2024', 'navidad-2024', 'Mensajes especiales para la temporada navideña', '2024-12-01', '2024-12-31', true);

COMMIT;