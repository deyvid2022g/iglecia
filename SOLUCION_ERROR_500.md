# Solución a Errores 500 de Supabase

## Problema Identificado

Los errores que estás viendo:
```
Failed to load resource: the server responded with a status of 500 ()
xrbmmhqekgtgcfxxnrbb.supabase.co/rest/v1/users?select=*&id=eq.7a4120de-7127-45a2-a49d-03e577bb1317
```

Indican que **la tabla `public.users` no existe** en tu base de datos de Supabase o las políticas de seguridad están mal configuradas.

## Causa Principal

El archivo `setup_supabase_complete.sql` **NO se ha ejecutado** en tu proyecto de Supabase. Este archivo contiene:
- La creación de la tabla `public.users`
- Las políticas de seguridad (RLS)
- La función `handle_new_user`
- El trigger para crear perfiles automáticamente

## Solución Paso a Paso

### 1. Ejecutar el SQL de Configuración

1. **Abre el panel de Supabase**: https://app.supabase.com
2. **Selecciona tu proyecto** (xrbmmhqekgtgcfxxnrbb)
3. **Ve a SQL Editor** (icono de base de datos en el menú lateral)
4. **Copia todo el contenido** del archivo `setup_supabase_complete.sql`
5. **Pégalo en el editor SQL** y haz clic en "Run"

### 2. Verificar la Creación de la Tabla

Después de ejecutar el SQL, verifica que la tabla se creó:

```sql
SELECT * FROM public.users LIMIT 5;
```

### 3. Verificar las Políticas RLS

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
```

### 4. Verificar la Función y Trigger

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'users';
```

## Configuración Adicional Requerida

### Deshabilitar Confirmación de Email (Recomendado para desarrollo)

1. Ve a **Authentication** > **Settings**
2. En **User Signups**, deshabilita **"Enable email confirmations"**
3. Guarda los cambios

### Configurar URL de Redirección

1. En **Authentication** > **URL Configuration**
2. Agrega `http://localhost:5174/**` a las **Redirect URLs**

## Verificación Final

Después de ejecutar el SQL:

1. **Recarga la aplicación** (F5)
2. **Intenta registrar un nuevo usuario**
3. **Verifica que el perfil se cree automáticamente**:
   ```sql
   SELECT * FROM public.users;
   ```
4. **Intenta hacer login** con las credenciales

## Estado Esperado Después de la Corrección

- ✅ Tabla `public.users` creada
- ✅ Políticas RLS configuradas
- ✅ Función `handle_new_user` activa
- ✅ Trigger `on_auth_user_created` funcionando
- ✅ Registro y login operativos

## Archivos Importantes

- `setup_supabase_complete.sql` - **DEBE ejecutarse en Supabase**
- `SOLUCION_LOGIN_PROBLEMA.md` - Configuración adicional
- `SOLUCION_ERRORES_AUTH.md` - Problemas previos resueltos

**IMPORTANTE**: Sin ejecutar el archivo SQL en Supabase, la aplicación no funcionará correctamente.