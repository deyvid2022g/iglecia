/**
 * Script para migrar datos de localStorage a Supabase
 * 
 * Este script extrae los datos almacenados en localStorage y los migra a Supabase.
 * Para ejecutarlo, asegúrate de tener configuradas las variables de entorno correctamente.
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Función principal que ejecuta la migración
 */
async function migrateData() {
  try {
    console.log('Iniciando migración de datos a Supabase...');
    
    // Obtener datos de localStorage (esto debe ejecutarse en un navegador o simularse)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const sermons = JSON.parse(localStorage.getItem('sermons') || '[]');
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    
    // Migrar usuarios
    console.log(`Migrando ${users.length} usuarios...`);
    for (const user of users) {
      // Primero crear el usuario en auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password, // Nota: esto solo funcionará si las contraseñas están en texto plano
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
          avatar_url: user.avatarUrl || null
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
      const { error } = await supabase
        .from('events')
        .insert([
          {
            title: event.title,
            date: event.date,
            start_time: event.startTime,
            end_time: event.endTime,
            type: event.type,
            location: event.location,
            description: event.description,
            capacity: event.capacity,
            registrations: event.registrations || 0,
            image: event.image,
            host: event.host,
            requires_rsvp: event.requiresRSVP || false,
            created_at: event.createdAt || new Date().toISOString(),
            updated_at: event.updatedAt || new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error(`Error al migrar evento ${event.title}:`, error);
      } else {
        console.log(`Evento migrado con éxito: ${event.title}`);
      }
    }
    
    // Migrar prédicas
    console.log(`Migrando ${sermons.length} prédicas...`);
    for (const sermon of sermons) {
      const { error } = await supabase
        .from('sermons')
        .insert([
          {
            title: sermon.title,
            slug: sermon.slug || createSlug(sermon.title),
            speaker: sermon.speaker,
            date: sermon.date,
            description: sermon.description,
            tags: sermon.tags || [],
            video_url: sermon.videoUrl || null,
            thumbnail_url: sermon.thumbnailUrl || null,
            audio_url: sermon.audioUrl || null,
            scripture: sermon.scripture || null,
            series: sermon.series || null,
            view_count: sermon.viewCount || 0,
            download_count: sermon.downloadCount || 0,
            created_at: sermon.createdAt || new Date().toISOString(),
            updated_at: sermon.updatedAt || new Date().toISOString()
          }
        ]);
      
      if (error) {
        console.error(`Error al migrar prédica ${sermon.title}:`, error);
      } else {
        console.log(`Prédica migrada con éxito: ${sermon.title}`);
      }
    }
    
    // Migrar posts del blog
    console.log(`Migrando ${blogPosts.length} posts del blog...`);
    for (const post of blogPosts) {
      const { error } = await supabase
        .from('blog_posts')
        .insert([
          {
            title: post.title,
            slug: post.slug || createSlug(post.title),
            excerpt: post.excerpt || null,
            content: post.content,
            author: post.author,
            category: post.category || null,
            tags: post.tags || [],
            published_at: post.publishedAt || null,
            cover_image: post.coverImage || null,
            views: post.views || 0,
            featured: post.featured || false,
            created_at: post.createdAt || new Date().toISOString(),
            updated_at: post.updatedAt || new Date().toISOString()
          }
        ]);
      
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

// Ejecutar la migración
migrateData();