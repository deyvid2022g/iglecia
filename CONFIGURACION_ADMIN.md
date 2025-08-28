# 🚨 CONFIGURACIÓN REQUERIDA: Usuario Administrador

## Problema Detectado
La tabla `users` no existe en tu base de datos Supabase. Esta tabla es **OBLIGATORIA** para que funcione el sistema de usuarios y administradores.

## ✅ SOLUCIÓN PASO A PASO

### PASO 1: Crear la Tabla Users en Supabase

1. **Abre el Panel de Supabase:**
   - Ve a: https://supabase.com/dashboard
   - Inicia sesión con tu cuenta

2. **Selecciona tu Proyecto:**
   - Busca el proyecto de la iglesia
   - Haz clic para abrirlo

3. **Abre el Editor SQL:**
   - En el menú lateral izquierdo, busca y haz clic en **"SQL Editor"**

4. **Ejecuta este SQL:**
   - Haz clic en **"New query"** (Nueva consulta)
   - **COPIA Y PEGA EXACTAMENTE** el siguiente código:

```sql
-- ============================================
-- CREAR TABLA USERS Y CONFIGURACIÓN COMPLETA
-- ============================================

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

-- Insertar usuario administrador
INSERT INTO public.users (id, name, email, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Administrador Principal',
  'lugarderefugio005@gmail.com',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = NOW();
```

5. **Ejecutar el SQL:**
   - Haz clic en el botón **"Run"** o **"Ejecutar"**
   - Deberías ver mensajes de éxito sin errores

### PASO 2: Crear Usuario de Autenticación

Para que el administrador pueda **iniciar sesión**, necesitas crear el usuario en el sistema de autenticación:

1. **Ve a Authentication:**
   - En el menú lateral, haz clic en **"Authentication"**
   - Luego haz clic en **"Users"**

2. **Crear nuevo usuario:**
   - Haz clic en **"Add user"** (Agregar usuario)
   - **Email:** `lugarderefugio005@gmail.com`
   - **Password:** Crea una contraseña segura (mínimo 8 caracteres)
   - **Confirm Password:** Repite la contraseña
   - Haz clic en **"Create user"**

### PASO 3: Verificar la Configuración

1. **Verificar tabla users:**
   - Ve a **"Table Editor"** en el menú lateral
   - Deberías ver la tabla **"users"** en la lista
   - Haz clic en ella
   - Deberías ver un registro con email `lugarderefugio005@gmail.com` y role `admin`

2. **Verificar usuario de autenticación:**
   - Ve a **"Authentication"** → **"Users"**
   - Deberías ver el usuario `lugarderefugio005@gmail.com`

### PASO 4: Probar el Acceso

1. **Ejecutar la aplicación:**
   ```bash
   npm run dev
   ```

2. **Iniciar sesión:**
   - Ve a la página de login de tu aplicación
   - Email: `lugarderefugio005@gmail.com`
   - Contraseña: La que configuraste en el Paso 2

3. **Verificar acceso de administrador:**
   - Deberías poder acceder al dashboard
   - Deberías ver opciones de administración

## 🔧 Comandos de Verificación

Después de completar los pasos anteriores, puedes ejecutar estos comandos para verificar:

```bash
# Verificar que todo esté configurado
node scripts/setupDatabase.js

# Listar usuarios administradores
node scripts/insertAdminUser.js --list
```

## ❌ Solución de Problemas

### Si el SQL falla:
- Asegúrate de copiar TODO el código SQL
- Verifica que no haya caracteres extraños
- Ejecuta cada sección por separado si es necesario

### Si no puedes iniciar sesión:
- Verifica que el usuario existe en Authentication → Users
- Verifica que la contraseña sea correcta
- Verifica que el email sea exactamente: `lugarderefugio005@gmail.com`

### Si no tienes permisos de administrador:
- Ve a Table Editor → users
- Busca tu usuario
- Verifica que el campo "role" sea "admin"

## 📞 Siguiente Paso

Una vez completada esta configuración, ejecuta:

```bash
node scripts/insertAdminUser.js --list
```

Esto debería mostrar tu usuario administrador correctamente configurado.

---

**⚠️ IMPORTANTE:** Esta configuración es **OBLIGATORIA** para que funcione el sistema de administración de la aplicación. Sin la tabla `users` y el usuario administrador, no podrás acceder al panel de control.