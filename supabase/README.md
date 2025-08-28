# Configuración de Supabase

Este documento proporciona instrucciones para configurar Supabase para este proyecto.

## Pasos para configurar Supabase

1. **Crear una cuenta en Supabase**
   - Visita [https://supabase.com](https://supabase.com) y crea una cuenta si aún no tienes una.

2. **Crear un nuevo proyecto**
   - Haz clic en "New Project" en el dashboard de Supabase.
   - Selecciona una organización o crea una nueva.
   - Asigna un nombre al proyecto.
   - Establece una contraseña segura para la base de datos.
   - Selecciona la región más cercana a tus usuarios.
   - Haz clic en "Create new project".

3. **Configurar la autenticación**
   - En el panel de Supabase, ve a "Authentication" > "Settings".
   - Configura el dominio del sitio (URL donde se alojará tu aplicación).
   - Habilita los proveedores de autenticación que desees utilizar (por defecto, Email está habilitado).
   - En "Email Templates", personaliza los correos de confirmación, restablecimiento de contraseña, etc.

4. **Crear las tablas de la base de datos**
   - Ve a "SQL Editor" en el panel de Supabase.
   - Crea un nuevo script y pega el contenido del archivo `schema.sql` que se encuentra en este directorio.
   - Ejecuta el script para crear todas las tablas y políticas de seguridad.

5. **Configurar las variables de entorno**
   - En el panel de Supabase, ve a "Settings" > "API".
   - Copia la URL del proyecto y la clave anónima (anon key).
   - Asegúrate de que estas variables estén configuradas en el archivo `.env` en la raíz del proyecto:
     ```
     VITE_SUPABASE_URL=tu_url_de_supabase
     VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
     ```

6. **Configurar el almacenamiento (opcional)**
   - Si planeas utilizar el almacenamiento de Supabase para imágenes u otros archivos:
   - Ve a "Storage" en el panel de Supabase.
   - Crea buckets para diferentes tipos de archivos (por ejemplo, "avatars", "sermon-thumbnails", "event-images", etc.).
   - Configura las políticas de acceso para cada bucket según tus necesidades.

## Migración de datos existentes

Si tienes datos existentes que deseas migrar a Supabase, puedes seguir estos pasos:

1. **Exportar datos existentes**
   - Exporta tus datos actuales a formato JSON o CSV.

2. **Importar datos a Supabase**
   - Utiliza la función de importación de Supabase en la sección "Table Editor".
   - O utiliza el script de migración proporcionado en este directorio (si existe).

## Pruebas

Para verificar que la configuración de Supabase funciona correctamente:

1. Ejecuta la aplicación localmente.
2. Intenta registrar un nuevo usuario.
3. Inicia sesión con el usuario registrado.
4. Verifica que puedas acceder a las rutas protegidas.
5. Prueba la creación, lectura, actualización y eliminación de datos en las diferentes tablas según los permisos del usuario.

## Solución de problemas comunes

### Error de CORS

Si encuentras errores de CORS:

1. Ve a "Settings" > "API" en el panel de Supabase.
2. En la sección "CORS", agrega la URL de tu aplicación (por ejemplo, `http://localhost:5173`).

### Problemas de autenticación

Si los usuarios no pueden iniciar sesión o registrarse:

1. Verifica que las variables de entorno estén configuradas correctamente.
2. Asegúrate de que las políticas de seguridad permitan las operaciones necesarias.
3. Revisa los registros de la consola del navegador para identificar errores específicos.

### Errores en las políticas de seguridad

Si los usuarios no pueden acceder a ciertos datos o realizar ciertas operaciones:

1. Revisa las políticas de seguridad en el archivo `schema.sql`.
2. Asegúrate de que los roles de usuario estén configurados correctamente en la tabla `users`.
3. Verifica que las políticas se hayan aplicado correctamente en la base de datos.