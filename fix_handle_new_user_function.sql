-- Corrección de la función handle_new_user para resolver el error 500
-- Este script actualiza la función con manejo de errores robusto

-- PASO 1: Eliminar el trigger existente temporalmente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- PASO 2: Actualizar la función handle_new_user con manejo de errores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS '
BEGIN
    -- Verificar si el usuario ya existe en public.users
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        -- Si ya existe, actualizar la información
        UPDATE public.users SET
            email = NEW.email,
            name = COALESCE(NEW.raw_user_meta_data->>''name'', NEW.email),
            role = COALESCE(NEW.raw_user_meta_data->>''role'', ''member''),
            updated_at = NOW()
        WHERE id = NEW.id;
        
        RAISE NOTICE ''Usuario actualizado en public.users: %'', NEW.id;
    ELSE
        -- Si no existe, insertarlo
        INSERT INTO public.users (id, email, name, role, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>''name'', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>''role'', ''member''),
            NEW.created_at,
            NOW()
        );
        
        RAISE NOTICE ''Usuario insertado en public.users: %'', NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log detallado del error
        RAISE WARNING ''Error en handle_new_user para usuario %: % - %'', NEW.id, SQLSTATE, SQLERRM;
        -- No fallar el proceso de autenticación
        RETURN NEW;
END;
';

-- PASO 3: Recrear el trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- PASO 4: Verificar que la función se creó correctamente
SELECT 
    'FUNCIÓN ACTUALIZADA:' as status,
    routine_name, 
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
    AND routine_schema = 'public';

-- PASO 5: Verificar que el trigger se recreó correctamente
SELECT 
    'TRIGGER RECREADO:' as status,
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';