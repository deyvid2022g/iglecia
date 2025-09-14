-- DIAGNÓSTICO Y CORRECCIÓN: Error 'Database error granting user'
-- Este error ocurre cuando falta una política INSERT para la tabla users
-- Ejecutar este SQL paso a paso en el editor SQL de Supabase Dashboard

-- PASO 1: Verificar políticas existentes en la tabla users
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    cmd as comando,
    roles,
    qual as condicion_where,
    with_check as condicion_insert
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd;

-- PASO 2: Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- PASO 3: Si no existe una política INSERT, crearla
-- (Solo ejecutar si el PASO 1 no muestra ninguna política con cmd = 'INSERT')
CREATE POLICY IF NOT EXISTS "Allow automatic user creation" ON public.users
FOR INSERT
WITH CHECK (true);

-- PASO 4: Verificar que el trigger existe para crear usuarios automáticamente
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
   OR trigger_name LIKE '%user%';

-- PASO 5: Verificar función del trigger
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%user%' 
   AND routine_schema = 'public';

/* PASO 6: Verificación final - listar todas las políticas después de la corrección */
SELECT 
    'POLÍTICAS FINALES:' as status,
    policyname, 
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public'
ORDER BY cmd;