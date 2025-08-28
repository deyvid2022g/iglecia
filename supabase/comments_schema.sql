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

-- Política de lectura: todos pueden ver comentarios aprobados y no eliminados
CREATE POLICY "Comentarios visibles para todos" ON public.comments
FOR SELECT
TO public
USING (is_approved = true AND is_deleted = false);

-- Política de inserción: usuarios autenticados pueden crear comentarios
CREATE POLICY "Usuarios autenticados pueden comentar" ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Política de actualización: usuarios pueden editar sus propios comentarios
CREATE POLICY "Usuarios pueden editar sus comentarios" ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Política de actualización para moderadores: admin, pastor y editor pueden moderar
CREATE POLICY "Moderadores pueden gestionar comentarios" ON public.comments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pastor' OR role = 'editor')
  )
);

-- Política de eliminación: usuarios pueden eliminar sus comentarios
CREATE POLICY "Usuarios pueden eliminar sus comentarios" ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Política de eliminación para moderadores
CREATE POLICY "Moderadores pueden eliminar comentarios" ON public.comments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'pastor' OR role = 'editor')
  )
);