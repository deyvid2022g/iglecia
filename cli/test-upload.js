import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: './cli/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUploadSermon() {
  console.log('🧪 PRUEBA DE SUBIDA DE PRÉDICA');
  console.log('='.repeat(50));
  
  try {
    // Verificar conexión
    console.log('🔗 Verificando conexión...');
    const { data: testData, error: testError } = await supabase.from('sermons').select('count').limit(1);
    if (testError) throw testError;
    console.log('✅ Conexión exitosa!');

    // Crear usuario temporal para pruebas
    console.log('👤 Creando usuario temporal para pruebas...');
    const tempEmail = `test-${Date.now()}@example.com`;
    const tempPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password: tempPassword,
      options: {
        data: {
          full_name: 'Usuario de Prueba CLI',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.log('⚠️ Error al crear usuario, intentando con usuario existente...');
      // Intentar autenticarse con credenciales de prueba
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'admin123'
      });
      
      if (signInError) {
        console.log('⚠️ No se pudo autenticar, continuando sin autenticación...');
      } else {
        console.log('✅ Autenticado con usuario existente');
      }
    } else {
      console.log('✅ Usuario temporal creado y autenticado');
    }

    // Verificar categorías existentes
    console.log('\n📂 Verificando categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('sermon_categories')
      .select('*')
      .eq('is_active', true);

    let categoryId = null; // Sin categoría por defecto
  
  if (categoriesError) {
    console.log('⚠️ No se pudieron obtener categorías, continuando sin categoría');
  } else if (categories && categories.length > 0) {
    categoryId = categories[0].id;
    console.log('✅ Usando categoría existente:', categories[0].name);
  } else {
    console.log('⚠️ No hay categorías disponibles, continuando sin categoría');
  }

    // Datos de prueba para la prédica
    const sermonData = {
      title: 'Prédica de Prueba - ' + new Date().toISOString().split('T')[0],
      description: 'Esta es una prédica de prueba creada automáticamente para verificar la funcionalidad del sistema.',
      speaker: 'Pastor de Prueba',
      sermon_date: '2024-01-15',
      duration: '45:30',
      video_url: 'https://youtube.com/watch?v=ejemplo',
      audio_url: 'https://soundcloud.com/ejemplo',
      thumbnail_url: 'https://example.com/thumbnail.jpg',
      category_id: categoryId,
      is_published: true,
      is_featured: false,
      created_by: null
    };

    // Generar slug único
    const baseSlug = sermonData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    sermonData.slug = baseSlug + '-' + Date.now();

    console.log('\n📝 Insertando prédica de prueba...');
    console.log('📋 Datos:');
    console.log(`   🎯 Título: ${sermonData.title}`);
    console.log(`   👤 Predicador: ${sermonData.speaker}`);
    console.log(`   📅 Fecha: ${sermonData.sermon_date}`);
    console.log(`   🔗 Slug: ${sermonData.slug}`);

    // Insertar en la base de datos
    const { data: newSermon, error: insertError } = await supabase
      .from('sermons')
      .insert([sermonData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error al insertar:', insertError);
      throw insertError;
    }

    console.log('\n🎉 ¡PRÉDICA SUBIDA EXITOSAMENTE!');
    console.log('='.repeat(50));
    console.log(`📊 ID: ${newSermon.id}`);
    console.log(`🎯 Título: ${newSermon.title}`);
    console.log(`🔗 Slug: ${newSermon.slug}`);
    console.log(`👤 Predicador: ${newSermon.speaker}`);
    console.log(`📅 Fecha: ${newSermon.sermon_date}`);
    console.log(`📢 Publicado: ${newSermon.is_published ? 'Sí' : 'No'}`);
    console.log(`⭐ Destacado: ${newSermon.is_featured ? 'Sí' : 'No'}`);
    console.log(`🕒 Creado: ${new Date(newSermon.created_at).toLocaleString()}`);

    // Verificar que se puede recuperar
    console.log('\n🔍 Verificando que se puede recuperar...');
    const { data: retrievedSermon, error: retrieveError } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', newSermon.id)
      .single();

    if (retrieveError) throw retrieveError;
    
    console.log('✅ Prédica recuperada exitosamente');
    console.log(`📋 Título recuperado: ${retrievedSermon.title}`);

    // Mostrar estadísticas actualizadas
    console.log('\n📊 ESTADÍSTICAS ACTUALIZADAS:');
    const { data: stats, error: statsError } = await supabase
      .from('sermons')
      .select('id, is_published, is_featured');
    
    if (statsError) throw statsError;
    
    const totalSermons = stats.length;
    const publishedSermons = stats.filter(s => s.is_published).length;
    const featuredSermons = stats.filter(s => s.is_featured).length;
    
    console.log(`📈 Total de prédicas: ${totalSermons}`);
    console.log(`📢 Prédicas publicadas: ${publishedSermons}`);
    console.log(`⭐ Prédicas destacadas: ${featuredSermons}`);

    console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
    if (error.details) {
      console.error('📋 Detalles:', error.details);
    }
    if (error.hint) {
      console.error('💡 Sugerencia:', error.hint);
    }
    process.exit(1);
  }
}

// Ejecutar la prueba
testUploadSermon();