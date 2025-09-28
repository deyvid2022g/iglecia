import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Encontrada' : '❌ No encontrada');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Encontrada' : '❌ No encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSermonsTable() {
  console.log('\n🔍 VERIFICANDO TABLA SERMONS...\n');
  
  try {
    // 1. Verificar si la tabla existe y obtener su estructura
    console.log('📋 Verificando estructura de la tabla sermons...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('sermons')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error al acceder a la tabla sermons:', tableError.message);
      return;
    }

    console.log('✅ Tabla sermons existe y es accesible');

    // 2. Contar total de registros
    const { count: totalSermons, error: countError } = await supabase
      .from('sermons')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error al contar sermones:', countError.message);
    } else {
      console.log(`📊 Total de sermones en la tabla: ${totalSermons || 0}`);
    }

    // 3. Obtener algunos sermones de ejemplo
    const { data: sermons, error: sermonsError } = await supabase
      .from('sermons')
      .select(`
        id,
        title,
        speaker,
        sermon_date,
        is_published,
        view_count,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (sermonsError) {
      console.error('❌ Error al obtener sermones:', sermonsError.message);
    } else {
      console.log('\n📝 Sermones de ejemplo:');
      if (sermons && sermons.length > 0) {
        sermons.forEach((sermon, index) => {
          console.log(`${index + 1}. ${sermon.title || 'Sin título'}`);
          console.log(`   Predicador: ${sermon.speaker || 'No especificado'}`);
          console.log(`   Fecha: ${sermon.sermon_date || 'No especificada'}`);
          console.log(`   Publicado: ${sermon.is_published ? 'Sí' : 'No'}`);
          console.log(`   Vistas: ${sermon.view_count || 0}`);
          console.log('');
        });
      } else {
        console.log('📭 No hay sermones en la tabla');
      }
    }

    // 4. Verificar sermones publicados
    const { count: publishedCount, error: publishedError } = await supabase
      .from('sermons')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    if (publishedError) {
      console.error('❌ Error al contar sermones publicados:', publishedError.message);
    } else {
      console.log(`📢 Sermones publicados: ${publishedCount || 0}`);
    }

    // 5. Verificar categorías de sermones
    console.log('\n🏷️ Verificando categorías de sermones...');
    const { data: categories, error: categoriesError } = await supabase
      .from('sermon_categories')
      .select('id, name, is_active')
      .order('name');

    if (categoriesError) {
      console.error('❌ Error al obtener categorías:', categoriesError.message);
    } else {
      console.log(`📂 Total de categorías: ${categories?.length || 0}`);
      if (categories && categories.length > 0) {
        categories.forEach(cat => {
          console.log(`   - ${cat.name} (${cat.is_active ? 'Activa' : 'Inactiva'})`);
        });
      }
    }

    // 6. Verificar series de sermones
    console.log('\n📚 Verificando series de sermones...');
    const { data: series, error: seriesError } = await supabase
      .from('sermon_series')
      .select('id, name, is_active')
      .order('name');

    if (seriesError) {
      console.error('❌ Error al obtener series:', seriesError.message);
    } else {
      console.log(`📖 Total de series: ${series?.length || 0}`);
      if (series && series.length > 0) {
        series.forEach(s => {
          console.log(`   - ${s.name} (${s.is_active ? 'Activa' : 'Inactiva'})`);
        });
      }
    }

    // 7. Probar consulta específica del hook useSermons
    console.log('\n🔍 Probando consulta específica del hook useSermons...');
    const { data: hookData, error: hookError } = await supabase
      .from('sermons')
      .select(`
        *,
        sermon_categories (
          id,
          name,
          slug,
          color,
          icon
        ),
        sermon_series (
          id,
          name,
          slug,
          image_url
        )
      `)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .limit(3);

    if (hookError) {
      console.error('❌ Error en consulta del hook:', hookError.message);
      console.error('Detalles del error:', hookError);
    } else {
      console.log(`✅ Consulta del hook exitosa: ${hookData?.length || 0} sermones encontrados`);
      if (hookData && hookData.length > 0) {
        console.log('📋 Datos de ejemplo:');
        hookData.forEach((sermon, index) => {
          console.log(`${index + 1}. ${sermon.title}`);
          console.log(`   Categoría: ${sermon.sermon_categories?.name || 'Sin categoría'}`);
          console.log(`   Serie: ${sermon.sermon_series?.name || 'Sin serie'}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la verificación
checkSermonsTable()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error);
    process.exit(1);
  });