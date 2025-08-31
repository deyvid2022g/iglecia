# Base de Datos - Iglesia Cristiana

## Descripción

Este directorio contiene el esquema completo de la base de datos para la aplicación web de la iglesia, diseñado para funcionar con Supabase (PostgreSQL).

## Estructura de la Base de Datos

### Tablas Principales

#### 👥 Usuarios y Autenticación
- **profiles**: Perfiles de usuario extendidos
- **notification_reads**: Lecturas de notificaciones por usuario

#### 📅 Eventos
- **locations**: Ubicaciones para eventos
- **events**: Eventos de la iglesia
- **event_registrations**: Inscripciones a eventos

#### 🎤 Prédicas
- **sermon_categories**: Categorías de prédicas
- **sermon_series**: Series de prédicas
- **sermons**: Prédicas individuales
- **sermon_resources**: Recursos adicionales de prédicas

#### 📝 Blog
- **blog_categories**: Categorías del blog
- **blog_posts**: Artículos del blog
- **comments**: Comentarios (unificado para eventos, prédicas y blog)
- **likes**: Likes (unificado para todo el contenido)
- **newsletter_subscriptions**: Suscripciones al boletín
- **contact_messages**: Mensajes de contacto

#### ⛪ Ministerios
- **ministries**: Ministerios de la iglesia
- **ministry_activities**: Actividades ministeriales
- **ministry_members**: Miembros de ministerios
- **ministry_resources**: Recursos ministeriales
- **age_groups**: Grupos por edad
- **age_group_members**: Miembros por grupo de edad

#### ⚙️ Configuraciones
- **church_settings**: Configuraciones generales
- **service_schedules**: Horarios de servicios
- **office_hours**: Horarios de atención
- **special_dates**: Fechas especiales y feriados
- **church_facilities**: Instalaciones de la iglesia
- **facility_bookings**: Reservas de instalaciones
- **system_notifications**: Notificaciones del sistema

## Archivos de Migración

### Orden de Ejecución

1. **000_initial_setup.sql** - Configuración inicial y funciones base
2. **001_events_tables.sql** - Tablas de eventos
3. **002_sermons_tables.sql** - Tablas de prédicas
4. **003_blog_tables.sql** - Tablas del blog
5. **004_ministries_tables.sql** - Tablas de ministerios
6. **005_church_settings_tables.sql** - Configuraciones de la iglesia

### Archivos Adicionales

- **schema.sql** - Esquema completo en un solo archivo
- **run_migrations.sql** - Script de verificación post-migración
- **README.md** - Esta documentación

## Configuración en Supabase

### Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la clave anónima

### Paso 2: Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`
2. Completa las variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_APP_NAME=Iglesia Cristiana
VITE_APP_VERSION=1.0.0
```

### Paso 3: Ejecutar Migraciones

#### Opción A: Archivo por Archivo (Recomendado)

1. Abre el Dashboard de Supabase
2. Ve a "SQL Editor"
3. Ejecuta los archivos en orden:

```sql
-- 1. Ejecutar 000_initial_setup.sql
-- 2. Ejecutar 001_events_tables.sql
-- 3. Ejecutar 002_sermons_tables.sql
-- 4. Ejecutar 003_blog_tables.sql
-- 5. Ejecutar 004_ministries_tables.sql
-- 6. Ejecutar 005_church_settings_tables.sql
```

#### Opción B: Esquema Completo

1. Abre el archivo `schema.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Ejecuta

### Paso 4: Verificar Instalación

1. Ejecuta el archivo `run_migrations.sql` en el SQL Editor
2. Revisa que todas las tablas, funciones y políticas estén creadas
3. Verifica que los datos de ejemplo se hayan insertado correctamente

## Características de Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

- **Lectura pública**: Contenido activo visible para todos
- **Autenticación requerida**: Operaciones que requieren usuario logueado
- **Control por roles**: Administradores y pastores tienen permisos especiales
- **Propiedad de contenido**: Los usuarios pueden editar su propio contenido

### Roles de Usuario

- **admin**: Acceso completo al sistema
- **pastor**: Gestión de contenido y ministerios
- **leader**: Liderazgo de ministerios específicos
- **member**: Miembro activo de la iglesia
- **visitor**: Visitante o nuevo interesado

## Funciones Auxiliares

### Funciones de Utilidad

- `update_updated_at_column()`: Actualiza automáticamente el campo updated_at
- `generate_slug()`: Genera slugs URL-friendly
- `is_valid_email()`: Valida formato de email
- `is_valid_colombian_phone()`: Valida teléfonos colombianos
- `strip_html_tags()`: Remueve etiquetas HTML
- `calculate_read_time()`: Calcula tiempo de lectura estimado
- `generate_excerpt()`: Genera resúmenes automáticos

### Triggers Automáticos

- **updated_at**: Se actualiza automáticamente en todas las tablas
- **Contadores**: Se mantienen automáticamente (miembros, likes, comentarios)
- **Perfiles**: Se crean automáticamente al registrar usuario
- **Login tracking**: Se actualiza last_login automáticamente

## Datos de Ejemplo

Las migraciones incluyen datos de ejemplo para:

- ✅ Ubicaciones de eventos
- ✅ Categorías de prédicas y series
- ✅ Categorías del blog
- ✅ Ministerios y actividades
- ✅ Grupos de edad
- ✅ Configuraciones de la iglesia
- ✅ Horarios de servicios y atención
- ✅ Fechas especiales
- ✅ Instalaciones de la iglesia

## Mantenimiento

### Respaldos

- Supabase realiza respaldos automáticos
- Se recomienda exportar datos importantes regularmente
- Mantener copias locales de las migraciones

### Actualizaciones

- Crear nuevas migraciones numeradas secuencialmente
- Nunca modificar migraciones ya aplicadas
- Probar cambios en entorno de desarrollo primero

### Monitoreo

- Revisar logs de Supabase regularmente
- Monitorear uso de la base de datos
- Optimizar consultas lentas según sea necesario

## Soporte

Para problemas o preguntas:

1. Revisar la documentación de Supabase
2. Verificar logs en el Dashboard
3. Consultar la comunidad de Supabase
4. Contactar al equipo de desarrollo

---

**Nota**: Este esquema está diseñado específicamente para iglesias cristianas y puede requerir adaptaciones para otros tipos de organizaciones religiosas.