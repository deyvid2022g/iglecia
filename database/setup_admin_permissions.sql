-- =====================================================
-- CONFIGURACIÓN COMPLETA DE PERMISOS PARA ADMINISTRADOR
-- Email: lugarderefugio005@gmail.com
-- =====================================================

-- PASO 1: Crear perfil de administrador automáticamente
-- Este script busca el usuario por email y crea/actualiza su perfil

DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Obtener el UUID del usuario desde auth.users
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'lugarderefugio005@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Insertar o actualizar el perfil de administrador
        INSERT INTO public.profiles (
            id,
            full_name,
            email,
            role,
            is_active,
            bio,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
            'Administrador Lugar de Refugio',
            'lugarderefugio005@gmail.com',
            'admin',
            true,
            'Administrador principal de la iglesia Lugar de Refugio',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            is_active = true,
            full_name = 'Administrador Lugar de Refugio',
            bio = 'Administrador principal de la iglesia Lugar de Refugio',
            updated_at = NOW();
            
        RAISE NOTICE 'Perfil de administrador creado/actualizado para: %', 'lugarderefugio005@gmail.com';
    ELSE
        RAISE NOTICE 'Usuario no encontrado. El usuario debe registrarse primero en la aplicación.';
    END IF;
END $$;

-- PASO 2: Verificar y actualizar políticas RLS para sermones
-- Asegurar que los administradores puedan crear, editar y eliminar sermones

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Solo editores pueden crear sermones" ON public.sermons;
DROP POLICY IF EXISTS "Solo editores pueden actualizar sermones" ON public.sermons;
DROP POLICY IF EXISTS "Solo editores pueden eliminar sermones" ON public.sermons;

-- Crear políticas actualizadas para sermones
CREATE POLICY "Solo editores pueden crear sermones" ON public.sermons
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
            AND is_active = true
        )
    );

CREATE POLICY "Solo editores pueden actualizar sermones" ON public.sermons
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
            AND is_active = true
        )
    );

CREATE POLICY "Solo editores pueden eliminar sermones" ON public.sermons
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor')
            AND is_active = true
        )
    );

-- PASO 3: Verificar políticas para eventos y blog posts
-- Actualizar políticas existentes para incluir verificación de is_active

-- Políticas para eventos
DROP POLICY IF EXISTS "Solo editores pueden crear eventos" ON public.events;
DROP POLICY IF EXISTS "Solo editores pueden actualizar eventos" ON public.events;

CREATE POLICY "Solo editores pueden crear eventos" ON public.events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
            AND is_active = true
        )
    );

CREATE POLICY "Solo editores pueden actualizar eventos" ON public.events
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
            AND is_active = true
        )
    );

-- Políticas para blog posts
DROP POLICY IF EXISTS "Solo editores pueden crear posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Solo editores pueden actualizar posts" ON public.blog_posts;

CREATE POLICY "Solo editores pueden crear posts" ON public.blog_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
            AND is_active = true
        )
    );

CREATE POLICY "Solo editores pueden actualizar posts" ON public.blog_posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'pastor', 'editor')
            AND is_active = true
        )
    );

-- PASO 4: Crear función de verificación de permisos mejorada
CREATE OR REPLACE FUNCTION check_user_permissions(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = required_role
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 5: Verificar la configuración
-- Consulta para verificar que todo está configurado correctamente
SELECT 
    'Verificación de configuración' as status,
    (
        SELECT COUNT(*) 
        FROM public.profiles 
        WHERE email = 'lugarderefugio005@gmail.com' 
        AND role = 'admin' 
        AND is_active = true
    ) as admin_profile_created,
    (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE tablename = 'sermons' 
        AND policyname LIKE '%crear%'
    ) as sermon_policies_count;

-- PASO 6: Script de prueba (comentado)
/*
-- Para probar que el usuario puede crear sermones:
SET session_replication_role = replica; -- Solo para pruebas
SET LOCAL role postgres; -- Solo para pruebas

INSERT INTO public.sermons (
    slug, title, description, speaker, sermon_date, duration,
    video_url, is_published, created_by
) VALUES (
    'test-sermon-admin',
    'Sermón de Prueba Admin',
    'Prueba de permisos de administrador',
    'Pastor Prueba',
    CURRENT_DATE,
    '30:00',
    'https://youtube.com/watch?v=test',
    true,
    (SELECT id FROM auth.users WHERE email = 'lugarderefugio005@gmail.com')
);

-- Eliminar el sermón de prueba
DELETE FROM public.sermons WHERE slug = 'test-sermon-admin';
*/

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. El usuario debe haberse registrado en la aplicación
-- 2. Ejecutar este script completo en el SQL Editor de Supabase
-- 3. Verificar que el perfil se creó correctamente
-- 4. Probar la creación de sermones desde la aplicación
-- =====================================================