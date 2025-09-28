import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Variable global para almacenar el token de sesión
let sessionToken = null;

// Crear cliente Supabase con configuración personalizada para headers
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      get Authorization() {
        return sessionToken ? `Bearer ${sessionToken}` : undefined;
      }
    }
  }
});

// Función de autenticación personalizada
async function customSignIn(email, password) {
  try {
    console.log('🔐 Iniciando autenticación personalizada...');
    
    // 1. Buscar usuario en la tabla users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      throw new Error('Usuario no encontrado');
    }

    console.log('✅ Usuario encontrado:', user.email, 'Rol:', user.role);

    // 2. Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Contraseña incorrecta');
    }

    console.log('✅ Contraseña verificada');

    // 3. Crear sesión
    const newSessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        access_token: newSessionToken,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Error creando sesión:', sessionError);
      throw sessionError;
    }

    console.log('✅ Sesión creada exitosamente');

    // Almacenar el token globalmente para usarlo en las requests
    sessionToken = newSessionToken;

    return {
      user,
      session,
      access_token: newSessionToken
    };
  } catch (error) {
    console.error('❌ Error en autenticación personalizada:', error.message);
    throw error;
  }
}

// Función para probar inserción en sermon_categories
async function testSermonCategories() {
  console.log('\n📚 === PROBANDO SERMON_CATEGORIES ===');
  
  try {
    // Verificar datos existentes
    const { data: existing, error: fetchError } = await supabase
      .from('sermon_categories')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error obteniendo categorías existentes:', fetchError);
    } else {
      console.log(`📊 Categorías existentes: ${existing.length}`);
      if (existing.length > 0) {
        console.log('Ejemplo:', existing[0]);
      }
    }

    // Intentar insertar nueva categoría
    const testCategory = {
      name: 'Categoría de Prueba',
      slug: `categoria-prueba-${Date.now()}`,
      description: 'Categoría creada para pruebas',
      color: '#3B82F6',
      icon: 'book',
      display_order: 999,
      is_active: true
    };

    console.log('🔄 Intentando insertar categoría de prueba...');
    const { data: newCategory, error: insertError } = await supabase
      .from('sermon_categories')
      .insert(testCategory)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error insertando categoría:', insertError);
      return false;
    } else {
      console.log('✅ Categoría insertada exitosamente:', newCategory.name);
      
      // Limpiar - eliminar la categoría de prueba
      await supabase.from('sermon_categories').delete().eq('id', newCategory.id);
      console.log('🧹 Categoría de prueba eliminada');
      return true;
    }
  } catch (error) {
    console.error('❌ Error general en sermon_categories:', error);
    return false;
  }
}

// Función para probar inserción en events
async function testEvents() {
  console.log('\n🎉 === PROBANDO EVENTS ===');
  
  try {
    // Verificar datos existentes
    const { data: existing, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error obteniendo eventos existentes:', fetchError);
    } else {
      console.log(`📊 Eventos existentes: ${existing.length}`);
    }

    // Obtener una categoría de evento existente
    const { data: categories } = await supabase
      .from('event_categories')
      .select('id')
      .limit(1);

    const categoryId = categories && categories.length > 0 ? categories[0].id : null;

    // Intentar insertar nuevo evento
    const testEvent = {
      slug: `evento-prueba-${Date.now()}`,
      title: 'Evento de Prueba',
      description: 'Evento creado para pruebas',
      detailed_description: 'Descripción detallada del evento de prueba',
      event_date: new Date().toISOString().split('T')[0],
      start_time: '19:00:00',
      end_time: '21:00:00',
      location_name: 'Iglesia Principal',
      location_address: 'Dirección de prueba',
      category_id: categoryId,
      type: 'service',
      requires_rsvp: false,
      cost: 0,
      is_published: false,
      is_featured: false
    };

    console.log('🔄 Intentando insertar evento de prueba...');
    const { data: newEvent, error: insertError } = await supabase
      .from('events')
      .insert(testEvent)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error insertando evento:', insertError);
      return false;
    } else {
      console.log('✅ Evento insertado exitosamente:', newEvent.title);
      
      // Limpiar - eliminar el evento de prueba
      await supabase.from('events').delete().eq('id', newEvent.id);
      console.log('🧹 Evento de prueba eliminado');
      return true;
    }
  } catch (error) {
    console.error('❌ Error general en events:', error);
    return false;
  }
}

