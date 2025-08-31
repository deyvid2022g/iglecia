-- =====================================================
-- ACTUALIZAR USUARIO A ADMINISTRADOR
-- Email: camplaygo005@gmail.com
-- =====================================================

-- PASO 1: Actualizar el rol del usuario existente a administrador
UPDATE public.profiles 
SET 
    role = 'admin',
    name = 'Administrador Principal',
    updated_at = NOW()
WHERE email = 'camplaygo005@gmail.com';

-- PASO 2: Verificar que la actualización fue exitosa
SELECT 
    id,
    email,
    name,
    role,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'camplaygo005@gmail.com';

-- =====================================================
-- INSTRUCCIONES:
-- =====================================================

/*
✅ USUARIO YA EXISTE EN LA BASE DE DATOS

📋 PASOS PARA COMPLETAR LA CONFIGURACIÓN:

1. Ve al Dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a SQL Editor
4. Ejecuta este script completo
5. Verifica que el resultado muestre role = 'admin'
6. Ve a Authentication > Users
7. Busca el usuario: camplaygo005@gmail.com
8. Si no existe en Authentication, créalo:
   - Email: camplaygo005@gmail.com
   - Password: Y3103031931c
   - Email Confirm: ✅ (marcado)
9. Prueba el login en: http://localhost:5173/

🎯 RESULTADO ESPERADO:
Después de ejecutar este script, el usuario camplaygo005@gmail.com
tendrá rol de 'admin' y podrá acceder a todas las funciones administrativas.
*/

-- =====================================================
-- VERIFICACIONES ADICIONALES
-- =====================================================

-- Verificar que las políticas RLS permiten la operación
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Verificar que RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';