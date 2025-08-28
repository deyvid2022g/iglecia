# Instrucciones para Crear Usuario Administrador

## Pasos para configurar el usuario administrador:

### 1. Ejecutar el SQL en Supabase

Primero, ejecuta el archivo `setup_supabase_complete.sql` en el SQL Editor de Supabase:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Copia y pega el contenido de `setup_supabase_complete.sql`
5. Haz clic en "Run"

### 2. Crear el usuario administrador

Ejecuta este SQL adicional en el SQL Editor:

```sql
-- Crear usuario administrador en auth.users
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
  '{"name": "Administrador Principal"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Obtener el ID del usuario recién creado
SELECT id, email FROM auth.users WHERE email = 'admin@lugarderefugio.com';

-- Crear el perfil en public.users (reemplaza 'USER_ID_AQUI' con el ID obtenido arriba)
INSERT INTO public.users (id, name, email, role, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@lugarderefugio.com'),
  'Administrador Principal',
  'admin@lugarderefugio.com',
  'admin',
  NOW(),
  NOW()
);
```

### 3. Credenciales del administrador

- **Email:** admin@lugarderefugio.com
- **Contraseña:** Admin123!

### 4. Verificar la configuración

Ejecuta esta consulta para verificar:

```sql
-- Verificar que el usuario existe en ambas tablas
SELECT 
  au.email,
  au.email_confirmed_at,
  pu.name,
  pu.role
FROM auth.users au
JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'admin@lugarderefugio.com';
```

### 5. Probar el login

1. Ejecuta `npm run dev`
2. Ve a la página de login
3. Usa las credenciales:
   - Email: admin@lugarderefugio.com
   - Contraseña: Admin123!

## Alternativa: Registro normal

Si prefieres, puedes:

1. Registrarte normalmente en la aplicación con cualquier email
2. Luego cambiar el rol a 'admin' en la tabla `public.users` usando el SQL Editor:

```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'tu_email@ejemplo.com';
```

## Solución de problemas

- Si el login falla, verifica que `email_confirmed_at` no sea NULL
- Si no tienes permisos de admin, verifica que el campo `role` sea 'admin'
- Si hay errores de conexión, verifica las variables de entorno en `.env`