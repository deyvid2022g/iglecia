# Guía de Migración a Supabase

Este documento proporciona instrucciones detalladas para migrar los datos de la aplicación desde localStorage a Supabase.

## Requisitos Previos

1. Node.js instalado (versión 14 o superior)
2. Cuenta en Supabase con un proyecto creado
3. Variables de entorno configuradas:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Proceso de Migración

La migración se realiza en dos pasos principales:

### 1. Exportar Datos desde el Navegador

Primero, necesitas exportar los datos almacenados en localStorage a archivos JSON:

1. Abre la aplicación en el navegador y asegúrate de estar autenticado como administrador.
2. Abre la consola del desarrollador (F12 o Ctrl+Shift+I).
3. Copia y pega el siguiente código en la consola:

```javascript
// Código para ejecutar en la consola del navegador
const data = {
  users: JSON.parse(localStorage.getItem('users') || '[]'),
  events: JSON.parse(localStorage.getItem('events') || '[]'),
  sermons: JSON.parse(localStorage.getItem('sermons') || '[]'),
  blogPosts: JSON.parse(localStorage.getItem('blogPosts') || '[]')
};

// Descargar cada conjunto de datos como un archivo JSON
Object.entries(data).forEach(([key, value]) => {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = key + '.json';
  a.click();
  URL.revokeObjectURL(url);
});
```

4. Esto descargará cuatro archivos JSON: `users.json`, `events.json`, `sermons.json` y `blogPosts.json`.

### 2. Preparar el Entorno para la Migración

1. Crea una carpeta `data` en la raíz del proyecto:

```bash
mkdir -p data
```

2. Mueve los archivos JSON descargados a la carpeta `data`:

```bash
mv ~/Downloads/*.json data/
```

### 3. Ejecutar el Script de Migración

1. Asegúrate de tener las variables de entorno configuradas. Puedes crear un archivo `.env` en la raíz del proyecto:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

2. Instala las dependencias necesarias si aún no lo has hecho:

```bash
npm install @supabase/supabase-js
```

3. Ejecuta el script de migración:

```bash
node scripts/migrateToSupabaseImproved.js --migrate
```

## Características del Script Mejorado

El script `migrateToSupabaseImproved.js` incluye las siguientes mejoras respecto al script original:

1. **Lectura de datos desde archivos**: En lugar de intentar acceder a localStorage (que no está disponible en Node.js), lee los datos desde archivos JSON exportados.

2. **Verificación de registros existentes**: Antes de insertar un registro, verifica si ya existe en la base de datos para evitar duplicados.

3. **Manejo seguro de contraseñas**: Utiliza contraseñas temporales si no hay contraseñas disponibles, evitando almacenar contraseñas en texto plano.

4. **Compatibilidad con nombres de campo**: Maneja tanto los nombres de campo en camelCase como en snake_case para mayor compatibilidad.

5. **Mensajes detallados**: Proporciona información detallada sobre el proceso de migración, incluyendo éxitos y errores.

6. **Opciones de línea de comandos**: Incluye opciones para mostrar ayuda, exportar datos o ejecutar la migración.

## Verificación Post-Migración

Después de ejecutar la migración, verifica que los datos se hayan transferido correctamente:

1. Accede al panel de control de Supabase.
2. Revisa las tablas `users`, `events`, `sermons` y `blog_posts` para confirmar que contienen los datos esperados.
3. Prueba la aplicación para asegurarte de que funciona correctamente con los datos migrados.

## Solución de Problemas

### Error: Las variables de entorno de Supabase no están configuradas

Asegúrate de que las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas correctamente.

### Error al crear usuario de autenticación

Esto puede ocurrir si:
- El usuario ya existe en Supabase Auth.
- La contraseña no cumple con los requisitos de seguridad.
- El correo electrónico no es válido.

Solución: Verifica los requisitos de contraseña en Supabase y asegúrate de que los correos electrónicos sean válidos.

### Error al migrar datos

Si encuentras errores al migrar datos específicos, revisa los mensajes de error para identificar el problema. Posibles causas incluyen:
- Restricciones de esquema no cumplidas.
- Datos faltantes en campos requeridos.
- Formato de datos incorrecto.

## Contacto

Si encuentras problemas durante la migración, contacta al equipo de desarrollo para obtener asistencia.