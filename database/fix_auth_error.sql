-- =====================================================
-- CORRECCIÓN PARA ERROR 500 EN AUTENTICACIÓN
-- =====================================================

-- Eliminar políticas conflictivas existentes
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow automatic profile creation" ON public.profiles;

-- Recrear función handle_new_user con manejo de errores mejorado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Intentar insertar el perfil del usuario
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si el perfil ya existe, no hacer nada
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log del error pero no fallar el registro
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear política RLS que permita la inserción automática
CREATE POLICY "Enable automatic profile creation" ON public.profiles
  FOR INSERT WITH CHECK (
    -- Permitir inserción si es el propio usuario O si es una función del sistema
    auth.uid() = id OR 
    current_setting('role') = 'service_role' OR
    current_user = 'postgres'
  );

-- Política para que usuarios puedan insertar su propio perfil manualmente
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Asegurar que el trigger esté configurado correctamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentario de finalización
-- Este script corrige el error 500 que ocurría durante el registro
-- al mejorar el manejo de errores en la función handle_new_user
-- y ajustar las políticas RLS para permitir la creación automática de perfiles