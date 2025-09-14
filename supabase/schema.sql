-- Crear tabla de usuarios personalizada
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de eventos
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  type TEXT NOT NULL,
  location JSONB NOT NULL,
  description TEXT,
  capacity INTEGER,
  registrations INTEGER DEFAULT 0,
  image TEXT,
  host TEXT,
  requires_rsvp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de prédicas
CREATE TABLE IF NOT EXISTS public.sermons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  speaker TEXT NOT NULL,
  date DATE NOT NULL,
  audio_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  scripture TEXT,
  tags TEXT[],
  series TEXT,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author JSONB NOT NULL,
  cover_image TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  category TEXT,
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear función para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar el campo updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sermons_updated_at
BEFORE UPDATE ON public.sermons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Crear políticas de seguridad para la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir a los usuarios ver su propia información
CREATE POLICY "Users can view own user data" ON public.users
FOR SELECT
USING (auth.uid() = id);

-- Política para permitir a los usuarios actualizar su propia información
CREATE POLICY "Users can update own user data" ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- Política para permitir a los administradores ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política para permitir a los administradores actualizar todos los usuarios
CREATE POLICY "Admins can update all users" ON public.users
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política para permitir la inserción automática de nuevos usuarios
CREATE POLICY "Allow automatic user creation" ON public.users
FOR INSERT
WITH CHECK (true);

-- Crear políticas de seguridad para la tabla events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Política para permitir a todos ver eventos
CREATE POLICY "Everyone can view events" ON public.events
FOR SELECT
TO authenticated, anon
USING (true);

-- Política para permitir a los administradores y editores crear eventos
CREATE POLICY "Admins and editors can create events" ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'editor' OR role = 'pastor')
  )
);

-- Política para permitir a los administradores y editores actualizar eventos
CREATE POLICY "Admins and editors can update events" ON public.events
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'editor' OR role = 'pastor')
  )
);

-- Política para permitir a los administradores y editores eliminar eventos
CREATE POLICY "Admins and editors can delete events" ON public.events
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'editor' OR role = 'pastor')
  )
);

-- Crear políticas de seguridad para la tabla sermons
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

-- Política para permitir a todos ver prédicas
CREATE POLICY "Everyone can view sermons" ON public.sermons
FOR SELECT
TO authenticated, anon
USING (true);

-- Política para permitir a los administradores y pastores crear prédicas
CREATE POLICY "Admins and pastors can create sermons" ON public.sermons
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pastor')
  )
);

-- Política para permitir a los administradores y pastores actualizar prédicas
CREATE POLICY "Admins and pastors can update sermons" ON public.sermons
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pastor')
  )
);

-- Política para permitir a los administradores y pastores eliminar prédicas
CREATE POLICY "Admins and pastors can delete sermons" ON public.sermons
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pastor')
  )
);

-- Crear políticas de seguridad para la tabla blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Política para permitir a todos ver posts del blog
CREATE POLICY "Everyone can view blog posts" ON public.blog_posts
FOR SELECT
TO authenticated, anon
USING (true);

-- Política para permitir a los administradores y editores crear posts del blog
CREATE POLICY "Admins and editors can create blog posts" ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'editor' OR role = 'pastor')
  )
);

-- Política para permitir a los administradores y editores actualizar posts del blog
CREATE POLICY "Admins and editors can update blog posts" ON public.blog_posts
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'editor' OR role = 'pastor')
  )
);

-- Política para permitir a los administradores y editores eliminar posts del blog
CREATE POLICY "Admins and editors can delete blog posts" ON public.blog_posts
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'editor' OR role = 'pastor')
  )
);

-- Crear función para manejar nuevos registros de usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si el usuario ya existe en public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        -- Si ya existe, actualizar la información
        UPDATE public.users SET
            email = NEW.email,
            name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            role = COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
            updated_at = NOW()
        WHERE id = NEW.id;
        
        RAISE NOTICE 'Usuario actualizado en public.users: %', NEW.id;
    ELSE
        -- Si no existe, insertarlo
        INSERT INTO public.users (id, email, name, role, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
            NEW.created_at,
            NOW()
        );
        
        RAISE NOTICE 'Usuario insertado en public.users: %', NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log detallado del error
        RAISE WARNING 'Error en handle_new_user para usuario %: % - %', NEW.id, SQLSTATE, SQLERRM;
        -- No fallar el proceso de autenticación
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para manejar nuevos registros de usuarios
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Tabla de comentarios
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('blog', 'sermon')),
  post_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_comments_post ON public.comments(post_type, post_id);
CREATE INDEX idx_comments_author ON public.comments(author_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at);

-- Trigger para actualizar updated_at en comentarios
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();



-- Políticas RLS para comentarios
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Política de lectura: todos pueden leer comentarios aprobados
CREATE POLICY "Comentarios públicos de lectura"
ON public.comments
FOR SELECT
TO public
USING (is_approved = true);

-- Política de lectura para usuarios autenticados: pueden ver sus propios comentarios
CREATE POLICY "Usuarios pueden ver sus comentarios"
ON public.comments
FOR SELECT
TO authenticated
USING (author_id = auth.uid());

-- Política de inserción: usuarios autenticados pueden crear comentarios
CREATE POLICY "Usuarios autenticados pueden comentar"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- Política de actualización: usuarios pueden editar sus propios comentarios
CREATE POLICY "Usuarios pueden editar sus comentarios"
ON public.comments
FOR UPDATE
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

-- Política de eliminación: usuarios pueden eliminar sus propios comentarios
CREATE POLICY "Usuarios pueden eliminar sus comentarios"
ON public.comments
FOR DELETE
TO authenticated
USING (author_id = auth.uid());

-- Política de administración: admins y pastores pueden gestionar todos los comentarios
CREATE POLICY "Administradores pueden gestionar comentarios"
ON public.comments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pastor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pastor')
  )
);