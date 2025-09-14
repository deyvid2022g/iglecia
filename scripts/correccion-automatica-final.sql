
-- Corrección automática del error 500 "Database error granting user"
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar usuarios desincronizados
SELECT 
    au.id as auth_id,
    au.email as auth_email,
    pu.id as public_id,
    pu.email as public_email
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Insertar usuarios faltantes en public.users
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- 3. Recrear función handle_new_user con mejor manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    BEGIN
        INSERT INTO public.users (id, email, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            NEW.created_at,
            NOW()
        );
        
        RETURN NEW;
    EXCEPTION
        WHEN unique_violation THEN
            -- Usuario ya existe, actualizar información
            UPDATE public.users 
            SET 
                email = NEW.email,
                updated_at = NOW()
            WHERE id = NEW.id;
            
            RETURN NEW;
        WHEN OTHERS THEN
            -- Log del error pero no fallar
            RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
            RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recrear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar configuración
SELECT 
    'Usuarios en auth.users' as tabla,
    COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
    'Usuarios en public.users' as tabla,
    COUNT(*) as total
FROM public.users
UNION ALL
SELECT 
    'Función handle_new_user' as elemento,
    CASE WHEN EXISTS(
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) THEN 1 ELSE 0 END as existe
UNION ALL
SELECT 
    'Trigger on_auth_user_created' as elemento,
    CASE WHEN EXISTS(
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN 1 ELSE 0 END as existe;
