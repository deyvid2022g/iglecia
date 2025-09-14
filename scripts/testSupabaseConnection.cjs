// Usar require para compatibilidad con Node.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar cliente de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Probando conexión a Supabase...');
  console.log('🌐 URL:', supabaseUrl);
  console.log('🔑 Key configurada:', supabaseAnonKey ? 'Sí' : 'No');
  
  try {
    // Probar una consulta simple con timeout
    console.log('📊 Ejecutando consulta de prueba...');
    
    const queryPromise = supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout después de 10 segundos')), 10000)
    );
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Error en la consulta:', error);
      console.error('Detalles del error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }
    
    console.log('✅ Consulta exitosa');
    console.log('📋 Respuesta:', data);
    
    // Probar inserción
    console.log('\n📝 Probando inserción...');
    const testUser = {
      email: 'test-connection@example.com',
      name: 'Test User',
      role: 'user'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (insertError) {
      console.error('❌ Error en inserción:', insertError);
      console.error('Detalles del error:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      });
      return;
    }
    
    console.log('✅ Inserción exitosa');
    console.log('📋 Usuario creado:', insertData);
    
    // Limpiar el usuario de prueba
    if (insertData && insertData[0]) {
      await supabase
        .from('users')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Usuario de prueba eliminado');
    }
    
  } catch (error) {
    console.error('💥 Error inesperado:', error);
    console.error('Stack trace:', error.stack);
  }
}

testConnection();