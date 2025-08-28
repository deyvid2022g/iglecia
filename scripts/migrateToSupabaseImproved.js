/**
 * Script mejorado para migrar datos a Supabase
 * 
 * Este script lee datos de archivos JSON exportados y los migra a Supabase.
 * Para ejecutarlo, asegúrate de tener configuradas las variables de entorno correctamente.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio donde se almacenan los datos exportados
const dataDir = path.join(__dirname, '../data');

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Función para verificar si un directorio existe, y crearlo si no
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directorio creado: ${dirPath}`);
  }
}

/**
 * Función para cargar datos desde archivos JSON
 */
function loadDataFromFiles() {
  ensureDirectoryExists(dataDir);
  
  const dataFiles = {
    users: path.join(dataDir, 'users.json'),
    events: path.join(dataDir, 'events.json'),
    sermons: path.join(dataDir, 'sermons.json'),
    blogPosts: path.join(dataDir, 'blogPosts.json')
  };
  
  const data = {};
  
  // Cargar cada archivo si existe, o crear un array vacío
  Object.entries(dataFiles).forEach(([key, filePath]) => {
    try {
      if (fs.existsSync(filePath)) {
        data[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`Datos cargados desde ${filePath}: ${data[key].length} registros`);
      } else {
        data[key] = [];
        console.log(`Archivo no encontrado: ${filePath}. Se utilizará un array vacío.`);
      }
    } catch (error) {
      console.error(`Error al cargar ${filePath}:`, error.message);
      data[key] = [];
    }
  });
  
  return data;
}

/**
 * Función para verificar si un registro ya existe en Supabase
 */
async function recordExists(table, field, value) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq(field, value)
    .limit(1);
  
  if (error) {
    console.error(`Error al verificar existencia en ${table}:`, error);
    return false;
  }
  
  return data && data.length > 0;
}

/**
 * Función principal que ejecuta la migración
 */
