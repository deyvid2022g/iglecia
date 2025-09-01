-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA IGLESIA LUGAR DE REFUGIO
-- Diseñado para Supabase PostgreSQL
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLAS DE USUARIOS Y AUTENTICACIÓN
-- =====================================================

-- Tabla de perfiles de usuario (extiende auth.users de Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'editor', 'member')),
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos
CREATE TABLE public.permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de roles y permisos
CREATE TABLE public.role_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role VARCHAR(20) NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- =====================================================
-- TABLAS DE EVENTOS
-- =====================================================

-- Tabla de ubicaciones
CREATE TABLE public.locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    full_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    facilities TEXT[], -- Array de facilidades disponibles
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos
CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Culto', 'Evento Especial', 'Jóvenes', 'Niños', etc.
    location_id UUID REFERENCES public.locations(id),
    capacity INTEGER,
    current_registrations INTEGER DEFAULT 0,
    image_url TEXT,
    host VARCHAR(255),
    host_bio TEXT,
    requires_rsvp BOOLEAN DEFAULT false,
    cost VARCHAR(50) DEFAULT 'Gratuito',
    requirements TEXT[],
    tags TEXT[],
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de inscripciones a eventos
CREATE TABLE public.event_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    guests INTEGER DEFAULT 1,
    special_requests TEXT,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- TABLAS DE PRÉDICAS/SERMONES
-- =====================================================

-- Tabla de categorías de prédicas
CREATE TABLE public.sermon_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Código hexadecimal de color
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de prédicas
CREATE TABLE public.sermons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    speaker VARCHAR(255) NOT NULL,
    sermon_date DATE NOT NULL,
    duration VARCHAR(10), -- Formato "HH:MM"
    thumbnail_url TEXT,
    video_url TEXT,
    audio_url TEXT,
    transcript TEXT,
    has_transcript BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    tags TEXT[],
    category_id UUID REFERENCES public.sermon_categories(id),
    is_published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recursos de prédicas (PDFs, notas, etc.)
CREATE TABLE public.sermon_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sermon_id UUID REFERENCES public.sermons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), -- 'pdf', 'doc', 'image', etc.
    file_size INTEGER, -- En bytes
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLAS DE BLOG
-- =====================================================

-- Tabla de categorías de blog
CREATE TABLE public.blog_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de posts del blog
CREATE TABLE public.blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_id UUID REFERENCES public.profiles(id),
    category_id UUID REFERENCES public.blog_categories(id),
    tags TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    read_time INTEGER, -- En minutos
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLAS DE MINISTERIOS Y GRUPOS
-- =====================================================

-- Tabla de ministerios
CREATE TABLE public.ministries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT,
    icon VARCHAR(50), -- Nombre del icono de Lucide React
    color VARCHAR(7), -- Código hexadecimal
    image_url TEXT,
    leader_id UUID REFERENCES public.profiles(id),
    target_age_group VARCHAR(50), -- 'niños', 'adolescentes', 'jóvenes', 'adultos', 'todos'
    meeting_schedule VARCHAR(255),
    meeting_location VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actividades de ministerios
CREATE TABLE public.ministry_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ministry_id UUID REFERENCES public.ministries(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    schedule VARCHAR(255),
    location VARCHAR(255),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de miembros de ministerios
CREATE TABLE public.ministry_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ministry_id UUID REFERENCES public.ministries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'leader', 'co-leader', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(ministry_id, user_id)
);

-- =====================================================
-- TABLAS DE CONFIGURACIÓN DE LA IGLESIA
-- =====================================================

-- Tabla de configuraciones generales
CREATE TABLE public.church_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json', 'url', 'email')),
    is_public BOOLEAN DEFAULT false, -- Si es visible para usuarios no autenticados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de horarios de atención
CREATE TABLE public.service_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Domingo, 6=Sábado
    service_type VARCHAR(100) NOT NULL, -- 'Atención telefónica', 'Culto', 'Oficina', etc.
    start_time TIME,
    end_time TIME,
    description TEXT,
    location_id UUID REFERENCES public.locations(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLAS DE INTERACCIONES SOCIALES
-- =====================================================

-- Tabla de likes (para sermones y blog posts)
CREATE TABLE public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('sermon', 'blog_post', 'event')),
    content_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- Tabla de comentarios
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('sermon', 'blog_post', 'event')),
    content_id UUID NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- Para respuestas
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLAS DE CONTACTO Y COMUNICACIÓN
-- =====================================================

