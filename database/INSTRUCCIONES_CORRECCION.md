# Instrucciones para Corregir Error 500 en Autenticación

## Problema Identificado
El error 500 durante el login se debe a un conflicto en las políticas RLS (Row Level Security) que impiden que la función `handle_new_user` pueda insertar automáticamente el perfil del usuario durante el registro.

## Solución

### Paso 1: Acceder a Supabase Dashboard
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto: `toopbtydsiepeoisuecg`
3. Ve a la sección "SQL Editor"

### Paso 2: Ejecutar Script de Corrección
1. Copia el contenido del archivo `fix_auth_final.sql`
2. Pégalo en el SQL Editor de Supabase
3. Ejecuta el script haciendo clic en "Run"

### Paso 3: Verificar la Corrección
1. Ve a la sección "Authentication" > "Policies"
2. Verifica que las políticas para la tabla `profiles` estén configuradas correctamente
3. Prueba el login en la aplicación

## Qué hace la Corrección

1. **Elimina políticas conflictivas**: Remueve las políticas RLS que impedían la inserción automática
2. **Mejora la función handle_new_user**: Añade manejo robusto de errores y actualización en caso de duplicados
3. **Crea políticas RLS permisivas**: Permite la creación automática de perfiles manteniendo la seguridad
4. **Recrea el trigger**: Asegura que el trigger funcione correctamente

## Políticas RLS Resultantes

- **INSERT**: Permite cualquier inserción (necesario para el trigger automático)
- **SELECT**: Permite lectura pública de perfiles
- **UPDATE**: Solo el propio usuario puede actualizar su perfil
- **DELETE**: Solo administradores pueden eliminar perfiles

## Verificación
Después de aplicar la corrección, el login debería funcionar sin errores 500.