async function migrateData() {
  try {
    console.log('Iniciando migración de datos a Supabase...');
    
    // Cargar datos desde archivos
    const { users, events, sermons, blogPosts } = loadDataFromFiles();
    
    // Migrar usuarios
    console.log(`Migrando ${users.length} usuarios...`);
    for (const user of users) {
      // Verificar si el usuario ya existe
      const userExists = await recordExists('users', 'email', user.email);
      if (userExists) {
        console.log(`Usuario ya existe: ${user.email}. Omitiendo...`);
        continue;
      }
      
      // Primero crear el usuario en auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password || 'ChangeMe123!', // Contraseña temporal si no hay una disponible
        email_confirm: true,
        user_metadata: {
          name: user.name
        }
      });
      
      if (authError) {
        console.error(`Error al crear usuario de autenticación ${user.email}:`, authError);
        continue;
      }
      
      // Luego actualizar la información adicional en la tabla users
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: user.name,
          phone: user.phone || null,
          role: user.role || 'member',
          avatar_url: user.avatarUrl || user.avatar_url || null
        })
        .eq('id', authUser.id);
      
      if (userError) {
        console.error(`Error al actualizar información de usuario ${user.email}:`, userError);
      } else {
        console.log(`Usuario migrado con éxito: ${user.email}`);
      }
    }
    
    // Migrar eventos
    console.log(`Migrando ${events.length} eventos...`);
    for (const event of events) {
      // Verificar si el evento ya existe
      const eventExists = await recordExists('events', 'title', event.title);
      if (eventExists) {
        console.log(`Evento ya existe: ${event.title}. Omitiendo...`);
        continue;
      }
      
      const { error } = await supabase
        .from('events')
        .insert([{
          title: event.title,
          date: event.date,
          start_time: event.startTime || event.start_time,
          end_time: event.endTime || event.end_time,
          type: event.type,
          location: event.location,
          description: event.description,
          capacity: event.capacity,
          registrations: event.registrations || 0,
          image: event.image,
          host: event.host,
          requires_rsvp: event.requiresRSVP || event.requires_rsvp || false,
          created_at: event.createdAt || event.created_at || new Date().toISOString(),
          updated_at: event.updatedAt || event.updated_at || new Date().toISOString()
        }]);
      
      if (error) {
        console.error(`Error al migrar evento ${event.title}:`, error);
      } else {
        console.log(`Evento migrado con éxito: ${event.title}`);
      }
    }
    
    // Migrar prédicas
    console.log(`Migrando ${sermons.length} prédicas...`);
    for (const sermon of sermons) {
      // Verificar si la prédica ya existe
      const slug = sermon.slug || createSlug(sermon.title);
      const sermonExists = await recordExists('sermons', 'slug', slug);
      if (sermonExists) {
        console.log(`Prédica ya existe: ${sermon.title}. Omitiendo...`);
        continue;
      }
      
      const { error } = await supabase
        .from('sermons')
        .insert([{
          title: sermon.title,
          slug: slug,
          speaker: sermon.speaker,
          date: sermon.date,
          description: sermon.description,
          tags: sermon.tags || [],
          video_url: sermon.videoUrl || sermon.video_url || null,
          thumbnail_url: sermon.thumbnailUrl || sermon.thumbnail_url || sermon.thumbnail || null,
          audio_url: sermon.audioUrl || sermon.audio_url || null,
          scripture: sermon.scripture || null,
          series: sermon.series || null,
          view_count: sermon.viewCount || sermon.view_count || 0,
          download_count: sermon.downloadCount || sermon.download_count || 0,
          created_at: sermon.createdAt || sermon.created_at || new Date().toISOString(),
          updated_at: sermon.updatedAt || sermon.updated_at || new Date().toISOString()
        }]);
      
      if (error) {
        console.error(`Error al migrar prédica ${sermon.title}:`, error);
      } else {
        console.log(`Prédica migrada con éxito: ${sermon.title}`);
      }
    }
    
    // Migrar posts del blog
    console.log(`Migrando ${blogPosts.length} posts del blog...`);
    for (const post of blogPosts) {
      // Verificar si el post ya existe
      const slug = post.slug || createSlug(post.title);
      const postExists = await recordExists('blog_posts', 'slug', slug);
      if (postExists) {
        console.log(`Post ya existe: ${post.title}. Omitiendo...`);
        continue;
      }
      
      const { error } = await supabase
        .from('blog_posts')
        .insert([{
          title: post.title,
          slug: slug,
          excerpt: post.excerpt || null,
          content: post.content,
          author: post.author,
          category: post.category || null,
          tags: post.tags || [],
          published_at: post.publishedAt || post.published_at || null,
          cover_image: post.coverImage || post.cover_image || post.featuredImage || null,
          views: post.views || 0,
          featured: post.featured || false,
          created_at: post.createdAt || post.created_at || new Date().toISOString(),
          updated_at: post.updatedAt || post.updated_at || new Date().toISOString()
        }]);
      
      if (error) {
        console.error(`Error al migrar post ${post.title}:`, error);
      } else {
        console.log(`Post migrado con éxito: ${post.title}`);
      }
    }
    
    console.log('Migración completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

/**
 * Crea un slug a partir de un título
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Función para exportar datos de localStorage a archivos JSON
 * Esta función debe ejecutarse en un navegador
 */
function exportDataToFiles() {
  console.log('Esta función debe ejecutarse en un navegador para exportar datos de localStorage.');
  console.log('Ejemplo de código para ejecutar en la consola del navegador:');
  console.log(`
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
  `);
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Uso: node migrateToSupabaseImproved.js [opciones]

Opciones:
  --export   Muestra instrucciones para exportar datos desde el navegador
  --migrate  Ejecuta la migración de datos a Supabase
  --help, -h Muestra esta ayuda

Ejemplo:
  node migrateToSupabaseImproved.js --migrate
`);
} else if (args.includes('--export')) {
  exportDataToFiles();
} else if (args.includes('--migrate')) {
  migrateData();
} else {
  console.log('No se especificó ninguna acción. Use --help para ver las opciones disponibles.');
}