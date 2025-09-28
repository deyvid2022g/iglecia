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

async function testQuickSermons() {
  console.log('🔍 Probando conexión rápida con sermones...\n');
  
  try {
    // Prueba básica de conexión
    const { data: sermons, error } = await supabase
      .from('sermons')
      .select('id, title, speaker, sermon_date, is_published')
      .eq('is_published', true)
      .order('sermon_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error en consulta:', error.message);
      return;
    }

    console.log('✅ Conexión exitosa!');
    console.log(`📊 Sermones encontrados: ${sermons?.length || 0}`);
    
    if (sermons && sermons.length > 0) {
      console.log('\n📋 Últimos sermones:');
      sermons.forEach((sermon, index) => {
        console.log(`${index + 1}. ${sermon.title} - ${sermon.speaker}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

testQuickSermons();