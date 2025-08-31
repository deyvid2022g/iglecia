-- =====================================================
-- CREAR USUARIO ADMINISTRADOR: camplaygo005@gmail.com
-- =====================================================

-- PASO 1: Primero ejecutar las correcciones RLS
-- (Ejecutar el contenido de fix-rls-policies.sql antes de este script)

-- PASO 2: Crear el perfil del administrador
-- IMPORTANTE: Primero debes crear el usuario en Authentication > Users del Dashboard
-- y luego reemplazar 'UUID_DEL_USUARIO_AQUI' con el ID real

INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    created_at, 
    updated_at
) VALUES (
    'UUID_DEL_USUARIO_AQUI', -- ⚠️ REEMPLAZAR con el UUID real del Dashboard
    'camplaygo005@gmail.com',
    'Administrador Principal',
    'admin',
    NOW(),
    NOW()
);

-- PASO 3: Verificar que el perfil se creó correctamente
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles 
WHERE email = 'camplaygo005@gmail.com';

-- =====================================================
-- INSTRUCCIONES PASO A PASO:
-- =====================================================

/*
1. Ve al Dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a Authentication > Users
4. Haz clic en "Add user"
5. Completa:
   - Email: camplaygo005@gmail.com
   - Password: AdminIglesia123! (o la que prefieras)
   - Email Confirm: ✅ (marcado)
6. Haz clic en "Create user"
7. COPIA el UUID del usuario creado
8. Ve a SQL Editor
9. REEMPLAZA 'UUID_DEL_USUARIO_AQUI' con el UUID real
10. Ejecuta este script
11. Verifica que aparezca el perfil en la consulta final
12. Prueba el login en tu aplicación: http://localhost:5173/
*/

-- =====================================================
-- ALTERNATIVA: Si ya existe el usuario en Authentication
-- =====================================================

-- Si ya creaste el usuario en Authentication, puedes obtener su UUID así:
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'camplaygo005@gmail.com';

-- Luego usa ese ID en el INSERT de arriba