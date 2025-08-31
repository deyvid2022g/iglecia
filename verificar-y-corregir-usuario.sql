-- =====================================================
-- VERIFICAR Y CORREGIR USUARIO CAMPLAYGO005@GMAIL.COM
-- Solución para "Credenciales incorrectas"
-- =====================================================

-- PASO 1: Verificar si el usuario existe en la tabla profiles
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at
FROM public.profiles 
WHERE email = 'camplaygo005@gmail.com';

-- PASO 2: Si el usuario NO existe en profiles, crearlo
-- (Solo ejecutar si el SELECT anterior no devuelve resultados)
INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    auth.uid(),
    'camplaygo005@gmail.com',
    'Administrador Principal',
    'admin',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE email = 'camplaygo005@gmail.com'
);

-- PASO 3: Actualizar el usuario a admin (por si ya existía)
UPDATE public.profiles 
SET 
    role = 'admin',
    name = 'Administrador Principal',
    is_active = true,
    updated_at = NOW()
WHERE email = 'camplaygo005@gmail.com';

-- PASO 4: Verificar el resultado final
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'camplaygo005@gmail.com';

-- =====================================================
-- INSTRUCCIONES PARA RESOLVER "CREDENCIALES INCORRECTAS"
-- =====================================================

/*
🚨 PROBLEMA: "Credenciales incorrectas. Verifica tu email y contraseña."

📋 SOLUCIÓN PASO A PASO:

1. EJECUTAR ESTE SCRIPT PRIMERO:
   - Ve al Dashboard de Supabase: https://supabase.com/dashboard
   - Selecciona tu proyecto
   - Ve a SQL Editor
   - Ejecuta este script completo

2. VERIFICAR/CREAR USUARIO EN AUTHENTICATION:
   - Ve a Authentication > Users
   - Busca: camplaygo005@gmail.com
   - Si NO existe, créalo:
     * Click "Add user"
     * Email: camplaygo005@gmail.com
     * Password: Y3103031931c
     * Email Confirm: ✅ (marcado)
     * Click "Create user"
   
   - Si SÍ existe pero no puedes hacer login:
     * Click en el usuario
     * Ve a la pestaña "Raw user meta data"
     * Verifica que email_confirmed_at tenga una fecha
     * Si no, marca "Email Confirm" y guarda

3. RESETEAR CONTRASEÑA (SI ES NECESARIO):
   - En Authentication > Users
   - Click en camplaygo005@gmail.com
   - Click "Reset password"
   - Establece nueva contraseña: Y3103031931c
   - Marca "Email Confirm" si no está marcado

4. PROBAR LOGIN:
   - Ve a: http://localhost:5173/
   - Email: camplaygo005@gmail.com
   - Password: Y3103031931c

🎯 CAUSAS COMUNES DEL ERROR:
- Usuario no confirmado en Authentication
- Contraseña incorrecta o no establecida
- Usuario existe en profiles pero no en auth.users
- Políticas RLS bloqueando el acceso

✅ DESPUÉS DE SEGUIR ESTOS PASOS:
El usuario debería poder hacer login correctamente.
*/

-- =====================================================
-- VERIFICACIONES ADICIONALES
-- =====================================================

-- Verificar políticas RLS activas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verificar que RLS esté habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';