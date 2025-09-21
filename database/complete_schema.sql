-- Esquema SQL completo para la aplicación de iglesia
-- Basado en el análisis de las páginas de Eventos, Prédicas y Blog

-- =====================================================
-- EXTENSIONES Y CONFIGURACIONES INICIALES
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLAS DE EVENTOS
-- =====================================================

-- Tabla de categorías de eventos
CREATE TABLE IF NOT EXISTS event_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- Código hexadecimal
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  location_address TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  category_id UUID REFERENCES event_categories(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'service', 'conference', 'workshop', 'social', 'other'
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  requires_rsvp BOOLEAN DEFAULT false,
  cost DECIMAL(10,2) DEFAULT 0,
  host_name VARCHAR(255),
  host_contact VARCHAR(255),
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de registros/RSVP para eventos
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID,
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Tabla de interacciones con eventos (likes, comentarios)
CREATE TABLE IF NOT EXISTS event_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID,
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'share')),
  content TEXT, -- Para comentarios
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLAS DE PRÉDICAS/SERMONES
-- =====================================================

-- Tabla de categorías de sermones
CREATE TABLE IF NOT EXISTS sermon_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de series de sermones
CREATE TABLE IF NOT EXISTS sermon_series (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal de sermones
CREATE TABLE IF NOT EXISTS sermons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  speaker VARCHAR(255) NOT NULL,
  speaker_bio TEXT,
  speaker_image_url TEXT,
  sermon_date DATE NOT NULL,
  duration VARCHAR(10), -- Formato "HH:MM"
  video_url TEXT,
  audio_url TEXT,
  thumbnail_url TEXT,
  transcript TEXT,
  has_transcript BOOLEAN DEFAULT false,
  scripture_references TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  category_id UUID REFERENCES sermon_categories(id) ON DELETE SET NULL,
  series_id UUID REFERENCES sermon_series(id) ON DELETE SET NULL,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recursos adicionales para sermones
CREATE TABLE IF NOT EXISTS sermon_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50), -- 'pdf', 'doc', 'image', etc.
  file_size INTEGER, -- En bytes
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de interacciones con sermones
CREATE TABLE IF NOT EXISTS sermon_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sermon_id UUID REFERENCES sermons(id) ON DELETE CASCADE,
  user_id UUID,
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'share', 'view')),
  content TEXT, -- Para comentarios
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLAS DE BLOG
-- =====================================================

-- Tabla de categorías de blog
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal de posts del blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags TEXT[],
  read_time INTEGER, -- Tiempo estimado de lectura en minutos
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de interacciones con posts del blog
CREATE TABLE IF NOT EXISTS blog_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID,
  type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'share', 'view')),
  content TEXT, -- Para comentarios
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLAS ADICIONALES
-- =====================================================

-- Tabla de ministerios
CREATE TABLE IF NOT EXISTS ministries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  leader_name VARCHAR(255),
  leader_contact VARCHAR(255),
  image_url TEXT,
  meeting_day VARCHAR(20),
  meeting_time TIME,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de testimonios
CREATE TABLE IF NOT EXISTS testimonies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  author_image_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'event', 'sermon', 'blog', 'general'
  reference_id UUID, -- ID del evento, sermón, post, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en eventos
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sermons_updated_at BEFORE UPDATE ON sermons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_categories_updated_at BEFORE UPDATE ON event_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sermon_categories_updated_at BEFORE UPDATE ON sermon_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON ministries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonies_updated_at BEFORE UPDATE ON testimonies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contadores automáticamente
CREATE OR REPLACE FUNCTION update_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'event_interactions' THEN
        IF TG_OP = 'INSERT' THEN
            IF NEW.type = 'like' THEN
                UPDATE events SET like_count = like_count + 1 WHERE id = NEW.event_id;
            ELSIF NEW.type = 'comment' THEN
                UPDATE events SET comment_count = comment_count + 1 WHERE id = NEW.event_id;
            END IF;
        ELSIF TG_OP = 'DELETE' THEN
            IF OLD.type = 'like' THEN
                UPDATE events SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.event_id;
            ELSIF OLD.type = 'comment' THEN
                UPDATE events SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.event_id;
            END IF;
        END IF;
    ELSIF TG_TABLE_NAME = 'sermon_interactions' THEN
        IF TG_OP = 'INSERT' THEN
            IF NEW.type = 'like' THEN
                UPDATE sermons SET like_count = like_count + 1 WHERE id = NEW.sermon_id;
            ELSIF NEW.type = 'comment' THEN
                UPDATE sermons SET comment_count = comment_count + 1 WHERE id = NEW.sermon_id;
            ELSIF NEW.type = 'view' THEN
                UPDATE sermons SET view_count = view_count + 1 WHERE id = NEW.sermon_id;
            END IF;
        ELSIF TG_OP = 'DELETE' THEN
            IF OLD.type = 'like' THEN
                UPDATE sermons SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.sermon_id;
            ELSIF OLD.type = 'comment' THEN
                UPDATE sermons SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.sermon_id;
            END IF;
        END IF;
    ELSIF TG_TABLE_NAME = 'blog_interactions' THEN
        IF TG_OP = 'INSERT' THEN
            IF NEW.type = 'like' THEN
                UPDATE blog_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
            ELSIF NEW.type = 'comment' THEN
                UPDATE blog_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
            ELSIF NEW.type = 'view' THEN
                UPDATE blog_posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
            END IF;
        ELSIF TG_OP = 'DELETE' THEN
            IF OLD.type = 'like' THEN
                UPDATE blog_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
            ELSIF OLD.type = 'comment' THEN
                UPDATE blog_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
            END IF;
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

