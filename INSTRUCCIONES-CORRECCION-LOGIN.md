# 🔧 INSTRUCCIONES PARA CORREGIR EL LOGIN

## ❌ PROBLEMA IDENTIFICADO
El login no funciona debido a políticas RLS (Row Level Security) muy restrictivas en la tabla `profiles` que impiden la creación automática de perfiles cuando los usuarios se registran.

## ✅ SOLUCIÓN

### PASO 1: Ejecutar SQL en Supabase Dashboard

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor**
3. Copia y pega el siguiente SQL:

-- 1. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "temp_admin_bypass" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Perfiles públicos son visibles para todos" ON public.profiles;

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear política temporal MUY PERMISIVA (SOLO PARA SOLUCIONAR EL PROBLEMA)
CREATE POLICY "temp_admin_bypass" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Verificar que la política se creó
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

4. **Ejecuta el script** haciendo clic en "Run"

### PASO 2: Probar el Login

🔑 **CREDENCIALES DE PRUEBA:**
- **Email:** `lugarderefugio005@gmail.com`
- **Password:** `L3123406452r`

1. Ve a tu aplicación: http://localhost:5173/
2. Intenta hacer login con las credenciales de arriba
3. Si funciona, ¡perfecto! El problema está resuelto.

### PASO 3: Crear Usuario Administrador (Si es necesario)

Si las credenciales de arriba no funcionan, ejecuta este SQL adicional:

```sql
-- Crear perfil para el usuario administrador
INSERT INTO public.profiles (
    id, 
    full_name, 
    email, 
    role, 
    is_active, 
    join_date
) VALUES (
    '27c5bd6f-d54a-4a0d-8579-7fc121a7a2f5',
    'Administrador Iglesia',
    'lugarderefugio005@gmail.com',
    'admin',
    true,
    CURRENT_DATE
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
```

## ⚠️ IMPORTANTE - SEGURIDAD

La política `temp_admin_bypass` es **MUY PERMISIVA** y permite acceso total a la tabla profiles. 

**Después de confirmar que el login funciona**, deberías reemplazarla con políticas más seguras:

```sql
-- Eliminar la política temporal
DROP POLICY "temp_admin_bypass" ON public.profiles;

-- Crear políticas más seguras
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Only admins can delete profiles" ON public.profiles
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role = 'admin' AND is_active = true
        )
    );
```

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos:
1. ✅ El login debería funcionar correctamente
2. ✅ Los usuarios podrán registrarse sin errores
3. ✅ Los perfiles se crearán automáticamente
4. ✅ La aplicación funcionará normalmente

---

**¿Necesitas ayuda?** Si algo no funciona, revisa:
1. Que el SQL se ejecutó sin errores
2. Que las credenciales son correctas
3. Que el servidor de desarrollo está corriendo
4. Que las variables de entorno están configuradas correctamente