// Función para probar inserción en blog_categories
async function testBlogCategories() {
  console.log('\n📝 === PROBANDO BLOG_CATEGORIES ===');
  
  try {
    // Verificar si la tabla existe
    const { data: existing, error: fetchError } = await supabase
      .from('blog_categories')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error obteniendo categorías de blog:', fetchError);
      if (fetchError.message.includes('relation "public.blog_categories" does not exist')) {
        console.log('⚠️  La tabla blog_categories no existe en la base de datos');
        return false;
      }
    } else {
      console.log(`📊 Categorías de blog existentes: ${existing.length}`);
    }

    // Intentar insertar nueva categoría de blog
    const testBlogCategory = {
      name: 'Categoría Blog Prueba',
      slug: `blog-categoria-prueba-${Date.now()}`,
      description: 'Categoría de blog creada para pruebas',
      color: '#10B981',
      icon: 'edit',
      display_order: 999,
      is_active: true
    };

    console.log('🔄 Intentando insertar categoría de blog de prueba...');
    const { data: newBlogCategory, error: insertError } = await supabase
      .from('blog_categories')
      .insert(testBlogCategory)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error insertando categoría de blog:', insertError);
      return false;
    } else {
      console.log('✅ Categoría de blog insertada exitosamente:', newBlogCategory.name);
      
      // Limpiar - eliminar la categoría de prueba
      await supabase.from('blog_categories').delete().eq('id', newBlogCategory.id);
      console.log('🧹 Categoría de blog de prueba eliminada');
      return true;
    }
  } catch (error) {
    console.error('❌ Error general en blog_categories:', error);
    return false;
  }
}

// Función para probar inserción en blog_posts
async function testBlogPosts() {
  console.log('\n📰 === PROBANDO BLOG_POSTS ===');
  
  try {
    // Verificar si la tabla existe
    const { data: existing, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error obteniendo posts de blog:', fetchError);
      if (fetchError.message.includes('relation "public.blog_posts" does not exist')) {
        console.log('⚠️  La tabla blog_posts no existe en la base de datos');
        return false;
      }
    } else {
      console.log(`📊 Posts de blog existentes: ${existing.length}`);
    }

    // Obtener una categoría de blog existente
    const { data: categories } = await supabase
      .from('blog_categories')
      .select('id')
      .limit(1);

    const categoryId = categories && categories.length > 0 ? categories[0].id : null;

    // Obtener un usuario existente para el campo author
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    const authorId = users && users.length > 0 ? users[0].id : null;

    // Intentar insertar nuevo post de blog
    const testBlogPost = {
      slug: `post-prueba-${Date.now()}`,
      title: 'Post de Blog de Prueba',
      excerpt: 'Extracto del post de prueba',
      content: 'Contenido completo del post de blog de prueba',
      author: authorId,
      category_id: categoryId,
      is_published: false,
      is_featured: false,
      published_at: new Date().toISOString()
    };

    console.log('🔄 Intentando insertar post de blog de prueba...');
    const { data: newBlogPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert(testBlogPost)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error insertando post de blog:', insertError);
      return false;
    } else {
      console.log('✅ Post de blog insertado exitosamente:', newBlogPost.title);
      
      // Limpiar - eliminar el post de prueba
      await supabase.from('blog_posts').delete().eq('id', newBlogPost.id);
      console.log('🧹 Post de blog de prueba eliminado');
      return true;
    }
  } catch (error) {
    console.error('❌ Error general en blog_posts:', error);
    return false;
  }
}

