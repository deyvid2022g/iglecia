# Solución a Errores de Autenticación

## Errores Identificados

### 1. Error 429 - Rate Limiting
```
Failed to load resource: the server responded with a status of 429
For security purposes, you can only request this after 22 seconds.
```

**Causa:** Supabase tiene límites de velocidad para prevenir spam. Estás haciendo demasiadas solicitudes de registro/login muy rápido.

**Solución:** Espera al menos 22 segundos entre intentos de registro/login.

### 2. Error 401 - Violación de Políticas RLS
```
new row violates row-level security policy for table "users"
```

**Causa:** El código estaba intentando insertar manualmente en la tabla `users` después del registro, pero ya existe un trigger automático que hace esto.

**Solución:** ✅ **YA CORREGIDO** - Eliminé la inserción manual duplicada en `AuthContext.tsx`.

## Pasos para Solucionar Completamente

### 1. Ejecutar el SQL de Configuración

**IMPORTANTE:** Debes ejecutar el archivo `setup_supabase_complete.sql` en tu panel de Supabase:

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **SQL Editor**
3. Copia y pega todo el contenido del archivo `setup_supabase_complete.sql`
4. Ejecuta el script

### 2. Verificar la Configuración

Después de ejecutar el SQL, verifica que:

- ✅ La tabla `public.users` existe
- ✅ Las políticas RLS están activas
- ✅ La función `handle_new_user()` existe
- ✅ El trigger `on_auth_user_created` está activo

### 3. Crear Usuario Administrador (Opcional)

Para crear un usuario administrador inicial:

```sql
-- Ejecutar en SQL Editor de Supabase
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@lugarderefugio.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Administrador"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Luego actualizar el rol a admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@lugarderefugio.com';
```

### 4. Probar el Sistema

1. **Espera al menos 30 segundos** después del último intento fallido
2. Intenta registrar un nuevo usuario con email diferente
3. Verifica que el usuario se cree correctamente
4. Prueba el login con las credenciales

## Estado Actual

- ✅ **Código corregido:** Eliminada la inserción manual duplicada
- ⚠️ **Pendiente:** Ejecutar el SQL de configuración en Supabase
- ⚠️ **Pendiente:** Esperar el tiempo de rate limiting (22+ segundos)

## Próximos Pasos

1. Ejecuta el SQL completo en Supabase
2. Espera al menos 30 segundos
3. Prueba registrar un nuevo usuario
4. Si funciona, crea el usuario administrador

## Notas Importantes

- **Rate Limiting:** Supabase limita las solicitudes para prevenir abuso
- **Trigger Automático:** El sistema ahora crea automáticamente el perfil de usuario
- **RLS Policies:** Las políticas de seguridad están configuradas correctamente
- **Roles:** Los usuarios nuevos se crean con rol 'member' por defecto