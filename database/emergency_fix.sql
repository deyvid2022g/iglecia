-- =====================================================
-- SOLUCIÓN DE EMERGENCIA PARA ERROR DE LOGIN
-- =====================================================
-- Este script deshabilita temporalmente RLS para permitir login
-- USAR SOLO COMO ÚLTIMO RECURSO

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Crear perfil para camplaygo005@gmail.com si no existe
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    is_active,
    join_date,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    u.email,
    'Administrador',
    'admin',
    '+573001234567',
    true,
    NOW(),
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'camplaygo005@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = u.id
);

-- 3. Actualizar perfil existente si ya existe
UPDATE public.profiles 
SET 
    full_name = 'Administrador',
    role = 'admin',
    is_active = true,
    updated_at = NOW()
WHERE email = 'camplaygo005@gmail.com';

-- 4. Verificar resultado
SELECT 
    'Usuario verificado' as status,
    id,
    email,
    full_name,
    role,
    is_active
FROM public.profiles 
WHERE email = 'camplaygo005@gmail.com';

-- 5. Re-habilitar RLS después de verificar que funciona
-- DESCOMENTA ESTA LÍNEA DESPUÉS DE PROBAR EL LOGIN:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- NOTA IMPORTANTE:
-- Este script deshabilita RLS temporalmente
-- Recuerda re-habilitarlo después de que el login funcione
-- ejecutando: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;