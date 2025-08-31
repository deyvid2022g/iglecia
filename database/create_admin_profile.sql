-- =====================================================
-- SCRIPT PARA CREAR PERFIL DE ADMINISTRADOR
-- Email: lugarderefugio005@gmail.com
-- =====================================================

-- IMPORTANTE: Este script debe ejecutarse DESPUÉS de que el usuario
-- se haya registrado en la aplicación a través de Supabase Auth

-- Paso 1: Verificar si el usuario existe en auth.users
-- (Este paso es solo para verificación, no se ejecuta automáticamente)
-- SELECT id, email FROM auth.users WHERE email = 'lugarderefugio005@gmail.com';

-- Paso 2: Crear o actualizar el perfil de administrador
-- Nota: Reemplaza 'USER_UUID_AQUI' con el UUID real del usuario de auth.users

INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    is_active,
    bio,
    created_at,
    updated_at
) VALUES (
    -- IMPORTANTE: Reemplaza este UUID con el ID real del usuario de auth.users
    -- Puedes obtenerlo ejecutando: SELECT id FROM auth.users WHERE email = 'lugarderefugio005@gmail.com';
    'USER_UUID_AQUI'::UUID,
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
    updated_at = NOW();

-- Paso 3: Verificar que el perfil se creó correctamente
-- SELECT * FROM public.profiles WHERE email = 'lugarderefugio005@gmail.com';

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. El usuario debe registrarse primero en la aplicación
-- 2. Obtener el UUID del usuario de auth.users
-- 3. Reemplazar 'USER_UUID_AQUI' con el UUID real
-- 4. Ejecutar este script en el SQL Editor de Supabase
-- =====================================================

-- Script alternativo si ya conoces el email pero no el UUID:
-- UPDATE public.profiles 
-- SET role = 'admin', is_active = true, updated_at = NOW()
-- WHERE email = 'lugarderefugio005@gmail.com';

-- Si el perfil no existe, este script lo creará usando el UUID de auth.users:
/*
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Obtener el UUID del usuario
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'lugarderefugio005@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Insertar o actualizar el perfil
        INSERT INTO public.profiles (
            id, name, email, role, is_active, bio, created_at, updated_at
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
            updated_at = NOW();
            
        RAISE NOTICE 'Perfil de administrador creado/actualizado para: %', 'lugarderefugio005@gmail.com';
    ELSE
        RAISE NOTICE 'Usuario no encontrado. Debe registrarse primero en la aplicación.';
    END IF;
END $$;
*/