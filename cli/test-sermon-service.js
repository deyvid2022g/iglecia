import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSermonService() {
  console.log('🔍 Probando el servicio de sermones...\n');

  try {
    // 1. Probar consulta básica de sermones
    console.log('1. Probando consulta básica de sermones:');
    const { data: sermons, error: sermonsError } = await supabase
      .from('sermons')
      .select('*')
      .eq('is_published', true)
      .order('sermon_date', { ascending: false });

    if (sermonsError) {
      console.error('❌ Error en consulta de sermones:', sermonsError);
    } else {
      console.log(`✅ Sermones encontrados: ${sermons?.length || 0}`);
      if (sermons && sermons.length > 0) {
        console.log('   Primer sermón:', sermons[0].title);
      }
    }

    // 2. Probar consulta con relaciones (como en el servicio)
    console.log('\n2. Probando consulta con relaciones:');
    const { data: sermonsWithRelations, error: relationsError } = await supabase
      .from('sermons')
      .select(`
        *,
        sermon_categories(id, name, slug),
        sermon_series(id, name, slug)
      `)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .limit(10);

    if (relationsError) {
      console.error('❌ Error en consulta con relaciones:', relationsError);
    } else {
      console.log(`✅ Sermones con relaciones: ${sermonsWithRelations?.length || 0}`);
      if (sermonsWithRelations && sermonsWithRelations.length > 0) {
        console.log('   Primer sermón con relaciones:', sermonsWithRelations[0].title);
        console.log('   Categoría:', sermonsWithRelations[0].sermon_categories?.name || 'Sin categoría');
      }
    }

    // 3. Probar consulta de categorías
    console.log('\n3. Probando consulta de categorías:');
    const { data: categories, error: categoriesError } = await supabase
      .from('sermon_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (categoriesError) {
      console.error('❌ Error en consulta de categorías:', categoriesError);
    } else {
      console.log(`✅ Categorías encontradas: ${categories?.length || 0}`);
      if (categories && categories.length > 0) {
        console.log('   Categorías:', categories.map(c => c.name).join(', '));
      }
    }

    // 4. Probar consulta de series
    console.log('\n4. Probando consulta de series:');
    const { data: series, error: seriesError } = await supabase
      .from('sermon_series')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (seriesError) {
      console.error('❌ Error en consulta de series:', seriesError);
    } else {
      console.log(`✅ Series encontradas: ${series?.length || 0}`);
      if (series && series.length > 0) {
        console.log('   Series:', series.map(s => s.title).join(', '));
      }
    }

    // 5. Probar consulta de predicadores únicos
    console.log('\n5. Probando consulta de predicadores únicos:');
    const { data: speakers, error: speakersError } = await supabase
      .from('sermons')
      .select('speaker')
      .eq('is_published', true)
      .not('speaker', 'is', null);

    if (speakersError) {
      console.error('❌ Error en consulta de predicadores:', speakersError);
    } else {
      const uniqueSpeakers = [...new Set(speakers?.map(s => s.speaker) || [])];
      console.log(`✅ Predicadores únicos: ${uniqueSpeakers.length}`);
      if (uniqueSpeakers.length > 0) {
        console.log('   Predicadores:', uniqueSpeakers.join(', '));
      }
    }

    // 6. Verificar estructura de tabla
    console.log('\n6. Verificando estructura de tabla sermons:');
    const { data: tableInfo, error: tableError } = await supabase
      .from('sermons')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error al verificar estructura:', tableError);
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Estructura de tabla verificada');
      console.log('   Campos disponibles:', Object.keys(tableInfo[0]).join(', '));
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testSermonService();