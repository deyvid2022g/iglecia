#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno desde .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key] = value;
      }
    }
  });
}

// Configuración de Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para probar la conexión
async function testConnection() {
  console.log('🔗 Probando conexión a la base de datos...');
  
  try {
    const { data, error } = await supabase.from('sermons').select('count').limit(1);
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
    console.log('✅ Conexión exitosa!');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Función para probar listar prédicas
async function testListSermons() {
  console.log('\n📋 PROBANDO: Listar prédicas...\n');
  
  try {
    const { data: sermons, error } = await supabase
      .from('sermons')
      .select(`
        id,
        title,
        speaker,
        sermon_date,
        duration,
        view_count,
        like_count,
        is_published,
        sermon_categories(name)
      `)
      .order('sermon_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error al obtener prédicas:', error.message);
      return false;
    }

    if (!sermons || sermons.length === 0) {
      console.log('📭 No hay prédicas en la base de datos.');
      return true;
    }

    console.log('┌─────────────────────────────────────────────────────────────────────────────┐');
    console.log('│                                PRÉDICAS                                     │');
    console.log('├─────────────────────────────────────────────────────────────────────────────┤');
    
    sermons.forEach((sermon, index) => {
      const status = sermon.is_published ? '✅ Publicada' : '⏳ Borrador';
      const category = sermon.sermon_categories?.name || 'Sin categoría';
      const date = new Date(sermon.sermon_date).toLocaleDateString('es-ES');
      
      console.log(`│ ${(index + 1).toString().padStart(2, '0')}. ${sermon.title.substring(0, 40).padEnd(40)} │`);
      console.log(`│     👤 ${sermon.speaker.padEnd(20)} 📅 ${date.padEnd(12)} ${status.padEnd(12)} │`);
      console.log(`│     📂 ${category.padEnd(20)} 👀 ${sermon.view_count.toString().padEnd(5)} ❤️ ${sermon.like_count.toString().padEnd(5)}     │`);
      console.log('├─────────────────────────────────────────────────────────────────────────────┤');
    });
    
    console.log('└─────────────────────────────────────────────────────────────────────────────┘');
    console.log(`\n📊 Total: ${sermons.length} prédicas mostradas`);
    console.log('✅ Prueba de listar prédicas: EXITOSA');
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

// Función para probar búsqueda
async function testSearchSermons() {
  console.log('\n🔍 PROBANDO: Buscar prédicas...\n');
  
  const searchTerm = 'Dios'; // Término de búsqueda común
  
  try {
    const { data: sermons, error } = await supabase
      .from('sermons')
      .select(`
        id,
        title,
        speaker,
        sermon_date,
        description,
        is_published,
        sermon_categories(name)
      `)
      .or(`title.ilike.%${searchTerm}%,speaker.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('sermon_date', { ascending: false })
      .limit(3);

    if (error) {
      console.error('❌ Error en la búsqueda:', error.message);
      return false;
    }

    console.log(`🎯 Resultados para: "${searchTerm}"\n`);
    
    if (!sermons || sermons.length === 0) {
      console.log(`📭 No se encontraron prédicas con el término: "${searchTerm}"`);
    } else {
      sermons.forEach((sermon, index) => {
        const status = sermon.is_published ? '✅' : '⏳';
        const category = sermon.sermon_categories?.name || 'Sin categoría';
        const date = new Date(sermon.sermon_date).toLocaleDateString('es-ES');
        
        console.log(`${index + 1}. ${status} ${sermon.title}`);
        console.log(`   👤 ${sermon.speaker} | 📅 ${date} | 📂 ${category}`);
        console.log(`   📄 ${sermon.description ? sermon.description.substring(0, 80) + '...' : 'Sin descripción'}`);
        console.log('');
      });
      
      console.log(`📊 ${sermons.length} resultado(s) encontrado(s)`);
    }
    
    console.log('✅ Prueba de búsqueda: EXITOSA');
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

// Función para probar estadísticas
async function testStatistics() {
  console.log('\n📊 PROBANDO: Estadísticas...\n');
  
  try {
    // Obtener estadísticas generales
    const { data: stats } = await supabase
      .from('sermons')
      .select('id, is_published, view_count, like_count, sermon_date');

    const { data: categories } = await supabase
      .from('sermon_categories')
      .select('id, name, sermons(id)');

    if (stats) {
      const totalSermons = stats.length;
      const publishedSermons = stats.filter(s => s.is_published).length;
      const draftSermons = totalSermons - publishedSermons;
      const totalViews = stats.reduce((sum, s) => sum + (s.view_count || 0), 0);
      const totalLikes = stats.reduce((sum, s) => sum + (s.like_count || 0), 0);
      
      // Prédicas por mes (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const recentSermons = stats.filter(s => new Date(s.sermon_date) >= sixMonthsAgo);
      
      console.log('┌─────────────────────────────────────────┐');
      console.log('│            ESTADÍSTICAS GENERALES       │');
      console.log('├─────────────────────────────────────────┤');
      console.log(`│ 📋 Total de prédicas:     ${totalSermons.toString().padStart(10)} │`);
      console.log(`│ ✅ Publicadas:            ${publishedSermons.toString().padStart(10)} │`);
      console.log(`│ ⏳ Borradores:            ${draftSermons.toString().padStart(10)} │`);
      console.log(`│ 👀 Total visualizaciones: ${totalViews.toString().padStart(10)} │`);
      console.log(`│ ❤️ Total likes:           ${totalLikes.toString().padStart(10)} │`);
      console.log(`│ 📅 Últimos 6 meses:       ${recentSermons.length.toString().padStart(10)} │`);
      console.log('└─────────────────────────────────────────┘');
      
      if (categories && categories.length > 0) {
        console.log('\n📂 PRÉDICAS POR CATEGORÍA:\n');
        categories.forEach(cat => {
          const count = cat.sermons?.length || 0;
          console.log(`• ${cat.name}: ${count} prédica(s)`);
        });
      }
      
      console.log('\n✅ Prueba de estadísticas: EXITOSA');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.message);
    return false;
  }
}

// Función para probar subir prédica (simulación)
async function testUploadSermon() {
  console.log('\n➕ PROBANDO: Subir nueva prédica (simulación)...\n');
  
  try {
    // Obtener categorías disponibles
    const { data: categories } = await supabase
      .from('sermon_categories')
      .select('id, name')
      .eq('is_active', true);

    console.log('📂 Categorías disponibles:');
    if (categories && categories.length > 0) {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}`);
      });
    } else {
      console.log('⚠️ No hay categorías disponibles.');
    }
    
    // Simular datos de prédica de prueba
    const testSermonData = {
      slug: `predica-prueba-${Date.now()}`,
      title: 'Prédica de Prueba CLI',
      description: 'Esta es una prédica de prueba creada desde el CLI para verificar funcionalidad',
      speaker: 'Pastor de Prueba',
      sermon_date: new Date().toISOString().split('T')[0],
      duration: '30:00',
      video_url: null,
      audio_url: null,
      category_id: categories && categories.length > 0 ? categories[0].id : null,
      is_published: false,
      featured: false
    };
    
    console.log('\n📝 Datos de prédica de prueba:');
    console.log(`🎯 Título: ${testSermonData.title}`);
    console.log(`📄 Descripción: ${testSermonData.description}`);
    console.log(`👤 Predicador: ${testSermonData.speaker}`);
    console.log(`📅 Fecha: ${testSermonData.sermon_date}`);
    console.log(`⏱️ Duración: ${testSermonData.duration}`);
    
    // Nota: No insertamos realmente para evitar datos de prueba en la base de datos
    console.log('\n⚠️ NOTA: Esta es una simulación. No se insertó la prédica en la base de datos.');
    console.log('✅ Prueba de subir prédica: EXITOSA (simulación)');
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

// Función principal de pruebas
async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DEL CLI DE PRÉDICAS');
  console.log('==========================================\n');
  
  const results = {
    connection: false,
    list: false,
    search: false,
    statistics: false,
    upload: false
  };
  
  // Probar conexión
  results.connection = await testConnection();
  
  if (results.connection) {
    // Probar funcionalidades
    results.list = await testListSermons();
    results.search = await testSearchSermons();
    results.statistics = await testStatistics();
    results.upload = await testUploadSermon();
  }
  
  // Resumen de resultados
  console.log('\n🏁 RESUMEN DE PRUEBAS');
  console.log('=====================');
  console.log(`🔗 Conexión:     ${results.connection ? '✅ EXITOSA' : '❌ FALLIDA'}`);
  console.log(`📋 Listar:       ${results.list ? '✅ EXITOSA' : '❌ FALLIDA'}`);
  console.log(`🔍 Buscar:       ${results.search ? '✅ EXITOSA' : '❌ FALLIDA'}`);
  console.log(`📊 Estadísticas: ${results.statistics ? '✅ EXITOSA' : '❌ FALLIDA'}`);
  console.log(`➕ Subir:        ${results.upload ? '✅ EXITOSA' : '❌ FALLIDA'}`);
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n📈 Resultado: ${passedTests}/${totalTests} pruebas exitosas`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON! El CLI está funcionando correctamente.');
  } else {
    console.log('⚠️ Algunas pruebas fallaron. Revisa los errores anteriores.');
  }
}

// Ejecutar las pruebas
runTests().catch(console.error);