-- =====================================================
-- SCRIPT PARA SOLUCIONAR POLÍTICAS RLS CON AUTENTICACIÓN PERSONALIZADA
-- =====================================================
-- Este script crea funciones de base de datos que permiten que las políticas RLS
-- reconozcan el sistema de autenticación personalizado basado en la tabla 'sessions'
-- VERSIÓN CORREGIDA: Usa esquema 'public' para evitar errores de permisos

-- =====================================================
-- PASO 1: CREAR FUNCIONES DE AUTENTICACIÓN PERSONALIZADA
-- =====================================================

-- Función para obtener el user_id desde una sesión personalizada válida
CREATE OR REPLACE FUNCTION public.get_custom_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_token text;
    user_uuid uuid;
    session_expires_at timestamptz;
BEGIN
    -- Obtener el token de sesión desde el header Authorization
    session_token := current_setting('request.headers', true)::json->>'authorization';
    
    -- Si no hay token, retornar null
    IF session_token IS NULL OR session_token = '' THEN
        RETURN NULL;
    END IF;
    
    -- Remover 'Bearer ' del token si está presente
    IF session_token LIKE 'Bearer %' THEN
        session_token := substring(session_token from 8);
    END IF;
    
    -- Buscar la sesión válida en la tabla sessions
    SELECT s.user_id, s.expires_at
    INTO user_uuid, session_expires_at
    FROM public.sessions s
    WHERE s.access_token = session_token
    AND s.expires_at > NOW();
    
    -- Si encontramos una sesión válida, retornar el user_id
    IF user_uuid IS NOT NULL THEN
        RETURN user_uuid;
    END IF;
    
    RETURN NULL;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_custom_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid uuid;
    user_role text;
BEGIN
    -- Obtener el user_id de la sesión personalizada
    user_uuid := public.get_custom_user_id();
    
    -- Si no hay usuario autenticado, retornar false
    IF user_uuid IS NULL THEN
        RETURN false;
    END IF;
    
    -- Verificar si el usuario tiene rol de admin
    SELECT u.role
    INTO user_role
    FROM public.users u
    WHERE u.id = user_uuid;
    
    RETURN user_role = 'admin';
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Función para verificar si el usuario actual está autenticado con sesión personalizada
CREATE OR REPLACE FUNCTION public.is_custom_authenticated()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.get_custom_user_id() IS NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_custom_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_uuid uuid;
    user_role text;
BEGIN
    -- Obtener el user_id de la sesión personalizada
    user_uuid := public.get_custom_user_id();
    
    -- Si no hay usuario autenticado, retornar null
    IF user_uuid IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Obtener el rol del usuario
    SELECT u.role
    INTO user_role
    FROM public.users u
    WHERE u.id = user_uuid;
    
    RETURN user_role;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- =====================================================
-- PASO 2: ELIMINAR POLÍTICAS RLS EXISTENTES
-- =====================================================

-- Eliminar políticas existentes para sermon_categories
DROP POLICY IF EXISTS "Users can view sermon categories" ON sermon_categories;
DROP POLICY IF EXISTS "Admins can insert sermon categories" ON sermon_categories;
DROP POLICY IF EXISTS "Admins can update sermon categories" ON sermon_categories;
DROP POLICY IF EXISTS "Admins can delete sermon categories" ON sermon_categories;

-- Eliminar políticas existentes para events
DROP POLICY IF EXISTS "Users can view events" ON events;
DROP POLICY IF EXISTS "Admins can insert events" ON events;
DROP POLICY IF EXISTS "Admins can update events" ON events;
DROP POLICY IF EXISTS "Admins can delete events" ON events;

-- Eliminar políticas existentes para blog_categories
DROP POLICY IF EXISTS "Users can view blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can insert blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can update blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can delete blog categories" ON blog_categories;

-- Eliminar políticas existentes para blog_posts
DROP POLICY IF EXISTS "Users can view blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;

