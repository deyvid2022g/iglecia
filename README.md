# Sistema Web para Iglesia - Lugar de Refugio

Una aplicación web moderna y completa para la gestión de contenido de la Iglesia Lugar de Refugio, desarrollada con React, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características Principales

### ✨ Funcionalidades Core
- **Sistema de Autenticación**: Registro, login, logout y protección de rutas
- **Gestión de Blog**: Creación, edición y visualización de artículos
- **Gestión de Eventos**: Organización y promoción de eventos de la iglesia
- **Gestión de Sermones**: Biblioteca de sermones con audio/video
- **Tiempo Real**: Actualizaciones en vivo usando Supabase Realtime
- **Comentarios**: Sistema de comentarios para blog, eventos y sermones
- **Interacciones**: Likes, favoritos y compartir contenido

### 🎨 Interfaz de Usuario
- **Diseño Responsivo**: Optimizado para móviles, tablets y desktop
- **UI Moderna**: Interfaz limpia y profesional con Tailwind CSS
- **Componentes Reutilizables**: Arquitectura modular y mantenible
- **Indicadores de Estado**: Feedback visual para todas las acciones
- **Modo Oscuro**: Soporte para tema claro/oscuro (futuro)

### 🔧 Tecnologías Utilizadas
- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Routing**: React Router DOM
- **Iconos**: Lucide React
- **Estado**: React Hooks + Context API

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── auth/            # Componentes de autenticación
│   ├── blog/            # Componentes específicos del blog
│   ├── common/          # Componentes comunes (botones, modales, etc.)
│   ├── events/          # Componentes de eventos
│   ├── layout/          # Componentes de layout (navbar, footer)
│   ├── realtime/        # Componentes de tiempo real
│   └── sermons/         # Componentes de sermones
├── contexts/            # Contextos de React
│   ├── AuthContext.tsx  # Contexto de autenticación
│   └── RealtimeContext.tsx # Contexto de tiempo real
├── hooks/               # Custom hooks
│   ├── useAuth.ts       # Hook de autenticación
│   ├── useBlogPosts.ts  # Hook para blog posts
│   ├── useEvents.ts     # Hook para eventos
│   ├── useSermons.ts    # Hook para sermones
│   └── useRealtimeSubscriptions.ts # Hook para tiempo real
├── lib/                 # Configuraciones y utilidades
│   ├── supabase.ts      # Configuración de Supabase
│   └── localData.ts     # Datos de ejemplo
├── pages/               # Páginas de la aplicación
├── services/            # Servicios para API calls
│   ├── blogService.ts   # Servicio del blog
│   ├── eventService.ts  # Servicio de eventos
│   └── sermonService.ts # Servicio de sermones
└── types/               # Definiciones de tipos TypeScript
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd iglecia
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Configurar base de datos**
Ejecutar las migraciones SQL en tu proyecto de Supabase (ver sección de Base de Datos)

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

## 🗄️ Base de Datos

### Tablas Principales

#### `blog_posts`
```sql
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  tags TEXT[],
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `events`
```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT NOT NULL,
  featured_image TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  requires_rsvp BOOLEAN DEFAULT false,
  cost TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `sermons`
```sql
CREATE TABLE sermons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  speaker TEXT NOT NULL,
  sermon_date DATE NOT NULL,
  duration TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  transcript TEXT,
  has_transcript BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  tags TEXT[],
  category_id UUID REFERENCES categories(id),
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Configuración de RLS (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (público puede leer contenido publicado)
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read published events" ON events
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read published sermons" ON sermons
  FOR SELECT USING (is_published = true);

-- Políticas de escritura (solo usuarios autenticados)
CREATE POLICY "Authenticated users can insert blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their blog posts" ON blog_posts
  FOR UPDATE USING (auth.uid() = author_id);
```

## 🔄 Funcionalidades en Tiempo Real

### Configuración de Realtime