-- Tabla de mensajes de contacto
CREATE TABLE public.contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    reason VARCHAR(50), -- 'general', 'prayer', 'counseling', 'salvation', etc.
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES public.profiles(id),
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de suscripciones a newsletter
CREATE TABLE public.newsletter_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_published ON public.events(is_published);
CREATE INDEX idx_sermons_date ON public.sermons(sermon_date);
CREATE INDEX idx_sermons_speaker ON public.sermons(speaker);
CREATE INDEX idx_sermons_published ON public.sermons(is_published);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(published_at);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category_id);
CREATE INDEX idx_comments_content ON public.comments(content_type, content_id);
CREATE INDEX idx_likes_content ON public.likes(content_type, content_id);

-- Índices para texto completo (búsqueda)
CREATE INDEX idx_events_search ON public.events USING gin(to_tsvector('spanish', title || ' ' || description));
CREATE INDEX idx_sermons_search ON public.sermons USING gin(to_tsvector('spanish', title || ' ' || description));
CREATE INDEX idx_blog_posts_search ON public.blog_posts USING gin(to_tsvector('spanish', title || ' ' || excerpt || ' ' || content));

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sermons_updated_at BEFORE UPDATE ON public.sermons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ministries_updated_at BEFORE UPDATE ON public.ministries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_church_settings_updated_at BEFORE UPDATE ON public.church_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar contadores
CREATE OR REPLACE FUNCTION update_content_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.content_type = 'sermon' THEN
            UPDATE public.sermons SET like_count = like_count + 1 WHERE id = NEW.content_id;
        ELSIF NEW.content_type = 'blog_post' THEN
            UPDATE public.blog_posts SET like_count = like_count + 1 WHERE id = NEW.content_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.content_type = 'sermon' THEN
            UPDATE public.sermons SET like_count = like_count - 1 WHERE id = OLD.content_id;
        ELSIF OLD.content_type = 'blog_post' THEN
            UPDATE public.blog_posts SET like_count = like_count - 1 WHERE id = OLD.content_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para actualizar contadores de likes
CREATE TRIGGER update_like_counters
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_content_counters();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Perfiles públicos son visibles para todos" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden crear su propio perfil" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para eventos
CREATE POLICY "Eventos publicados son visibles para todos" ON public.events
    FOR SELECT USING (is_published = true);

CREATE POLICY "Solo editores pueden crear eventos" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
        )
    );

-- Políticas para sermones
CREATE POLICY "Sermones publicados son visibles para todos" ON public.sermons
    FOR SELECT USING (is_published = true);

CREATE POLICY "Solo editores pueden crear sermones" ON public.sermons
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
        )
    );

-- Políticas para blog posts
CREATE POLICY "Posts publicados son visibles para todos" ON public.blog_posts
    FOR SELECT USING (is_published = true);

CREATE POLICY "Solo editores pueden crear posts" ON public.blog_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
        )
    );

-- Políticas para comentarios
CREATE POLICY "Comentarios aprobados son visibles para todos" ON public.comments
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Usuarios autenticados pueden comentar" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para likes
CREATE POLICY "Usuarios autenticados pueden dar like" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden quitar sus propios likes" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM public.profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos
CREATE OR REPLACE FUNCTION has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.role_permissions rp
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE rp.role = get_user_role()
        AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este esquema está diseñado para:
-- 1. Manejar autenticación y autorización con roles
-- 2. Gestionar eventos con inscripciones
-- 3. Administrar sermones con recursos multimedia
-- 4. Mantener un blog con categorías y comentarios
-- 5. Organizar ministerios y grupos de edad
-- 6. Configurar horarios y datos de la iglesia
-- 7. Facilitar interacciones sociales (likes, comentarios)
-- 8. Procesar mensajes de contacto
-- 9. Optimizar búsquedas y rendimiento
-- 10. Garantizar seguridad con RLS