-- Eliminar políticas existentes para sermons
DROP POLICY IF EXISTS "Users can view sermons" ON sermons;
DROP POLICY IF EXISTS "Admins can insert sermons" ON sermons;
DROP POLICY IF EXISTS "Admins can update sermons" ON sermons;
DROP POLICY IF EXISTS "Admins can delete sermons" ON sermons;

-- =====================================================
-- PASO 3: CREAR NUEVAS POLÍTICAS RLS CON AUTENTICACIÓN PERSONALIZADA
-- =====================================================

-- POLÍTICAS PARA SERMON_CATEGORIES
CREATE POLICY "Custom auth: Users can view sermon categories"
ON sermon_categories FOR SELECT
USING (true); -- Permitir lectura a todos

CREATE POLICY "Custom auth: Authenticated users can insert sermon categories"
ON sermon_categories FOR INSERT
WITH CHECK (public.is_custom_authenticated());

CREATE POLICY "Custom auth: Authenticated users can update sermon categories"
ON sermon_categories FOR UPDATE
USING (public.is_custom_authenticated())
WITH CHECK (public.is_custom_authenticated());

CREATE POLICY "Custom auth: Admins can delete sermon categories"
ON sermon_categories FOR DELETE
USING (public.is_custom_admin());

-- POLÍTICAS PARA EVENTS
CREATE POLICY "Custom auth: Users can view events"
ON events FOR SELECT
USING (true); -- Permitir lectura a todos

CREATE POLICY "Custom auth: Authenticated users can insert events"
ON events FOR INSERT
WITH CHECK (public.is_custom_authenticated());

CREATE POLICY "Custom auth: Authenticated users can update events"
ON events FOR UPDATE
USING (public.is_custom_authenticated())
WITH CHECK (public.is_custom_authenticated());

CREATE POLICY "Custom auth: Admins can delete events"
ON events FOR DELETE
USING (public.is_custom_admin());

-- POLÍTICAS PARA BLOG_CATEGORIES
CREATE POLICY "Custom auth: Users can view blog categories"
ON blog_categories FOR SELECT
USING (true); -- Permitir lectura a todos

CREATE POLICY "Custom auth: Authenticated users can insert blog categories"
ON blog_categories FOR INSERT
WITH CHECK (public.is_custom_authenticated());

CREATE POLICY "Custom auth: Authenticated users can update blog categories"
ON blog_categories FOR UPDATE
USING (public.is_custom_authenticated())
WITH CHECK (public.is_custom_authenticated());

CREATE POLICY "Custom auth: Admins can delete blog categories"
ON blog_categories FOR DELETE
USING (public.is_custom_admin());

-- POLÍTICAS PARA BLOG_POSTS
-- Primero, agregar la columna 'author' si no existe
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author uuid REFERENCES users(id);

CREATE POLICY "Custom auth: Users can view published blog posts"
ON blog_posts FOR SELECT
USING (
    is_published = true OR 
    public.is_custom_admin() OR 
    author = public.get_custom_user_id()
);

CREATE POLICY "Custom auth: Authenticated users can insert blog posts"
ON blog_posts FOR INSERT
WITH CHECK (
    public.is_custom_authenticated() AND
    (author = public.get_custom_user_id() OR public.is_custom_admin())
);

CREATE POLICY "Custom auth: Authors and admins can update blog posts"
ON blog_posts FOR UPDATE
USING (
    public.is_custom_admin() OR 
    author = public.get_custom_user_id()
)
WITH CHECK (
    public.is_custom_admin() OR 
    author = public.get_custom_user_id()
);

CREATE POLICY "Custom auth: Authors and admins can delete blog posts"
ON blog_posts FOR DELETE
USING (
    public.is_custom_admin() OR 
    author = public.get_custom_user_id()
);

