#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

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
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Por favor, ejecuta: npm run cli:setup');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función helper para crear interfaz readline
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Función helper para entrada interactiva
function question(rl, prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

// Función para mostrar el menú principal
function showMenu() {
  console.log('\n🎤 GESTIÓN DE PRÉDICAS - IGLESIA LUGAR DE REFUGIO');
  console.log('================================================');
  console.log('1. 📋 Listar prédicas');
  console.log('2. ➕ Subir nueva prédica');
  console.log('3. 🔍 Buscar prédica');
  console.log('4. 📊 Estadísticas');
  console.log('5. ❌ Salir');
  console.log('================================================');
}

// Función para listar prédicas
async function listarPredicas() {
  console.log('\n📋 LISTANDO PRÉDICAS...\n');
  
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
      .limit(20);

    if (error) {
      console.error('❌ Error al obtener prédicas:', error.message);
      return;
    }

    if (!sermons || sermons.length === 0) {
      console.log('📭 No hay prédicas en la base de datos.');
      return;
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
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

// Función para subir nueva prédica
async function uploadSermon() {
  console.log('\n➕ SUBIR NUEVA PRÉDICA');
  console.log('='.repeat(50));
  
  const rl = createReadlineInterface();
  
  try {
    // Obtener categorías disponibles
    const { data: categories, error: categoriesError } = await supabase
      .from('sermon_categories')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name');

    if (categoriesError) {
      console.error('❌ Error al obtener categorías:', categoriesError.message);
      return;
    }

    console.log('\n📂 Categorías disponibles:');
    if (categories && categories.length > 0) {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name}${cat.description ? ` - ${cat.description}` : ''}`);
      });
    } else {
      console.log('⚠️ No hay categorías disponibles. Creando categoría por defecto...');
      
      // Crear categoría por defecto si no existe
      const { data: newCategory, error: createError } = await supabase
        .from('sermon_categories')
        .insert([{
          name: 'General',
          description: 'Categoría general para prédicas',
          color: '#3B82F6',
          is_active: true
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error al crear categoría por defecto:', createError.message);
        return;
      }
      
      categories.push(newCategory);
      console.log('✅ Categoría "General" creada exitosamente.');
    }

    console.log('\n📝 Ingresa los datos de la nueva prédica:');
    
    const title = await question(rl, '🎯 Título: ');
    if (!title.trim()) {
      console.log('❌ El título es obligatorio.');
      rl.close();
      return;
    }

    const description = await question(rl, '📄 Descripción: ');
    if (!description.trim()) {
      console.log('❌ La descripción es obligatoria.');
      rl.close();
      return;
    }

    const speaker = await question(rl, '👤 Predicador: ');
    if (!speaker.trim()) {
      console.log('❌ El predicador es obligatorio.');
      rl.close();
      return;
    }

    const sermon_date = await question(rl, '📅 Fecha (YYYY-MM-DD): ');
    if (!sermon_date.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(sermon_date)) {
      console.log('❌ La fecha es obligatoria y debe tener formato YYYY-MM-DD.');
      rl.close();
      return;
    }

    const duration = await question(rl, '⏱️ Duración (MM:SS o HH:MM:SS, opcional): ');
    const video_url = await question(rl, '🎥 URL del video (opcional): ');
    const audio_url = await question(rl, '🎵 URL del audio (opcional): ');
    const thumbnail_url = await question(rl, '🖼️ URL de la miniatura (opcional): ');
    
    let category_id = null;
    if (categories.length > 0) {
      const categoryChoice = await question(rl, `📂 Selecciona categoría (1-${categories.length}, opcional): `);
      const categoryIndex = parseInt(categoryChoice) - 1;
      if (categoryIndex >= 0 && categoryIndex < categories.length) {
        category_id = categories[categoryIndex].id;
      }
    }

    const is_published = await question(rl, '📢 ¿Publicar inmediatamente? (s/n): ');
    const featured = await question(rl, '⭐ ¿Marcar como destacada? (s/n): ');

    // Generar slug único
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();

    // Preparar datos para insertar
    const sermonData = {
      slug,
      title: title.trim(),
      description: description.trim(),
      speaker: speaker.trim(),
      sermon_date,
      duration: duration.trim() || null,
      video_url: video_url.trim() || null,
      audio_url: audio_url.trim() || null,
      thumbnail_url: thumbnail_url.trim() || null,
      category_id,
      is_published: is_published.toLowerCase() === 's',
      featured: featured.toLowerCase() === 's',
      has_transcript: false,
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      tags: []
    };

    console.log('\n🔄 Subiendo prédica a la base de datos...');

    // Insertar en la base de datos
    const { data: newSermon, error: insertError } = await supabase
      .from('sermons')
      .insert([sermonData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error al subir la prédica:', insertError.message);
      rl.close();
      return;
    }

    console.log('\n✅ ¡Prédica subida exitosamente!');
    console.log('📋 Detalles:');
    console.log(`   ID: ${newSermon.id}`);
    console.log(`   Título: ${newSermon.title}`);
    console.log(`   Predicador: ${newSermon.speaker}`);
    console.log(`   Fecha: ${newSermon.sermon_date}`);
    console.log(`   Estado: ${newSermon.is_published ? 'Publicada' : 'Borrador'}`);
    console.log(`   Destacada: ${newSermon.featured ? 'Sí' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    rl.close();
  }
}

// Función para buscar prédicas
async function buscarPredica() {
  console.log('\n🔍 BUSCAR PRÉDICA\n');
  
  const rl = createReadlineInterface();
  const searchTerm = await question(rl, '🔎 Ingresa el término de búsqueda: ');
  rl.close();
  
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
      .order('sermon_date', { ascending: false });

    if (error) {
      console.error('❌ Error en la búsqueda:', error.message);
      return;
    }

    if (!sermons || sermons.length === 0) {
      console.log(`📭 No se encontraron prédicas con el término: "${searchTerm}"`);
      return;
    }

    console.log(`\n🎯 Resultados para: "${searchTerm}"\n`);
    
    sermons.forEach((sermon, index) => {
      const status = sermon.is_published ? '✅' : '⏳';
      const category = sermon.sermon_categories?.name || 'Sin categoría';
      const date = new Date(sermon.sermon_date).toLocaleDateString('es-ES');
      
      console.log(`${index + 1}. ${status} ${sermon.title}`);
      console.log(`   👤 ${sermon.speaker} | 📅 ${date} | 📂 ${category}`);
      console.log(`   📄 ${sermon.description.substring(0, 80)}...`);
      console.log('');
    });
    
    console.log(`📊 ${sermons.length} resultado(s) encontrado(s)`);
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

// Función para mostrar estadísticas
async function mostrarEstadisticas() {
  console.log('\n📊 ESTADÍSTICAS DE PRÉDICAS\n');
  
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
    }
    
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🔗 Conectando a la base de datos...');
  
  // Verificar conexión
  try {
    const { data, error } = await supabase.from('sermons').select('count').limit(1);
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      console.log('⚠️ Verifica las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
      process.exit(1);
    }
    console.log('✅ Conexión exitosa!\n');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
  
  const rl = createReadlineInterface();
  
  while (true) {
    showMenu();
    const choice = await question(rl, '\n🔢 Selecciona una opción: ');
    
    switch (choice) {
      case '1':
        await listarPredicas();
        break;
      case '2':
        await uploadSermon();
        break;
      case '3':
        await buscarPredica();
        break;
      case '4':
        await mostrarEstadisticas();
        break;
      case '5':
        console.log('\n👋 ¡Hasta luego!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Opción no válida. Por favor, selecciona una opción del 1 al 5.');
    }
    
    await question(rl, '\n⏸️ Presiona Enter para continuar...');
  }
}

// Ejecutar el programa
main().catch(console.error);