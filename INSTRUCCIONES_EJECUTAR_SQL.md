# 🚨 INSTRUCCIONES URGENTES - Ejecutar SQL en Supabase

## ⚠️ PROBLEMA ACTUAL

Los errores 500 que estás viendo se deben a que **la tabla `users` NO EXISTE** en tu base de datos de Supabase.

## 📋 PASOS OBLIGATORIOS (Ejecutar AHORA)

### 1. Abrir Supabase Dashboard

1. Ve a: https://app.supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: **xrbmmhqekgtgcfxxnrbb**

### 2. Ir al SQL Editor

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"** (icono de base de datos)
2. Haz clic en **"New query"** o usa el editor principal

### 3. Ejecutar el Script SQL

1. **Abre el archivo** `setup_supabase_complete.sql` en tu editor de código
2. **Selecciona TODO el contenido** (Ctrl+A)
3. **Copia todo** (Ctrl+C)
4. **Pega en el SQL Editor** de Supabase (Ctrl+V)
5. **Haz clic en "RUN"** (botón verde en la esquina inferior derecha)

### 4. Verificar Ejecución Exitosa

Después de ejecutar, deberías ver:
- ✅ "Success. No rows returned" o similar
- ✅ Mensaje de confirmación verde

### 5. Verificar que la Tabla se Creó

Ejecuta esta consulta en el SQL Editor:

```sql
SELECT * FROM public.users;
```

Deberías ver:
- Una tabla vacía (sin errores)
- Columnas: id, name, email, phone, role, avatar_url, created_at, updated_at

## 🔧 CONFIGURACIÓN ADICIONAL RECOMENDADA

### Deshabilitar Confirmación de Email (Para desarrollo)

1. Ve a **Authentication** > **Settings**
2. Busca **"Enable email confirmations"**
3. **Desactívalo** (toggle OFF)
4. Haz clic en **"Save"**

### Configurar URLs de Redirección

1. Ve a **Authentication** > **URL Configuration**
2. En **"Redirect URLs"**, agrega:
   ```
   http://localhost:5174/**
   ```
3. Haz clic en **"Save"**

## 🧪 PROBAR LA APLICACIÓN

Después de ejecutar el SQL:

1. **Recarga tu aplicación** (F5 en el navegador)
2. **Intenta registrar un nuevo usuario**
3. **Verifica que NO aparezcan errores 500**
4. **Intenta hacer login**

## ❌ Si Sigues Viendo Errores

### Verificar en Supabase Dashboard:

1. Ve a **Table Editor**
2. Busca la tabla **"users"** en el esquema **"public"**
3. Si NO aparece, el SQL no se ejecutó correctamente

### Verificar Políticas RLS:

```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';
```

Deberías ver 5 políticas listadas.

## 📞 ESTADO ESPERADO DESPUÉS

- ✅ Tabla `public.users` existe
- ✅ Políticas RLS configuradas
- ✅ Función `handle_new_user` creada
- ✅ Trigger `on_auth_user_created` activo
- ✅ NO más errores 500
- ✅ Registro y login funcionando

## 🚨 IMPORTANTE

**SIN EJECUTAR EL SQL, LA APLICACIÓN NO FUNCIONARÁ.**

Este es el paso más crítico que falta para resolver todos los problemas de autenticación.

---

**Ejecuta el SQL AHORA y luego prueba la aplicación.**