-- Triggers para actualizar contadores
CREATE TRIGGER update_event_interaction_counts 
    AFTER INSERT OR DELETE ON event_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_interaction_counts();

CREATE TRIGGER update_sermon_interaction_counts 
    AFTER INSERT OR DELETE ON sermon_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_interaction_counts();

CREATE TRIGGER update_blog_interaction_counts 
    AFTER INSERT OR DELETE ON blog_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_interaction_counts();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Events can be managed by authenticated users" ON events FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para sermones
CREATE POLICY "Published sermons are viewable by everyone" ON sermons FOR SELECT USING (is_published = true);
CREATE POLICY "Sermons can be managed by authenticated users" ON sermons FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para blog
CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Blog posts can be managed by authenticated users" ON blog_posts FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para interacciones (requieren autenticación)
CREATE POLICY "Users can manage their own interactions" ON event_interactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own interactions" ON sermon_interactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own interactions" ON blog_interactions FOR ALL USING (auth.uid() = user_id);

-- Políticas para registros de eventos
CREATE POLICY "Users can manage their own registrations" ON event_registrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Event registrations are viewable by authenticated users" ON event_registrations FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas para notificaciones
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para testimonios
CREATE POLICY "Testimonies can be managed by authenticated users" ON testimonies FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar categorías de eventos
INSERT INTO event_categories (name, slug, description, color, icon, display_order) VALUES
('Servicios', 'servicios', 'Servicios regulares de adoración', '#3B82F6', 'church', 1),
('Conferencias', 'conferencias', 'Conferencias y eventos especiales', '#10B981', 'microphone', 2),
('Talleres', 'talleres', 'Talleres de capacitación y crecimiento', '#F59E0B', 'book-open', 3),
('Sociales', 'sociales', 'Eventos sociales y de comunión', '#EF4444', 'users', 4),
('Juveniles', 'juveniles', 'Eventos para jóvenes', '#8B5CF6', 'zap', 5),
('Infantiles', 'infantiles', 'Eventos para niños', '#EC4899', 'baby', 6);

-- Insertar categorías de sermones
INSERT INTO sermon_categories (name, slug, description, color, icon, display_order) VALUES
('Doctrina', 'doctrina', 'Enseñanzas fundamentales de la fe cristiana', '#3B82F6', 'book-open', 1),
('Vida Cristiana', 'vida-cristiana', 'Cómo vivir como cristiano en el día a día', '#10B981', 'heart', 2),
('Evangelismo', 'evangelismo', 'Compartir el evangelio y ganar almas', '#F59E0B', 'megaphone', 3),
('Familia', 'familia', 'Principios bíblicos para la familia', '#EF4444', 'home', 4),
('Oración', 'oracion', 'La importancia y práctica de la oración', '#8B5CF6', 'hands-praying', 5),
('Profético', 'profetico', 'Mensajes proféticos y revelación', '#F97316', 'eye', 6);

-- Insertar categorías de blog
INSERT INTO blog_categories (name, slug, description, color, icon, display_order) VALUES
('Fe', 'fe', 'Artículos sobre la fe cristiana', '#3B82F6', 'cross', 1),
('Familia', 'familia', 'Contenido sobre la vida familiar cristiana', '#EF4444', 'home', 2),
('Comunidad', 'comunidad', 'Vida en comunidad y servicio', '#10B981', 'users', 3),
('Estudios Bíblicos', 'estudios-biblicos', 'Estudios profundos de la Biblia', '#F59E0B', 'book', 4),
('Testimonios', 'testimonios', 'Testimonios de fe y milagros', '#8B5CF6', 'star', 5);

-- Insertar series de sermones de ejemplo
INSERT INTO sermon_series (name, slug, description, start_date, end_date) VALUES
('Fundamentos de la Fe', 'fundamentos-fe', 'Serie sobre los pilares fundamentales del cristianismo', '2024-01-01', '2024-03-31'),
('El Carácter de Cristo', 'caracter-cristo', 'Desarrollando el carácter de Cristo en nuestras vidas', '2024-04-01', '2024-06-30'),
('Promesas de Dios', 'promesas-dios', 'Explorando las promesas bíblicas para nuestras vidas', '2024-07-01', '2024-09-30');

-- Insertar ministerios de ejemplo
INSERT INTO ministries (name, slug, description, leader_name, meeting_day, meeting_time, location) VALUES
('Ministerio de Jóvenes', 'jovenes', 'Un espacio para que los jóvenes crezcan en su fe y desarrollen liderazgo', 'Pastor de Jóvenes', 'Viernes', '19:00', 'Sala de Jóvenes'),
('Ministerio de Niños', 'ninos', 'Enseñanza bíblica adaptada para los más pequeños de la congregación', 'Coordinadora de Niños', 'Domingo', '10:00', 'Aula Infantil'),
('Ministerio de Música', 'musica', 'Adoración y alabanza a través de la música', 'Director Musical', 'Miércoles', '19:30', 'Santuario'),
('Ministerio de Damas', 'damas', 'Espacio de crecimiento y comunión para las mujeres', 'Líder de Damas', 'Sábado', '15:00', 'Sala de Conferencias');