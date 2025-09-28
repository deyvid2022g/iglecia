# 🎤 CLI de Gestión de Prédicas - Iglesia Lugar de Refugio

Una herramienta de línea de comandos para gestionar las prédicas de la iglesia directamente desde la terminal.

## 🚀 Instalación y Configuración

### 1. Configuración inicial

Ejecuta el script de configuración para establecer las credenciales de Supabase:

```bash
cd cli
node setup.js
```

Este script te pedirá:
- URL de tu proyecto Supabase
- Clave anónima (anon key) de Supabase

### 2. Configuración manual (alternativa)

Si prefieres configurar manualmente:

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` con tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   ```

## 🎯 Uso

### Ejecutar el CLI

```bash
node predicas-cli.js
```

### Crear un alias (opcional)

Para mayor comodidad, puedes crear un alias:

```bash
# En Windows (PowerShell)
Set-Alias predicas "node C:\ruta\completa\al\cli\predicas-cli.js"

# En Linux/Mac (bash/zsh)
alias predicas="node /ruta/completa/al/cli/predicas-cli.js"
```

## 📋 Funcionalidades

### 1. 📋 Listar Prédicas

Muestra las últimas 20 prédicas con información detallada:
- Título y predicador
- Fecha de la prédica
- Estado (publicada/borrador)
- Categoría
- Estadísticas (visualizaciones, likes)

### 2. ➕ Subir Nueva Prédica

Permite agregar una nueva prédica a la base de datos con los siguientes campos:
- **Título** (requerido)
- **Descripción** (requerido)
- **Predicador** (requerido)
- **Fecha** (formato: YYYY-MM-DD)
- **Duración** (formato: HH:MM, opcional)
- **URL del video** (opcional)
- **URL del audio** (opcional)
- **Categoría** (selección de lista)

**Nota:** Las prédicas se crean como borradores por defecto.

### 3. 🔍 Buscar Prédica

Busca prédicas por:
- Título
- Nombre del predicador
- Descripción

La búsqueda es insensible a mayúsculas y minúsculas.

### 4. 📊 Estadísticas

Muestra estadísticas generales:
- Total de prédicas
- Prédicas publicadas vs borradores
- Total de visualizaciones y likes
- Prédicas de los últimos 6 meses
- Distribución por categorías

## 🔧 Estructura del Proyecto

```
cli/
├── predicas-cli.js     # Script principal del CLI
├── setup.js           # Script de configuración
├── .env.example       # Plantilla de variables de entorno
├── .env               # Variables de entorno (creado después de setup)
└── README.md          # Esta documentación
```

## 🛠️ Requisitos

- Node.js 16 o superior
- Acceso a la base de datos Supabase del proyecto
- Dependencias del proyecto principal (ya instaladas)

## 📝 Ejemplos de Uso

### Ejemplo de sesión completa:

```
🎤 GESTIÓN DE PRÉDICAS - IGLESIA LUGAR DE REFUGIO
================================================
1. 📋 Listar prédicas
2. ➕ Subir nueva prédica
3. 🔍 Buscar prédica
4. 📊 Estadísticas
5. ❌ Salir
================================================

🔢 Selecciona una opción: 2

➕ SUBIR NUEVA PRÉDICA

📝 Ingresa los datos de la nueva prédica:

🎯 Título: La Gracia de Dios
📄 Descripción: Una reflexión sobre la gracia divina en nuestras vidas
👤 Predicador: Pastor Juan Pérez
📅 Fecha (YYYY-MM-DD): 2024-01-15
⏱️ Duración (HH:MM): 45:30
🎥 URL del video (opcional): https://youtube.com/watch?v=ejemplo
🎵 URL del audio (opcional): 

📂 Categorías disponibles:
1. Sermones Dominicales
2. Estudios Bíblicos
3. Conferencias

🔢 Selecciona una categoría (número): 1

✅ ¡Prédica subida exitosamente!
📋 ID: 123
🎯 Título: La Gracia de Dios
👤 Predicador: Pastor Juan Pérez
📅 Fecha: 2024-01-15
📂 Categoría: Sermones Dominicales
⚠️ Estado: Borrador (no publicada)
```

## 🔒 Seguridad

- Las credenciales se almacenan localmente en el archivo `.env`
- No incluyas el archivo `.env` en el control de versiones
- Usa solo la clave anónima de Supabase (no la clave de servicio)

## 🐛 Solución de Problemas

### Error de conexión
```
❌ Error de conexión: Invalid API key
```
**Solución:** Verifica que las credenciales en `.env` sean correctas.

### Error de permisos
```
❌ Error al subir la prédica: Row Level Security policy violation
```
**Solución:** Asegúrate de que las políticas RLS permitan la inserción desde el cliente.

### Archivo no encontrado
```
❌ Error: Cannot find module
```
**Solución:** Ejecuta el CLI desde el directorio correcto y verifica que las dependencias estén instaladas.

## 🤝 Contribuciones

Para agregar nuevas funcionalidades:

1. Modifica `predicas-cli.js`
2. Agrega la nueva opción al menú principal
3. Implementa la función correspondiente
4. Actualiza esta documentación

## 📞 Soporte

Si encuentras problemas o necesitas ayuda:
1. Verifica la configuración de Supabase
2. Revisa los logs de error
3. Consulta la documentación de Supabase
4. Contacta al administrador del sistema