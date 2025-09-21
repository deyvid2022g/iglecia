# Documentación de API

Esta documentación describe los hooks personalizados, servicios y APIs utilizados en el Sistema Web de la Iglesia.

## 📋 Tabla de Contenidos

- [Hooks de Autenticación](#hooks-de-autenticación)
- [Hooks de Contenido](#hooks-de-contenido)
- [Hooks de Tiempo Real](#hooks-de-tiempo-real)
- [Servicios](#servicios)
- [Tipos TypeScript](#tipos-typescript)
- [Contextos](#contextos)

## 🔐 Hooks de Autenticación

### `useAuth`

Hook principal para manejo de autenticación de usuarios.

```typescript
import { useAuth } from '../hooks/useAuth';

const { 
  user, 
  loading, 
  signIn, 
  signUp, 
  signOut, 
  updateProfile 
} = useAuth();
```

#### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `user` | `User \| null` | Usuario autenticado actual |
| `loading` | `boolean` | Estado de carga de autenticación |

#### Métodos

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `signIn` | `(email: string, password: string)` | `Promise<void>` | Iniciar sesión |
| `signUp` | `(email: string, password: string, userData: UserData)` | `Promise<void>` | Registrar usuario |
| `signOut` | `()` | `Promise<void>` | Cerrar sesión |
| `updateProfile` | `(data: Partial<UserProfile>)` | `Promise<void>` | Actualizar perfil |

#### Ejemplo de Uso

```typescript
const LoginComponent = () => {
  const { signIn, loading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // Redirigir o mostrar mensaje de éxito
    } catch (error) {
      // Manejar error
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Formulario de login */}
    </form>
  );
};
```

## 📝 Hooks de Contenido

### `useBlogPosts`

Hook para gestión de posts del blog.

```typescript
import { useBlogPosts } from '../hooks/useBlogPosts';

const {
  posts,
  loading,
  error,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  incrementViewCount
} = useBlogPosts(options);
```

#### Opciones

```typescript
interface UseBlogPostsOptions {
  published?: boolean;
  featured?: boolean;
  categoryId?: string;
  limit?: number;
  offset?: number;
}
```

#### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `posts` | `BlogPost[]` | Array de posts del blog |
| `loading` | `boolean` | Estado de carga |
| `error` | `string \| null` | Mensaje de error si existe |

#### Métodos

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `createPost` | `(data: CreateBlogPostData)` | `Promise<BlogPost>` | Crear nuevo post |
| `updatePost` | `(id: string, data: UpdateBlogPostData)` | `Promise<BlogPost>` | Actualizar post |
| `deletePost` | `(id: string)` | `Promise<void>` | Eliminar post |
| `toggleLike` | `(id: string)` | `Promise<void>` | Toggle like en post |
| `incrementViewCount` | `(id: string)` | `Promise<void>` | Incrementar vistas |

#### Ejemplo de Uso

```typescript
const BlogList = () => {
  const { posts, loading, createPost } = useBlogPosts({
    published: true,
    limit: 10
  });
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
};
```

### `useEvents`

Hook para gestión de eventos de la iglesia.

```typescript
import { useEvents } from '../hooks/useEvents';

const {
  events,
  loading,
  error,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent
} = useEvents(filters);
```

#### Filtros

```typescript
interface EventFilters {
  type?: string;
  category?: string;
  upcoming?: boolean;
  featured?: boolean;
  limit?: number;
}
```

#### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `events` | `Event[]` | Array de eventos |
| `loading` | `boolean` | Estado de carga |
| `error` | `string \| null` | Mensaje de error |

#### Métodos

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `createEvent` | `(data: CreateEventData)` | `Promise<Event>` | Crear evento |
| `updateEvent` | `(id: string, data: UpdateEventData)` | `Promise<Event>` | Actualizar evento |
| `deleteEvent` | `(id: string)` | `Promise<void>` | Eliminar evento |
| `registerForEvent` | `(eventId: string, userData: RegistrationData)` | `Promise<void>` | Registrarse a evento |
| `unregisterFromEvent` | `(eventId: string)` | `Promise<void>` | Cancelar registro |

### `useSermons`

Hook para gestión de sermones.

```typescript
import { useSermons } from '../hooks/useSermons';

const {
  sermons,
  loading,
  error,
  createSermon,
  updateSermon,
  deleteSermon,
  incrementViewCount,
  toggleLike
} = useSermons(options);
```

#### Opciones

```typescript
interface UseSermonsOptions {
  featured?: boolean;
  speaker?: string;
  categoryId?: string;
  limit?: number;
  sortBy?: 'date' | 'views' | 'likes';
}
```

## 🔄 Hooks de Tiempo Real

### `useRealtimeSubscriptions`

Hook para manejar suscripciones en tiempo real.

```typescript
import { useRealtimeSubscriptions } from '../hooks/useRealtimeSubscriptions';

const {
  connectionStatus,
  subscribe,
  unsubscribe,
  isSubscribed
} = useRealtimeSubscriptions();
```

#### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `connectionStatus` | `'connected' \| 'connecting' \| 'disconnected' \| 'error'` | Estado de conexión |

#### Métodos

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `subscribe` | `(table: string, callback: RealtimeCallback)` | `void` | Suscribirse a tabla |
| `unsubscribe` | `(table: string)` | `void` | Cancelar suscripción |
| `isSubscribed` | `(table: string)` | `boolean` | Verificar suscripción |

#### Ejemplo de Uso

```typescript
const RealtimeComponent = () => {
  const { connectionStatus, subscribe } = useRealtimeSubscriptions();
  
  useEffect(() => {
    subscribe('blog_posts', (payload) => {
      console.log('Cambio en blog posts:', payload);
      // Actualizar estado local
    });
  }, [subscribe]);
  
  return (
    <div>
      <RealtimeIndicator status={connectionStatus} />
      {/* Contenido del componente */}
    </div>
  );
};
```

## 🛠️ Servicios

### `blogService`

Servicio para operaciones CRUD de blog posts.

```typescript
import { blogService } from '../services/blogService';

// Obtener posts
const posts = await blogService.getPosts({
  published: true,
  limit: 10
});

// Crear post
const newPost = await blogService.createPost({
  title: 'Nuevo Post',
  content: 'Contenido del post...',
  // ...otros campos
});

// Actualizar post
const updatedPost = await blogService.updatePost(postId, {
  title: 'Título actualizado'
});

// Eliminar post
await blogService.deletePost(postId);
```

#### Métodos Disponibles

| Método | Descripción |
|--------|-------------|
| `getPosts(options)` | Obtener lista de posts |
| `getPost(id)` | Obtener post por ID |
| `getPostBySlug(slug)` | Obtener post por slug |
| `createPost(data)` | Crear nuevo post |
| `updatePost(id, data)` | Actualizar post |
| `deletePost(id)` | Eliminar post |
| `toggleLike(id)` | Toggle like |
| `incrementViewCount(id)` | Incrementar vistas |

### `eventService`

Servicio para gestión de eventos.

```typescript
import { eventService } from '../services/eventService';

// Obtener eventos
const events = await eventService.getEvents({
  upcoming: true,
  type: 'service'
});

// Registrarse a evento
await eventService.registerForEvent(eventId, {
  name: 'Juan Pérez',
  email: 'juan@email.com',
  phone: '+1234567890'
});
```

### `sermonService`

Servicio para gestión de sermones.

```typescript
import { sermonService } from '../services/sermonService';

// Obtener sermones
const sermons = await sermonService.getSermons({
  featured: true,
  limit: 5
});

// Incrementar reproducciones
await sermonService.incrementViewCount(sermonId);
```

## 📊 Tipos TypeScript

### Tipos de Usuario

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  name: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
}
```

### Tipos de Blog

```typescript
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  category_id?: string;
  author_id: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreateBlogPostData {
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  is_published?: boolean;
  is_featured?: boolean;
  tags?: string[];
  category_id?: string;
}
```

### Tipos de Eventos

```typescript
interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  detailed_description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location: string;
  featured_image?: string;
  type: string;
  category: string;
  capacity?: number;
  current_registrations: number;
  requires_rsvp: boolean;
  cost?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface RegistrationData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}
```

### Tipos de Sermones

```typescript
interface Sermon {
  id: string;
  slug: string;
  title: string;
  description?: string;
  speaker: string;
  sermon_date: string;
  duration?: string;
  thumbnail_url?: string;
  video_url?: string;
  audio_url?: string;
  transcript?: string;
  has_transcript: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  tags: string[];
  category_id?: string;
  is_published: boolean;
  featured: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## 🌐 Contextos

### `AuthContext`

Contexto global para autenticación.

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: UserData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}
```

### `RealtimeContext`

Contexto para funcionalidades en tiempo real.

```typescript
interface RealtimeContextType {
  connectionStatus: ConnectionStatus;
  subscribe: (table: string, callback: RealtimeCallback) => void;
  unsubscribe: (table: string) => void;
  isSubscribed: (table: string) => boolean;
  connectedUsers: User[];
  liveUpdates: LiveUpdate[];
}
```

## 🔧 Configuración de Supabase

### Configuración de Cliente

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

### Configuración de Realtime

```typescript
// Suscripción a cambios en tiempo real
const channel = supabase
  .channel('table_changes')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'blog_posts' 
    },
    (payload) => {
      handleRealtimeUpdate(payload);
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

## 🚨 Manejo de Errores

### Tipos de Error

```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

interface ValidationError {
  field: string;
  message: string;
}
```

### Ejemplo de Manejo

```typescript
const handleApiCall = async () => {
  try {
    const result = await blogService.createPost(postData);
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      // Manejar error de API
      console.error('API Error:', error.message);
    } else {
      // Manejar error genérico
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};
```

## 📈 Optimización y Rendimiento

### Memoización

```typescript
import { useMemo, useCallback } from 'react';

const BlogList = ({ posts, filters }) => {
  const filteredPosts = useMemo(() => {
    return posts.filter(post => 
      filters.category ? post.category_id === filters.category : true
    );
  }, [posts, filters.category]);
  
  const handleLike = useCallback((postId: string) => {
    // Lógica de like
  }, []);
  
  return (
    <div>
      {filteredPosts.map(post => (
        <BlogCard 
          key={post.id} 
          post={post} 
          onLike={handleLike}
        />
      ))}
    </div>
  );
};
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const BlogEditor = lazy(() => import('./BlogEditor'));

const BlogPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BlogEditor />
    </Suspense>
  );
};
```

---

Esta documentación se actualiza regularmente. Para más información o preguntas específicas, consulta el código fuente o crea un issue en el repositorio.