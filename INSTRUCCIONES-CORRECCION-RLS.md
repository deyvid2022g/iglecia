# 🔧 INSTRUCCIONES PARA CORREGIR POLÍTICAS RLS

## ⚠️ PROBLEMA IDENTIFICADO

Las políticas RLS (Row Level Security) están bloqueando la creación de usuarios y perfiles. El error "Database error granting user" indica que las políticas son demasiado restrictivas.

## 📋 PASOS PARA SOLUCIONARLO

### 1. Acceder al Dashboard de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto de la iglesia
4. Ve a la sección **SQL Editor** en el menú lateral

### 2. Ejecutar Script de Corrección

Copia y pega el siguiente SQL en el editor y ejecuta:

```sql
-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA PERFILES
-- =====================================================

-- Eliminar políticas existentes que están causando problemas
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Perfiles públicos son visibles para todos" ON public.profiles;

-- Crear nuevas políticas más permisivas para resolver el problema

-- 1. Política de lectura: todos pueden ver perfiles públicos
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (true);

-- 2. Política de inserción: permitir inserción si el usuario está autenticado
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- 3. Política de actualización: usuarios pueden actualizar su propio perfil
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 4. Política de eliminación: solo administradores pueden eliminar perfiles
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
```

### 3. Verificar las Políticas

Ejecuta esta consulta para verificar que las políticas se aplicaron correctamente:

```sql
-- Verificar políticas activas
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

### 4. Crear Usuario Administrador Manualmente

Si las políticas siguen causando problemas, puedes crear el usuario administrador directamente:

#### Opción A: Desde Authentication

1. Ve a **Authentication > Users** en el Dashboard
2. Haz clic en **Add user**
3. Completa:
   - Email: `admin@iglesia.com`
   - Password: `AdminIglesia123!`
   - Email Confirm: ✅ (marcado)
4. Haz clic en **Create user**

#### Opción B: Desde SQL Editor

```sql
-- Insertar perfil directamente (después de crear el usuario en Auth)
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
    'UUID_DEL_USUARIO_CREADO', -- Reemplazar con el UUID real del usuario
    'admin@iglesia.com',
    'Administrador',
    'admin',
    NOW(),
    NOW()
);
```

### 5. Probar el Login

Después de aplicar las correcciones:

1. Ve a tu aplicación en `http://localhost:5173/`
2. Intenta hacer login con:
   - Email: `admin@iglesia.com`
   - Password: `AdminIglesia123!`

## 🔍 VERIFICACIÓN ADICIONAL

Si sigues teniendo problemas, verifica:

### 1. Estado de RLS

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';
```

### 2. Usuarios en Authentication

```sql
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### 3. Perfiles Existentes

```sql
SELECT 
    id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 5;
```

## 🚨 SOLUCIÓN DE EMERGENCIA

Si nada funciona, puedes deshabilitar temporalmente RLS:

```sql
-- ⚠️ SOLO USAR EN DESARROLLO - NUNCA EN PRODUCCIÓN
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

Recuerda volver a habilitarlo después de crear el usuario administrador:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

## 📞 SIGUIENTE PASO

Una vez que hayas ejecutado estas correcciones, intenta hacer login nuevamente en la aplicación y avísame si el problema persiste.