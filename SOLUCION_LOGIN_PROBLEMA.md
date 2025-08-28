# Solución al Problema de Login

## Problema Identificado

El usuario puede registrarse exitosamente, pero no puede iniciar sesión. Los logs muestran:
- Error 400 (Bad Request) en la petición POST a Supabase
- Mensaje: "Invalid login credentials"

## Causa Principal

El problema más probable es que **la confirmación de email está habilitada** en la configuración de Supabase, pero el usuario no ha confirmado su email después del registro.

## Soluciones

### Solución 1: Deshabilitar la confirmación de email (Recomendado para desarrollo)

1. Ve al panel de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Authentication** > **Settings**
4. En la sección **User Signups**, deshabilita **"Enable email confirmations"**
5. Guarda los cambios

### Solución 2: Implementar confirmación de email

Si quieres mantener la confirmación de email habilitada:

1. Configura un proveedor de email en Supabase
2. Modifica el flujo de registro para mostrar un mensaje de confirmación
3. Crea una página de confirmación de email
4. Actualiza el AuthContext para manejar usuarios no confirmados

### Solución 3: Verificación manual en Supabase

Para confirmar manualmente el email del usuario de prueba:

1. Ve al panel de Supabase
2. Ve a **Authentication** > **Users**
3. Busca el usuario `test@example.com`
4. Haz clic en el usuario y marca como "Email Confirmed"

## Verificación

Después de aplicar cualquiera de las soluciones:

1. Intenta hacer login con las credenciales:
   - Email: test@example.com
   - Contraseña: password123

2. El login debería funcionar correctamente y redirigir al dashboard

## Código Corregido

Ya se eliminó la verificación de `email_confirmed_at` del AuthContext.tsx que estaba causando problemas adicionales.

## Estado Actual

- ✅ Registro de usuarios funciona
- ✅ Creación automática de perfiles via trigger
- ✅ Eliminada verificación de email_confirmed_at del código
- ❌ Login falla por confirmación de email pendiente

## Próximos Pasos

1. Aplicar la **Solución 1** (deshabilitar confirmación de email)
2. Probar el login nuevamente
3. Verificar que el usuario sea redirigido al dashboard correctamente