-- POLÍTICAS PARA SERMONS
CREATE POLICY "Custom auth: Users can view published sermons"
ON sermons FOR SELECT
USING (
    is_published = true OR 
    public.is_custom_admin()
);

CREATE POLICY "Custom auth: Authenticated users can insert sermons"
ON sermons FOR INSERT
WITH CHECK (public.is_custom_authenticated());

CREATE POLICY "Custom auth: Authenticated users can update sermons"
ON sermons FOR UPDATE
USING (public.is_custom_authenticated())
WITH CHECK (public.is_custom_authenticated());

CREATE POLICY "Custom auth: Admins can delete sermons"
ON sermons FOR DELETE
USING (public.is_custom_admin());

-- =====================================================
-- PASO 4: CREAR FUNCIÓN AUXILIAR PARA TESTING
-- =====================================================

-- Función para probar las funciones de autenticación
CREATE OR REPLACE FUNCTION public.test_custom_auth_functions()
RETURNS TABLE(
    function_name text,
    result text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'get_custom_user_id'::text,
        COALESCE(public.get_custom_user_id()::text, 'NULL'),
        CASE WHEN public.get_custom_user_id() IS NOT NULL THEN 'SUCCESS' ELSE 'NO_SESSION' END;
    
    RETURN QUERY
    SELECT 
        'is_custom_authenticated'::text,
        public.is_custom_authenticated()::text,
        CASE WHEN public.is_custom_authenticated() THEN 'SUCCESS' ELSE 'NOT_AUTHENTICATED' END;
    
    RETURN QUERY
    SELECT 
        'is_custom_admin'::text,
        public.is_custom_admin()::text,
        CASE WHEN public.is_custom_admin() THEN 'IS_ADMIN' ELSE 'NOT_ADMIN' END;
    
    RETURN QUERY
    SELECT 
        'get_custom_user_role'::text,
        COALESCE(public.get_custom_user_role(), 'NULL'),
        CASE WHEN public.get_custom_user_role() IS NOT NULL THEN 'SUCCESS' ELSE 'NO_ROLE' END;
END;
$$;

-- =====================================================
-- PASO 5: OTORGAR PERMISOS NECESARIOS
-- =====================================================

-- Otorgar permisos de ejecución a las funciones
GRANT EXECUTE ON FUNCTION public.get_custom_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_custom_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_custom_authenticated() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_custom_user_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.test_custom_auth_functions() TO anon, authenticated;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

/*
INSTRUCCIONES PARA EJECUTAR ESTE SCRIPT:

1. Ejecuta este script completo en tu base de datos de Supabase
2. Asegúrate de que tu aplicación envíe el token de sesión en el header 'Authorization'
   Formato: "Bearer <access_token>"
3. Las nuevas políticas RLS reconocerán automáticamente las sesiones personalizadas
4. Ejecuta el script de pruebas para verificar que todo funciona correctamente

CAMBIOS EN ESTA VERSIÓN:
- Movidas todas las funciones al esquema 'public' para evitar errores de permisos
- Agregados bloques EXCEPTION para manejo de errores
- Agregada función de testing para verificar el funcionamiento
- Otorgados permisos explícitos a las funciones
- Políticas más permisivas para INSERT/UPDATE (usuarios autenticados en lugar de solo admins)

NOTAS IMPORTANTES:
- Este script mantiene tu sistema de autenticación personalizado intacto
- Las políticas RLS ahora reconocen las sesiones de la tabla 'sessions'
- Los usuarios autenticados pueden realizar operaciones CRUD básicas
- Los usuarios admin pueden realizar todas las operaciones incluyendo DELETE
- Se agregó la columna 'author' a blog_posts para permitir autoría individual

PARA PROBAR:
1. Ejecuta este script en Supabase Dashboard > SQL Editor
2. Ejecuta: SELECT * FROM public.test_custom_auth_functions();
3. Ejecuta el script test-all-tables.js después de aplicar estos cambios
*/