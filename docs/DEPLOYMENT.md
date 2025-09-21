# Guía de Despliegue

Esta guía proporciona instrucciones detalladas para desplegar el Sistema Web de la Iglesia en diferentes plataformas y entornos.

## 📋 Tabla de Contenidos

- [Preparación para Despliegue](#preparación-para-despliegue)
- [Variables de Entorno](#variables-de-entorno)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Despliegue en Netlify](#despliegue-en-netlify)
- [Despliegue en AWS](#despliegue-en-aws)
- [Despliegue con Docker](#despliegue-con-docker)
- [Configuración de Supabase](#configuración-de-supabase)
- [Configuración de Dominio](#configuración-de-dominio)
- [Monitoreo y Logs](#monitoreo-y-logs)
- [Troubleshooting](#troubleshooting)

## 🚀 Preparación para Despliegue

### 1. Verificar Configuración Local

Antes del despliegue, asegúrate de que todo funcione correctamente en local:

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm run test

# Verificar build
npm run build

# Previsualizar build
npm run preview
```

### 2. Optimización de Build

```bash
# Analizar bundle size
npm run build -- --analyze

# Verificar que no hay errores de TypeScript
npm run type-check

# Verificar linting
npm run lint
```

### 3. Checklist Pre-Despliegue

- [ ] Todas las pruebas pasan
- [ ] Build se genera sin errores
- [ ] Variables de entorno configuradas
- [ ] Base de datos Supabase configurada
- [ ] Imágenes optimizadas
- [ ] SEO meta tags configurados
- [ ] Funcionalidades en tiempo real probadas

## 🔐 Variables de Entorno

### Variables Requeridas

Crea un archivo `.env.production` con las siguientes variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# App Configuration
VITE_APP_NAME="Sistema Web Iglesia"
VITE_APP_URL=https://tu-dominio.com
VITE_APP_DESCRIPTION="Sistema web completo para gestión de iglesia"

# Features Flags
VITE_ENABLE_REALTIME=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true

# External Services (Opcional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_CLOUDINARY_CLOUD_NAME=tu_cloud_name

# Email Configuration (Para contacto)
VITE_CONTACT_EMAIL=contacto@tu-iglesia.com
VITE_ADMIN_EMAIL=admin@tu-iglesia.com
```

### Obtener Credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto o usa uno existente
3. Ve a Settings > API
4. Copia la URL del proyecto y la clave anónima

## 🌐 Despliegue en Vercel

### Método 1: Desde GitHub (Recomendado)

1. **Conectar Repositorio**
   ```bash
   # Push tu código a GitHub
   git add .
   git commit -m "Preparar para despliegue"
   git push origin main
   ```

2. **Configurar en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa tu repositorio
   - Configura las variables de entorno

3. **Configuración de Build**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

### Método 2: CLI de Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel

# Configurar variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Desplegar a producción
vercel --prod
```

### Configuración de vercel.json

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🎯 Despliegue en Netlify

### Método 1: Drag & Drop

```bash
# Generar build
npm run build

# Subir carpeta dist a netlify.com
```

### Método 2: Git Integration

1. **Conectar Repositorio**
   - Ve a [netlify.com](https://netlify.com)
   - New site from Git
   - Conecta tu repositorio

2. **Configuración de Build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Variables de Entorno**
   - Site settings > Environment variables
   - Agregar todas las variables VITE_*

### Configuración de netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## ☁️ Despliegue en AWS

### Usando AWS Amplify

1. **Configurar Amplify**
   ```bash
   # Instalar Amplify CLI
   npm install -g @aws-amplify/cli
   
   # Configurar
   amplify configure
   
   # Inicializar proyecto
   amplify init
   
   # Agregar hosting
   amplify add hosting
   
   # Desplegar
   amplify publish
   ```

2. **Configuración de amplify.yml**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### Usando S3 + CloudFront

1. **Crear Bucket S3**
   ```bash
   # Crear bucket
   aws s3 mb s3://tu-iglesia-web
   
   # Configurar como sitio web
   aws s3 website s3://tu-iglesia-web --index-document index.html --error-document index.html
   ```

2. **Subir Archivos**
   ```bash
   # Build del proyecto
   npm run build
   
   # Subir a S3
   aws s3 sync dist/ s3://tu-iglesia-web --delete
   ```

3. **Configurar CloudFront**
   - Crear distribución de CloudFront
   - Configurar origen como el bucket S3
   - Configurar error pages para SPA

## 🐳 Despliegue con Docker

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  # Opcional: Agregar servicio de base de datos local
  # postgres:
  #   image: postgres:15
  #   environment:
  #     POSTGRES_DB: iglesia
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: password
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

# volumes:
#   postgres_data:
```

### Comandos Docker

```bash
# Build imagen
docker build -t iglesia-web .

# Ejecutar contenedor
docker run -p 80:80 iglesia-web

# Usando docker-compose
docker-compose up -d

# Ver logs
docker-compose logs -f web
```

## 🗄️ Configuración de Supabase

### 1. Configurar Base de Datos

```sql
-- Habilitar Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can create posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE sermons;
```

### 2. Configurar Storage

```sql
-- Crear buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('blog-images', 'blog-images', true),
  ('event-images', 'event-images', true),
  ('sermon-thumbnails', 'sermon-thumbnails', true);

-- Políticas de storage
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('blog-images', 'event-images', 'sermon-thumbnails'));

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 3. Configurar Edge Functions (Opcional)

```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { to, subject, html } = await req.json()
  
  // Lógica para enviar email
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { "Content-Type": "application/json" } },
  )
})
```

## 🌍 Configuración de Dominio

### 1. Configurar DNS

Para Vercel:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.19.61
```

Para Netlify:
```
Type: CNAME
Name: www
Value: tu-sitio.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

### 2. Configurar SSL

La mayoría de plataformas (Vercel, Netlify) configuran SSL automáticamente.

Para configuración manual:
- Usar Let's Encrypt
- Configurar certificados en el servidor
- Forzar HTTPS

### 3. Configurar Redirects

```javascript
// vercel.json
{
  "redirects": [
    {
      "source": "http://tu-dominio.com/(.*)",
      "destination": "https://tu-dominio.com/$1",
      "permanent": true
    }
  ]
}
```

## 📊 Monitoreo y Logs

### 1. Configurar Analytics

```typescript
// src/lib/analytics.ts
import { Analytics } from '@vercel/analytics/react';

export const AnalyticsProvider = ({ children }) => {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
};
```

### 2. Configurar Error Tracking

```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### 3. Health Checks

```typescript
// src/api/health.ts
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('count')
      .limit(1);
    
    return { status: 'healthy', database: !error };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
};
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Build Failures

```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Node
node --version  # Debe ser >= 16

# Verificar variables de entorno
echo $VITE_SUPABASE_URL
```

#### 2. Routing Issues (404 en refresh)

Asegúrate de configurar redirects para SPA:

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 3. Supabase Connection Issues

```typescript
// Verificar conexión
const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase connected:', !error);
  } catch (error) {
    console.error('Supabase error:', error);
  }
};
```

#### 4. Environment Variables Not Loading

```bash
# Verificar que las variables empiecen con VITE_
VITE_SUPABASE_URL=...  # ✅ Correcto
SUPABASE_URL=...       # ❌ Incorrecto

# Reiniciar servidor de desarrollo
npm run dev
```

### Logs y Debugging

```typescript
// Habilitar logs en producción
if (import.meta.env.VITE_DEBUG === 'true') {
  console.log('Debug mode enabled');
}

// Error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Enviar a servicio de logging
  }
}
```

### Performance Issues

```bash
# Analizar bundle
npm run build -- --analyze

# Verificar lighthouse score
npx lighthouse https://tu-dominio.com

# Optimizar imágenes
npm install -g imagemin-cli
imagemin src/assets/*.{jpg,png} --out-dir=src/assets/optimized
```

## 📋 Checklist Post-Despliegue

- [ ] Sitio accesible en producción
- [ ] SSL configurado correctamente
- [ ] Variables de entorno funcionando
- [ ] Base de datos conectada
- [ ] Funcionalidades en tiempo real activas
- [ ] Formularios de contacto funcionando
- [ ] SEO meta tags correctos
- [ ] Analytics configurado
- [ ] Error tracking activo
- [ ] Performance optimizado (Lighthouse > 90)
- [ ] Responsive design verificado
- [ ] Pruebas de usuario realizadas

---

Esta guía cubre los escenarios más comunes de despliegue. Para configuraciones específicas o problemas no cubiertos, consulta la documentación de cada plataforma o crea un issue en el repositorio.