// Función para probar inserción en sermons
async function testSermons() {
  console.log('\n🎤 === PROBANDO SERMONS ===');
  
  try {
    // Verificar datos existentes
    const { data: existing, error: fetchError } = await supabase
      .from('sermons')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error obteniendo sermones existentes:', fetchError);
    } else {
      console.log(`📊 Sermones existentes: ${existing.length}`);
    }

    // Obtener una categoría de sermón existente
    const { data: categories } = await supabase
      .from('sermon_categories')
      .select('id')
      .limit(1);

    const categoryId = categories && categories.length > 0 ? categories[0].id : null;

    // Intentar insertar nuevo sermón
    const testSermon = {
      slug: `sermon-prueba-${Date.now()}`,
      title: 'Sermón de Prueba',
      description: 'Sermón creado para pruebas',
      speaker: 'Pastor de Prueba',
      sermon_date: new Date().toISOString().split('T')[0],
      duration: '45:00',
      category_id: categoryId,
      is_published: false,
      is_featured: false
    };

    console.log('🔄 Intentando insertar sermón de prueba...');
    const { data: newSermon, error: insertError } = await supabase
      .from('sermons')
      .insert(testSermon)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error insertando sermón:', insertError);
      return false;
    } else {
      console.log('✅ Sermón insertado exitosamente:', newSermon.title);
      
      // Limpiar - eliminar el sermón de prueba
      await supabase.from('sermons').delete().eq('id', newSermon.id);
      console.log('🧹 Sermón de prueba eliminado');
      return true;
    }
  } catch (error) {
    console.error('❌ Error general en sermons:', error);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 === ANÁLISIS INTEGRAL DE TABLAS CON AUTENTICACIÓN PERSONALIZADA ===\n');

  try {
    // 1. Autenticación personalizada
    const authResult = await customSignIn('admin@lugarderefugio.com', 'admin123');
    const user = authResult.user;
    
    console.log(`\n👤 Usuario autenticado: ${user.full_name} (${user.role})`);

    // 2. Verificar contexto de autenticación actual
    console.log('\n🔍 === VERIFICANDO CONTEXTO DE AUTENTICACIÓN ===');
    
    const { data: currentUser, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser.user) {
      console.log('⚠️  No hay usuario autenticado con Supabase Auth (esperado con auth personalizada)');
    } else {
      console.log('✅ Usuario Supabase Auth:', currentUser.user.email);
    }

    // 3. Probar todas las tablas
    console.log('\n🧪 === INICIANDO PRUEBAS DE INSERCIÓN ===');
    
    const results = {
      sermon_categories: await testSermonCategories(),
      events: await testEvents(),
      blog_categories: await testBlogCategories(),
      blog_posts: await testBlogPosts(),
      sermons: await testSermons()
    };

    // 4. Resumen de resultados
    console.log('\n📊 === RESUMEN DE RESULTADOS ===');
    
    const successful = Object.entries(results).filter(([_, success]) => success);
    const failed = Object.entries(results).filter(([_, success]) => !success);

    console.log(`✅ Tablas que funcionan: ${successful.length}/${Object.keys(results).length}`);
    successful.forEach(([table, _]) => {
      console.log(`  ✅ ${table}`);
    });

    if (failed.length > 0) {
      console.log(`❌ Tablas con problemas: ${failed.length}/${Object.keys(results).length}`);
      failed.forEach(([table, _]) => {
        console.log(`  ❌ ${table}`);
      });
    }

    // 5. Análisis del problema
    console.log('\n🔍 === ANÁLISIS DEL PROBLEMA ===');
    
    if (failed.length > 0) {
      console.log('🚨 PROBLEMA IDENTIFICADO:');
      console.log('- Las políticas RLS están configuradas para requerir autenticación de Supabase Auth');
      console.log('- El sistema de autenticación personalizada no es reconocido por las políticas RLS');
      console.log('- Todas las tablas con RLS habilitado tienen el mismo problema');
      
      console.log('\n💡 SOLUCIONES POSIBLES:');
      console.log('1. Deshabilitar RLS temporalmente para pruebas');
      console.log('2. Modificar las políticas RLS para trabajar con autenticación personalizada');
      console.log('3. Crear funciones de base de datos que bypassen RLS para usuarios admin');
      console.log('4. Usar un usuario de servicio con permisos especiales');
    } else {
      console.log('🎉 ¡Todas las tablas funcionan correctamente!');
    }

  } catch (error) {
    console.error('💥 Error en el análisis:', error.message);
  }
}

// Ejecutar el análisis
main().catch(console.error);