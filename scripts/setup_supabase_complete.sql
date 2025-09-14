-- Script completo para configurar Supabase con autenticación
-- Este script resuelve los errores: "Database error granting user" y "table 'public.users' does not exist"

-- 1. Crear la tabla users si no existe
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para la tabla users
-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Política para que los usuarios puedan insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'member')
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log el error pero no fallar el registro
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Crear trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Insertar usuario admin por defecto (opcional)
-- Descomenta las siguientes líneas si necesitas un usuario admin por defecto
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'admin@iglesia.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- ) ON CONFLICT (email) DO NOTHING;

-- 9. Verificar que todo esté configurado correctamente
DO $$
BEGIN
    -- Verificar que la tabla existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Error: La tabla users no fue creada correctamente';
    END IF;
    
    -- Verificar que RLS está habilitado
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public' AND rowsecurity = true) THEN
        RAISE EXCEPTION 'Error: RLS no está habilitado en la tabla users';
    END IF;
    
    -- Verificar que las políticas existen
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') THEN
        RAISE EXCEPTION 'Error: No se encontraron políticas RLS para la tabla users';
    END IF;
    
    -- Verificar que la función existe
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        RAISE EXCEPTION 'Error: La función handle_new_user no fue creada';
    END IF;
    
    -- Verificar que el trigger existe
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        RAISE EXCEPTION 'Error: El trigger on_auth_user_created no fue creado';
    END IF;
    
    RAISE NOTICE 'Configuración de Supabase completada exitosamente';
END
$$;

-- 10. Mostrar información de configuración
SELECT 
    'Tabla users' as componente,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
         THEN 'Creada' 
         ELSE 'No existe' 
    END as estado;

SELECT 
    'RLS en users' as componente,
    CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND schemaname = 'public' AND rowsecurity = true) 
         THEN 'Habilitado' 
         ELSE 'Deshabilitado' 
    END as estado;

SELECT 
    'Políticas RLS' as componente,
    COUNT(*)::text || ' políticas' as estado
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

SELECT 
    'Función handle_new_user' as componente,
    CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') 
         THEN 'Creada' 
         ELSE 'No existe' 
    END as estado;

SELECT 
    'Trigger on_auth_user_created' as componente,
    CASE WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') 
         THEN 'Creado' 
         ELSE 'No existe' 
    END as estado;