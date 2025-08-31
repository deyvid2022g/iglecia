-- Migración para tablas del blog
-- Archivo: 003_blog_tables.sql

-- Crear tabla de categorías del blog
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- Código hexadecimal para color
  icon VARCHAR(50), -- Nombre del ícono
  display_order INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de posts del blog
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags TEXT[], -- Array de tags
  published_at TIMESTAMP WITH TIME ZONE,
  read_time INTEGER, -- Tiempo estimado de lectura en minutos
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  -- SEO fields
  seo_title VARCHAR(255),
  seo_description TEXT,
  seo_keywords TEXT[],
  -- Social media
  social_image_url TEXT,
  social_title VARCHAR(255),
  social_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de comentarios (unificada para eventos, sermones y blog)
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Campos para usuarios no registrados
  guest_name VARCHAR(255),
  guest_email VARCHAR(255),
  -- Referencia polimórfica al contenido
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('event', 'sermon', 'blog_post')),
  content_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Para respuestas
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para asegurar que se proporcione autor o datos de invitado
  CONSTRAINT check_author_or_guest CHECK (
    (author_id IS NOT NULL) OR 
    (guest_name IS NOT NULL AND guest_email IS NOT NULL)
  )
);

-- Crear tabla de likes (unificada para todos los contenidos)
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('event', 'sermon', 'blog_post', 'comment')),
  content_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar likes duplicados
  CONSTRAINT unique_user_content_like UNIQUE (user_id, content_type, content_id)
);

