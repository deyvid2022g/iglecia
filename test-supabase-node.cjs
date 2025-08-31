// Script de prueba para Supabase usando Node.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ No encontrada');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ No encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para probar la conexión a Supabase
async function testSupabaseConnection() {
  console.log('🔄 Probando conexión a Supabase...');
  
  try {
    // 1. Probar conexión básica
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    
    // 2. Probar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Usuario actual:', user ? user.email : 'No autenticado');
    
    // 3. Probar consultas a las tablas principales
    const tables = [
      'profiles',
      'locations', 
      'events',
      'sermon_categories',
      'sermons',
      'blog_categories',
      'blog_posts',
      'ministries',
      'church_settings'
    ];
    
    console.log('\n📊 Probando acceso a tablas:');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Acceso correcto (${data.length} registros)`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Error inesperado - ${err.message}`);
      }
    }
    
    // 4. Probar Storage buckets
    console.log('\n📁 Probando Storage buckets:');
    const buckets = ['avatars', 'sermon-media', 'blog-images', 'ministry-resources'];
    
    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage.from(bucket).list('', {
          limit: 1
        });
        
        if (error) {
          console.log(`❌ Bucket '${bucket}': ${error.message}`);
        } else {
          console.log(`✅ Bucket '${bucket}': Acceso correcto`);
        }
      } catch (err) {
        console.log(`❌ Bucket '${bucket}': Error inesperado - ${err.message}`);
      }
    }
    
    console.log('\n🎉 Prueba de Supabase completada');
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    return false;
  }
}

// Función para probar inserción de datos de prueba
async function testDataInsertion() {
  console.log('\n🔄 Probando inserción de datos...');
  
  try {
    // Insertar un perfil de prueba
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        full_name: 'Usuario de Prueba',
        email: 'test@example.com',
        role: 'member'
      })
      .select()
      .single();
      
    if (profileError) {
      console.log('❌ Error insertando perfil:', profileError.message);
    } else {
      console.log('✅ Perfil insertado correctamente:', profile.id);
      
      // Limpiar datos de prueba
      await supabase.from('profiles').delete().eq('id', profile.id);
      console.log('🧹 Datos de prueba eliminados');
    }
    
  } catch (error) {
    console.error('❌ Error en prueba de inserción:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de Supabase\n');
  
  const connectionSuccess = await testSupabaseConnection();
  
  if (connectionSuccess) {
    await testDataInsertion();
  }
  
  console.log('\n✨ Pruebas completadas');
}

runTests().catch(console.error);