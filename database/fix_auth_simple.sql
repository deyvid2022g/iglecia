-- =====================================================
-- SOLUCIÓN SIMPLE PARA ERROR 500 EN AUTENTICACIÓN
-- =====================================================

-- Recrear función handle_new_user con bypass temporal de RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  rls_enabled boolean;
BEGIN
  -- Guardar estado actual de RLS
  SELECT row_security INTO rls_enabled FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public';
  
  -- Deshabilitar RLS temporalmente para esta operación
  PERFORM set_config('row_security', 'off', true);
  
  -- Insertar el perfil del usuario
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  
  -- Restaurar RLS si estaba habilitado
  IF rls_enabled THEN
    PERFORM set_config('row_security', 'on', true);
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si el perfil ya existe, restaurar RLS y continuar
    IF rls_enabled THEN
      PERFORM set_config('row_security', 'on', true);
    END IF;
    RETURN NEW;
  WHEN OTHERS THEN
    -- En caso de error, restaurar RLS y continuar
    IF rls_enabled THEN
      PERFORM set_config('row_security', 'on', true);
    END IF;
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que el trigger esté configurado correctamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentario
-- Esta solución deshabilita temporalmente RLS durante la creación automática del perfil
-- para evitar conflictos con las políticas de seguridad