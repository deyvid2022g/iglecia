-- Script para arreglar el problema del trigger y sincronizar usuarios
-- Este script debe ejecutarse directamente en Supabase SQL Editor

-- 1. Verificar usuarios en auth.users que no están en public.users
SELECT 
    'Usuarios en auth.users sin registro en public.users:' as info;

SELECT 
    au.id,
    au.email,
    au.created_at as auth_created_at,
    pu.id as public_user_id
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Insertar usuarios faltantes en public.users
INSERT INTO public.users (id, email, name, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email) as name,
    COALESCE(au.raw_user_meta_data->>'role', 'member') as role,
    au.created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();

-- 3. Verificar que el trigger existe y está habilitado
SELECT 
    'Estado del trigger:' as info;

SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 4. Verificar que la función existe
SELECT 
    'Estado de la función:' as info;

SELECT 
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 5. Recrear la función handle_new_user con mejor manejo de errores
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

-- 6. Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verificar la configuración final
SELECT 
    'Verificación final:' as info;

SELECT 
    COUNT(*) as total_auth_users
FROM auth.users;

SELECT 
    COUNT(*) as total_public_users
FROM public.users;

SELECT 
    'Usuarios sincronizados correctamente' as resultado
WHERE (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.users);

-- 8. Mostrar usuarios para verificación
SELECT 
    'Usuarios en public.users:' as info;

SELECT 
    id,
    email,
    name,
    role,
    created_at
FROM public.users
ORDER BY created_at DESC;