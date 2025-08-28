# Sitio Web de Lugar de Refugio

Este proyecto es un sitio web para la Iglesia Lugar de Refugio, desarrollado con React, TypeScript y Tailwind CSS.

## Características

- Página de inicio con información general de la iglesia
- Sección de eventos y actividades
- Sección de prédicas y enseñanzas
- Blog con publicaciones
- Página de contacto
- Panel de administración para gestionar contenido
- Integración con Supabase para autenticación y base de datos

## Tecnologías utilizadas

- React
- TypeScript
- Tailwind CSS
- Vite
- Supabase (autenticación y base de datos)

## Instalación

1. Clona el repositorio

```bash
git clone <url-del-repositorio>
cd iglecia-master
```

2. Instala las dependencias

```bash
npm install
```

3. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

4. Inicia el servidor de desarrollo

```bash
npm run dev
```

## Configuración de Supabase

Para configurar Supabase para este proyecto, sigue las instrucciones en el archivo [SUPABASE.md](./SUPABASE.md) y en la carpeta [supabase](./supabase).

## Licencia

Todos los derechos reservados - Lugar de Refugio