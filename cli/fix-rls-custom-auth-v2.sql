-- =====================================================
-- SCRIPT PARA SOLUCIONAR POLÍTICAS RLS CON AUTENTICACIÓN PERSONALIZADA
-- VERSIÓN 2: Enfoque simplificado usando service_role
-- =====================================================

-- =====================================================
-- PASO 1: DESHABILITAR RLS TEMPORALMENTE PARA TESTING
-- =====================================================

-- Deshabilitar RLS en todas las tablas para permitir operaciones con autenticación personalizada
ALTER TABLE sermon_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sermons DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 2: CREAR FUNCIONES AUXILIARES PARA VALIDACIÓN
-- =====================================================

-- Función para validar si un token de sesión es válido
CREATE OR REPLACE FUNCTION public.validate_session_token(token text)
RETURNS TABLE(user_id uuid, user_role text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_user_id uuid;
    session_user_role text;
    session_expires_at timestamptz;
BEGIN
    -- Buscar la sesión en la tabla sessions
    SELECT s.user_id, s.expires_at, u.role
    INTO session_user_id, session_expires_at, session_user_role
    FROM public.sessions s
    JOIN public.users u ON s.user_id = u.id
    WHERE s.access_token = token
    AND s.expires_at > NOW();
    
    -- Retornar resultado
    IF session_user_id IS NOT NULL THEN
        RETURN QUERY SELECT session_user_id, session_user_role, true;
    ELSE
        RETURN QUERY SELECT NULL::uuid, NULL::text, false;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT NULL::uuid, NULL::text, false;
END;
$$;

-- =====================================================
-- PASO 3: CREAR POLÍTICAS RLS SIMPLIFICADAS
-- =====================================================

-- Habilitar RLS nuevamente
ALTER TABLE sermon_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Custom auth: Users can view sermon categories" ON sermon_categories;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can insert sermon categories" ON sermon_categories;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can update sermon categories" ON sermon_categories;
DROP POLICY IF EXISTS "Custom auth: Admins can delete sermon categories" ON sermon_categories;

DROP POLICY IF EXISTS "Custom auth: Users can view events" ON events;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can update events" ON events;
DROP POLICY IF EXISTS "Custom auth: Admins can delete events" ON events;

DROP POLICY IF EXISTS "Custom auth: Users can view blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can insert blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can update blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Custom auth: Admins can delete blog categories" ON blog_categories;

DROP POLICY IF EXISTS "Custom auth: Users can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can insert blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Custom auth: Authors and admins can update blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Custom auth: Authors and admins can delete blog posts" ON blog_posts;

DROP POLICY IF EXISTS "Custom auth: Users can view published sermons" ON sermons;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can insert sermons" ON sermons;
DROP POLICY IF EXISTS "Custom auth: Authenticated users can update sermons" ON sermons;
DROP POLICY IF EXISTS "Custom auth: Admins can delete sermons" ON sermons;

-- =====================================================
-- PASO 4: CREAR POLÍTICAS PERMISIVAS PARA TESTING
-- =====================================================

-- POLÍTICAS PARA SERMON_CATEGORIES (Permisivas para testing)
CREATE POLICY "Allow all operations on sermon_categories"
ON sermon_categories
USING (true)
WITH CHECK (true);

-- POLÍTICAS PARA EVENTS (Permisivas para testing)
CREATE POLICY "Allow all operations on events"
ON events
USING (true)
WITH CHECK (true);

-- POLÍTICAS PARA BLOG_CATEGORIES (Permisivas para testing)
CREATE POLICY "Allow all operations on blog_categories"
ON blog_categories
USING (true)
WITH CHECK (true);

-- POLÍTICAS PARA BLOG_POSTS (Permisivas para testing)
-- Agregar columna author si no existe
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author uuid REFERENCES users(id);

CREATE POLICY "Allow all operations on blog_posts"
ON blog_posts
USING (true)
WITH CHECK (true);

-- POLÍTICAS PARA SERMONS (Permisivas para testing)
CREATE POLICY "Allow all operations on sermons"
ON sermons
USING (true)
WITH CHECK (true);

-- =====================================================
-- PASO 5: OTORGAR PERMISOS NECESARIOS
-- =====================================================

-- Otorgar permisos de ejecución a las funciones
GRANT EXECUTE ON FUNCTION public.validate_session_token(text) TO anon, authenticated;

-- Otorgar permisos de inserción, actualización y eliminación a anon
GRANT SELECT, INSERT, UPDATE, DELETE ON sermon_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON sermons TO anon;

-- =====================================================
-- PASO 6: FUNCIÓN DE TESTING
-- =====================================================

CREATE OR REPLACE FUNCTION public.test_rls_permissions()
RETURNS TABLE(
    table_name text,
    operation text,
    status text,
    message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Test sermon_categories
    BEGIN
        INSERT INTO sermon_categories (name, description) VALUES ('Test Category', 'Test Description');
        DELETE FROM sermon_categories WHERE name = 'Test Category';
        RETURN QUERY SELECT 'sermon_categories'::text, 'INSERT/DELETE'::text, 'SUCCESS'::text, 'Operations completed'::text;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'sermon_categories'::text, 'INSERT/DELETE'::text, 'ERROR'::text, SQLERRM::text;
    END;
    
    -- Test events
    BEGIN
        INSERT INTO events (title, description, event_date) VALUES ('Test Event', 'Test Description', NOW());
        DELETE FROM events WHERE title = 'Test Event';
        RETURN QUERY SELECT 'events'::text, 'INSERT/DELETE'::text, 'SUCCESS'::text, 'Operations completed'::text;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'events'::text, 'INSERT/DELETE'::text, 'ERROR'::text, SQLERRM::text;
    END;
    
    -- Test blog_categories
    BEGIN
        INSERT INTO blog_categories (name, description) VALUES ('Test Blog Category', 'Test Description');
        DELETE FROM blog_categories WHERE name = 'Test Blog Category';
        RETURN QUERY SELECT 'blog_categories'::text, 'INSERT/DELETE'::text, 'SUCCESS'::text, 'Operations completed'::text;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN QUERY SELECT 'blog_categories'::text, 'INSERT/DELETE'::text, 'ERROR'::text, SQLERRM::text;
    END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.test_rls_permissions() TO anon, authenticated;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

/*
INSTRUCCIONES PARA ESTA VERSIÓN:

1. Este script deshabilita temporalmente RLS para permitir testing
2. Crea políticas permisivas que permiten todas las operaciones
3. Otorga permisos explícitos al rol 'anon' para todas las operaciones
4. Incluye una función de testing para verificar permisos

PARA EJECUTAR:
1. Ejecuta este script completo en Supabase Dashboard > SQL Editor
2. Ejecuta: SELECT * FROM public.test_rls_permissions();
3. Ejecuta el script test-all-tables.js

NOTA IMPORTANTE:
- Esta es una solución temporal para testing
- En producción, deberías implementar políticas más restrictivas
- Las políticas actuales permiten todas las operaciones a todos los usuarios

PRÓXIMOS PASOS:
- Una vez que confirmes que funciona, podemos implementar políticas más seguras
- Podemos crear un middleware en la aplicación para validar sesiones
- Podemos usar el service_role key para operaciones administrativas
*/