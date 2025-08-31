# 🚨 SOLUCIÓN DE EMERGENCIA - PROBLEMA RLS CRÍTICO

## ⚠️ SITUACIÓN ACTUAL
Tu aplicación está **COMPLETAMENTE BLOQUEADA** por políticas RLS:
- ❌ No se puede hacer login
- ❌ No se puede verificar email
- ❌ No se pueden crear nuevas cuentas
- ❌ Error: `Database error granting user`

## 🚀 SOLUCIÓN INMEDIATA (5 MINUTOS)

### PASO 1: Abrir Supabase Dashboard
1. Ve a: **https://supabase.com/dashboard**
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto de la iglesia

### PASO 2: Ir al SQL Editor
1. En el menú lateral, busca **"SQL Editor"**
2. Haz clic en **"New query"** o **"Nueva consulta"**

### PASO 3: Copiar y Ejecutar el SQL
Copia EXACTAMENTE este código y pégalo en el editor:

-- SOLUCIÓN DE EMERGENCIA RLS
-- Eliminar todas las políticas existentes
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

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Crear política temporal MUY PERMISIVA (SOLO PARA SOLUCIONAR EL PROBLEMA)
CREATE POLICY "temp_admin_bypass" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);

-- Verificar que la política se creó
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

### PASO 4: Ejecutar el Script
1. Haz clic en **"Run"** o **"Ejecutar"**
2. Deberías ver mensajes de confirmación
3. La última consulta debe mostrar la política `temp_admin_bypass`

### PASO 5: Probar la Solución
En tu terminal, ejecuta:
npx tsx test-login-simple.ts

## ✅ RESULTADO ESPERADO
Después de ejecutar el SQL:
- ✅ Login funcionará
- ✅ Verificación de email funcionará
- ✅ Creación de cuentas funcionará
- ✅ La aplicación estará operativa

## ⚠️ IMPORTANTE - SEGURIDAD
Esta solución crea una política **MUY PERMISIVA** que permite acceso total.

**DESPUÉS** de confirmar que todo funciona, debes:
1. Reemplazar `temp_admin_bypass` con políticas más seguras
2. Configurar permisos apropiados por rol de usuario

## 🆘 SI ALGO SALE MAL
1. Verifica que copiaste el SQL completo
2. Asegúrate de estar en el proyecto correcto
3. Revisa que no hay errores de sintaxis
4. Contacta si necesitas ayuda adicional

---
**⏰ Tiempo estimado: 5 minutos**
**🎯 Prioridad: CRÍTICA**