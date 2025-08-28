# Integración con Supabase

Este documento describe la integración de la aplicación con Supabase como base de datos y sistema de autenticación.

## Configuración

### Variables de entorno

La aplicación utiliza las siguientes variables de entorno para conectarse a Supabase:

```
VITE_SUPABASE_URL=https://xrbmmhqekgtgcfxxnrbb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyYm1taHFla2d0Z2NmeHhucmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzkwODgsImV4cCI6MjA3MTQ1NTA4OH0.13DXwhqwzJYHRsFVBnUzmdyZ4cZzrWRe2o5Sa60rRYc
```

Estas variables están configuradas en el archivo `.env` en la raíz del proyecto.

## Estructura de la base de datos

La base de datos en Supabase contiene las siguientes tablas principales:

### Tabla `users`

Almacena información adicional de los usuarios registrados.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | ID del usuario (referencia a auth.users) |
| name | text | Nombre completo del usuario |
| email | text | Correo electrónico del usuario |
| phone | text | Número de teléfono (opcional) |
| role | text | Rol del usuario (admin, pastor, editor, member) |
| avatar_url | text | URL de la imagen de perfil |
| created_at | timestamp | Fecha de creación |
| updated_at | timestamp | Fecha de actualización |

### Tabla `events`

Almacena información sobre eventos de la iglesia.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | ID único del evento |
| title | text | Título del evento |
| date | date | Fecha del evento |
| startTime | text | Hora de inicio |
| endTime | text | Hora de finalización |
| type | text | Tipo de evento |
| location | jsonb | Ubicación (nombre y dirección) |
| description | text | Descripción del evento |
| capacity | integer | Capacidad máxima |
| registrations | integer | Número de registros actuales |
| image | text | URL de la imagen del evento |
| host | text | Anfitrión del evento |
| requiresRSVP | boolean | Indica si requiere confirmación |
| createdAt | timestamp | Fecha de creación |
| updatedAt | timestamp | Fecha de actualización |

### Tabla `sermons`

Almacena información sobre las prédicas.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | ID único de la prédica |
| title | text | Título de la prédica |
| slug | text | Slug para URL amigable |
| speaker | text | Nombre del predicador |
| date | date | Fecha de la prédica |
| audioUrl | text | URL del audio |
| videoUrl | text | URL del video |
| thumbnailUrl | text | URL de la miniatura |
| description | text | Descripción de la prédica |
| scripture | text | Pasaje bíblico principal |
| tags | text[] | Etiquetas relacionadas |
| series | text | Serie a la que pertenece |
| viewCount | integer | Contador de visualizaciones |
| downloadCount | integer | Contador de descargas |
| createdAt | timestamp | Fecha de creación |
| updatedAt | timestamp | Fecha de actualización |

### Tabla `blog_posts`

Almacena entradas del blog.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | uuid | ID único del post |
| title | text | Título del post |
| slug | text | Slug para URL amigable |
| content | text | Contenido del post |
| excerpt | text | Extracto del post |
| author | jsonb | Información del autor |
| coverImage | text | URL de la imagen de portada |
| publishedAt | timestamp | Fecha de publicación |
| tags | text[] | Etiquetas relacionadas |
| category | text | Categoría del post |
| views | integer | Contador de visualizaciones |
| featured | boolean | Indica si es destacado |
| createdAt | timestamp | Fecha de creación |
| updatedAt | timestamp | Fecha de actualización |

## Autenticación

La autenticación se maneja a través del sistema de autenticación de Supabase, que proporciona:

- Registro de usuarios con email y contraseña
- Inicio de sesión con email y contraseña
- Verificación de email
- Recuperación de contraseña
- Gestión de sesiones

El flujo de autenticación está implementado en el contexto `AuthContext` y se utiliza en toda la aplicación para proteger rutas y mostrar contenido según el rol del usuario.

## Servicios

Se han creado servicios para interactuar con la base de datos de Supabase:

- `userService`: Gestión de usuarios
- `eventService`: Gestión de eventos
- `sermonService`: Gestión de prédicas
- `blogService`: Gestión de entradas del blog

Estos servicios proporcionan métodos para realizar operaciones CRUD en las respectivas tablas.

## Ejemplo de uso

Se ha creado un componente de ejemplo `SupabaseExample.tsx` que muestra cómo utilizar los servicios para interactuar con la base de datos.

## Próximos pasos

1. Crear las tablas en Supabase según la estructura definida
2. Implementar políticas de seguridad en Supabase para controlar el acceso a los datos
3. Migrar los datos existentes a Supabase
4. Actualizar los componentes de la aplicación para utilizar los servicios de Supabase