-- Crear tabla de suscripciones al newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  subscription_source VARCHAR(50) DEFAULT 'website', -- 'website', 'event', 'manual'
  preferences JSONB DEFAULT '{}', -- Preferencias de contenido
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de mensajes de contacto
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'general' CHECK (message_type IN ('general', 'prayer_request', 'counseling', 'ministry', 'event', 'complaint', 'suggestion')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Si el usuario está registrado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_view_count ON blog_posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_like_count ON blog_posts(like_count DESC);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_blog_categories_order ON blog_categories(display_order);

CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_content ON likes(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON likes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_user ON newsletter_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_type ON contact_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_contact_messages_priority ON contact_messages(priority);
CREATE INDEX IF NOT EXISTS idx_contact_messages_assigned ON contact_messages(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Crear triggers para updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Crear función para actualizar contadores de posts por categoría
CREATE OR REPLACE FUNCTION update_blog_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.category_id IS NOT NULL THEN
    UPDATE blog_categories 
    SET post_count = (
      SELECT COUNT(*) 
      FROM blog_posts 
      WHERE category_id = NEW.category_id AND is_published = true
    )
    WHERE id = NEW.category_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Actualizar categoría anterior si cambió
    IF OLD.category_id IS NOT NULL AND OLD.category_id != COALESCE(NEW.category_id, '00000000-0000-0000-0000-000000000000'::UUID) THEN
      UPDATE blog_categories 
      SET post_count = (
        SELECT COUNT(*) 
        FROM blog_posts 
        WHERE category_id = OLD.category_id AND is_published = true
      )
      WHERE id = OLD.category_id;
    END IF;
    
    -- Actualizar nueva categoría
    IF NEW.category_id IS NOT NULL THEN
      UPDATE blog_categories 
      SET post_count = (
        SELECT COUNT(*) 
        FROM blog_posts 
        WHERE category_id = NEW.category_id AND is_published = true
      )
      WHERE id = NEW.category_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
    UPDATE blog_categories 
    SET post_count = (
      SELECT COUNT(*) 
      FROM blog_posts 
      WHERE category_id = OLD.category_id AND is_published = true
    )
    WHERE id = OLD.category_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar contador de posts por categoría
CREATE TRIGGER update_blog_category_post_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_category_post_count();

-- Crear función para actualizar contadores de likes
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador según el tipo de contenido
    IF NEW.content_type = 'blog_post' THEN
      UPDATE blog_posts SET like_count = like_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'sermon' THEN
      UPDATE sermons SET like_count = like_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'comment' THEN
      UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.content_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador según el tipo de contenido
    IF OLD.content_type = 'blog_post' THEN
      UPDATE blog_posts SET like_count = like_count - 1 WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'sermon' THEN
      UPDATE sermons SET like_count = like_count - 1 WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'comment' THEN
      UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.content_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar contadores de likes
CREATE TRIGGER update_like_counts_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_like_counts();

-- Crear función para actualizar contadores de comentarios
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador según el tipo de contenido
    IF NEW.content_type = 'blog_post' THEN
      UPDATE blog_posts SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'sermon' THEN
      UPDATE sermons SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    ELSIF NEW.content_type = 'event' THEN
      -- Nota: Necesitaremos agregar comment_count a la tabla events si no existe
      -- UPDATE events SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    END IF;
    
    -- Si es una respuesta, incrementar contador del comentario padre
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador según el tipo de contenido
    IF OLD.content_type = 'blog_post' THEN
      UPDATE blog_posts SET comment_count = comment_count - 1 WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'sermon' THEN
      UPDATE sermons SET comment_count = comment_count - 1 WHERE id = OLD.content_id;
    ELSIF OLD.content_type = 'event' THEN
      -- UPDATE events SET comment_count = comment_count - 1 WHERE id = OLD.content_id;
    END IF;
    
    -- Si es una respuesta, decrementar contador del comentario padre
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE comments SET reply_count = reply_count - 1 WHERE id = OLD.parent_id;
    END IF;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar contadores de comentarios
CREATE TRIGGER update_comment_counts_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_counts();

-- Habilitar Row Level Security (RLS)
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para blog_categories
CREATE POLICY "Blog categories are viewable by everyone" ON blog_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Blog categories can be managed by admins and pastors" ON blog_categories
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para blog_posts
CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Unpublished blog posts are viewable by authors, admins and pastors" ON blog_posts
  FOR SELECT USING (
    is_published = true OR
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Blog posts can be created by authenticated users" ON blog_posts
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Blog posts can be updated by authors, admins and pastors" ON blog_posts
  FOR UPDATE USING (
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Blog posts can be deleted by admins and pastors" ON blog_posts
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para comments
CREATE POLICY "Approved comments are viewable by everyone" ON comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own comments" ON comments
  FOR SELECT USING (
    is_approved = true OR
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL OR
    (guest_name IS NOT NULL AND guest_email IS NOT NULL)
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para likes
CREATE POLICY "Users can view all likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own likes" ON likes
  FOR ALL USING (auth.uid() = user_id);

-- Políticas de seguridad para newsletter_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON newsletter_subscriptions
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own subscriptions" ON newsletter_subscriptions
  FOR UPDATE USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor') AND is_active = true
    )
  );

-- Políticas de seguridad para contact_messages
CREATE POLICY "Users can view their own messages" ON contact_messages
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

CREATE POLICY "Anyone can send contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can update contact messages" ON contact_messages
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'pastor', 'leader') AND is_active = true
    )
  );

-- Insertar categorías de blog de ejemplo
INSERT INTO blog_categories (name, slug, description, color, icon, display_order, is_active) VALUES
('Devocionales', 'devocionales', 'Reflexiones diarias y estudios bíblicos', '#3B82F6', 'book-heart', 1, true),
('Vida Cristiana', 'vida-cristiana', 'Consejos para vivir como cristiano', '#10B981', 'cross', 2, true),
('Familia', 'familia', 'Principios bíblicos para la familia', '#EF4444', 'home-heart', 3, true),
('Juventud', 'juventud', 'Contenido especial para jóvenes', '#F59E0B', 'users', 4, true),
('Testimonios', 'testimonios', 'Historias de fe y transformación', '#8B5CF6', 'heart-handshake', 5, true),
('Eventos', 'eventos', 'Noticias y cobertura de eventos', '#06B6D4', 'calendar', 6, true),
('Ministerios', 'ministerios', 'Actividades y noticias de ministerios', '#EC4899', 'users-round', 7, true),
('Noticias', 'noticias', 'Noticias generales de la iglesia', '#64748B', 'newspaper', 8, true);

COMMIT;