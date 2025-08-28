# Instrucciones para Configurar la Base de Datos Supabase

## Problema Detectado
La tabla `users` no existe en tu base de datos Supabase. Esto es necesario para poder crear usuarios administradores.

## Solución: Configuración Manual

### Paso 1: Crear la Tabla Users

1. **Ve al Panel de Supabase:**
   - Abre tu navegador y ve a: https://supabase.com/dashboard
   - Inicia sesión con tu cuenta

2. **Selecciona tu Proyecto:**
   - Busca y selecciona el proyecto de la iglesia

3. **Abre el Editor SQL:**
   - En el menú lateral izquierdo, haz clic en "SQL Editor"

4. **Ejecuta el SQL para crear la tabla users:**
   - Haz clic en "New query" o "Nueva consulta"
   - Copia y pega el siguiente código SQL:

```sql
-- Crear tabla de usuarios personalizada
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política para que los administradores puedan ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'pastor')
    )
  );

-- Política para que los administradores puedan actualizar cualquier usuario
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Función para crear automáticamente un registro en users cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

5. **Ejecutar la consulta:**
   - Haz clic en el botón "Run" o "Ejecutar"
   - Deberías ver un mensaje de éxito

### Paso 2: Crear el Usuario Administrador

Tienes dos opciones:

#### Opción A: Crear Usuario en Authentication (Recomendado)

1. **Ve a Authentication:**
   - En el menú lateral, haz clic en "Authentication"
   - Luego haz clic en "Users"

2. **Crear nuevo usuario:**
   - Haz clic en "Add user" o "Agregar usuario"
   - Email: `lugarderefugio005@gmail.com`
   - Password: Crea una contraseña segura
   - Confirma la contraseña
   - Haz clic en "Create user"

3. **Asignar rol de administrador:**
   - Ve a "Table Editor" en el menú lateral
   - Selecciona la tabla "users"
   - Busca el usuario con email `lugarderefugio005@gmail.com`
   - Haz clic en la fila para editarla
   - Cambia el campo "role" de "member" a "admin"
   - Guarda los cambios

#### Opción B: Insertar directamente en la tabla

1. **Ve al Editor SQL:**
   - SQL Editor en el menú lateral

2. **Ejecuta esta consulta:**
```sql
-- Insertar usuario administrador directamente
INSERT INTO public.users (id, name, email, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Administrador Principal',
  'lugarderefugio005@gmail.com',
  'admin',
  NOW(),
  NOW()
);
```

**Nota:** Con esta opción, el usuario podrá acceder al panel de administración, pero necesitará registrarse normalmente en la aplicación para poder iniciar sesión.

### Paso 3: Verificar la Configuración

1. **Verificar tabla users:**
   - Ve a "Table Editor"
   - Deberías ver la tabla "users" en la lista
   - Haz clic en ella para ver su contenido

2. **Verificar usuario administrador:**
   - En la tabla "users", busca el registro con email `lugarderefugio005@gmail.com`
   - Verifica que el campo "role" sea "admin"

### Paso 4: Probar en la Aplicación

1. **Ejecutar la aplicación:**
   ```bash
   npm run dev
   ```

2. **Iniciar sesión:**
   - Ve a la página de login
   - Usa el email: `lugarderefugio005@gmail.com`
   - Usa la contraseña que configuraste

3. **Verificar acceso de administrador:**
   - Deberías poder acceder al dashboard de administración
   - Deberías ver opciones para gestionar usuarios, eventos, etc.

## Solución de Problemas

### Si no puedes ver la tabla users:
- Asegúrate de haber ejecutado correctamente el SQL del Paso 1
- Verifica que no haya errores en la consola del SQL Editor

### Si el usuario no puede iniciar sesión:
- Verifica que el usuario existe en Authentication → Users
- Verifica que el email sea exactamente: `lugarderefugio005@gmail.com`
- Verifica que la contraseña sea correcta

### Si el usuario no tiene permisos de administrador:
- Ve a Table Editor → users
- Busca el usuario y verifica que el campo "role" sea "admin"
- Si no es así, edítalo y cámbialo a "admin"

## Comandos Útiles

Después de completar la configuración manual, puedes usar estos comandos:

```bash
# Verificar configuración de la base de datos
node scripts/setupDatabase.js

# Verificar usuario administrador
node scripts/createAdminUser.js --list
```

## Contacto

Si tienes problemas con estos pasos, revisa:
1. Que las variables de entorno estén configuradas correctamente
2. Que tengas permisos de administrador en el proyecto de Supabase
3. Que la conexión a internet sea estable