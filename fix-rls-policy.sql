-- Agregar política faltante para permitir inserción de perfiles
CREATE POLICY "Los usuarios pueden crear su propio perfil" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Verificar que la política se creó correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';