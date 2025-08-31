import { supabase } from './lib/supabase';

// Función para probar la conexión a Supabase
export async function testSupabaseConnection() {
  console.log('🔄 Probando conexión a Supabase...');
  
  try {
    // 1. Probar conexión básica
    const { data: _, error } = await supabase.from('profiles').select('count').limit(1);
    
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
        const { data: _, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: Acceso correcto`);
        }
      } catch (_) {
        console.log(`❌ ${table}: Error inesperado`);
      }
    }
    
    // 4. Probar Storage buckets
    console.log('\n📁 Probando Storage buckets:');
    const buckets = ['avatars', 'sermon-media', 'blog-images', 'ministry-resources'];
    
    for (const bucket of buckets) {
      try {
        const { data: _, error } = await supabase.storage.from(bucket).list('', {
          limit: 1
        });
        
        if (error) {
          console.log(`❌ Bucket '${bucket}': ${error.message}`);
        } else {
          console.log(`✅ Bucket '${bucket}': Acceso correcto`);
        }
      } catch (_) {
        console.log(`❌ Bucket '${bucket}': Error inesperado`);
      }
    }
    
    console.log('\n🎉 Prueba de Supabase completada');
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return false;
  }
}

// Función para probar inserción de datos de prueba
export async function testDataInsertion() {
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
    console.error('❌ Error en prueba de inserción:', error);
  }
}

// Ejecutar pruebas si se ejecuta directamente
if (import.meta.env.DEV) {
  // Solo ejecutar en desarrollo
  testSupabaseConnection().then(() => {
    testDataInsertion();
  });
}