El sistema utiliza Supabase Realtime para actualizaciones en vivo:

```typescript
// Ejemplo de suscripción a cambios en blog posts
const channel = supabase
  .channel('blog_posts_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'blog_posts' },
    (payload) => {
      // Manejar cambios en tiempo real
      handleRealtimeUpdate(payload);
    }
  )
  .subscribe();
```

### Componentes de Tiempo Real

- **RealtimeIndicator**: Muestra el estado de conexión
- **LiveUpdateBanner**: Notificaciones de actualizaciones en vivo
- **PresenceIndicator**: Usuarios conectados en tiempo real

## 🎯 Hooks Personalizados

### `useAuth`
Maneja la autenticación de usuarios:
```typescript
const { user, loading, signIn, signUp, signOut } = useAuth();
```

### `useBlogPosts`
Gestiona los posts del blog:
```typescript
const { 
  posts, 
  loading, 
  error, 
  createPost, 
  updatePost, 
  deletePost 
} = useBlogPosts();
```

### `useEvents`
Maneja los eventos:
```typescript
const { 
  events, 
  loading, 
  createEvent, 
  registerForEvent 
} = useEvents();
```

### `useSermons`
Gestiona los sermones:
```typescript
const { 
  sermons, 
  loading, 
  createSermon, 
  incrementViewCount 
} = useSermons();
```

## 🧩 Componentes Principales

### Componentes de Layout
- **Navbar**: Navegación principal con autenticación
- **Footer**: Pie de página con información de contacto
- **Sidebar**: Navegación lateral (dashboard)

### Componentes de Contenido
- **BlogCard**: Tarjeta para mostrar posts del blog
- **EventCard**: Tarjeta para mostrar eventos
- **SermonCard**: Tarjeta para mostrar sermones
- **CommentSection**: Sistema de comentarios reutilizable

### Componentes de UI
- **LoadingSpinner**: Indicadores de carga
- **ErrorBoundary**: Manejo de errores
- **SearchAndFilter**: Búsqueda y filtrado
- **InteractionButtons**: Botones de like, compartir, etc.

## 🔐 Autenticación y Autorización

### Flujo de Autenticación
1. **Registro**: Crear nueva cuenta con email/password
2. **Login**: Iniciar sesión con credenciales
3. **Protección de Rutas**: Rutas protegidas para usuarios autenticados
4. **Roles**: Sistema básico de roles (usuario/admin)

### Componentes de Auth
- **LoginForm**: Formulario de inicio de sesión
- **RegisterForm**: Formulario de registro
- **ProtectedRoute**: Wrapper para rutas protegidas

## 📱 Responsive Design

El diseño es completamente responsivo con breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Utiliza Tailwind CSS para un diseño mobile-first.

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
VITE_SUPABASE_URL=tu_supabase_url_produccion
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key_produccion
```

### Build de Producción
```bash
npm run build
```

### Despliegue en Vercel/Netlify
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático en cada push

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Coverage
npm run test:coverage
```

## 📈 Rendimiento

### Optimizaciones Implementadas
- **Lazy Loading**: Carga diferida de componentes
- **Memoización**: React.memo para componentes pesados
- **Virtualización**: Para listas largas
- **Optimización de Imágenes**: Formatos modernos y lazy loading

## 🔧 Desarrollo

### Scripts Disponibles
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos
```

### Convenciones de Código
- **TypeScript**: Tipado estricto
- **ESLint**: Linting automático
- **Prettier**: Formateo de código
- **Conventional Commits**: Mensajes de commit estandarizados

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Todos los derechos reservados - Lugar de Refugio

## 📞 Soporte

Para soporte técnico o preguntas:
- **Email**: soporte@lugarderefugio.com
- **Issues**: GitHub Issues
- **Documentación**: Wiki del proyecto

---

**Desarrollado con ❤️ para la comunidad de la Iglesia Lugar de Refugio**