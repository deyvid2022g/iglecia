const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseError() {
  console.log('🔍 Diagnosticando estructura de errores de Supabase...');
  
  try {
    // Intentar una operación que debería fallar por RLS
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: 'test-error-structure@example.com',
        name: 'Test Error Structure',
        role: 'user'
      });
    
    if (error) {
      console.log('\n📋 Estructura completa del error:');
      console.log(JSON.stringify(error, null, 2));
      
      console.log('\n🔍 Propiedades del error:');
      console.log('- error.code:', error.code);
      console.log('- error.message:', error.message);
      console.log('- error.details:', error.details);
      console.log('- error.hint:', error.hint);
      console.log('- error.status:', error.status);
      
      console.log('\n🔍 Todas las propiedades disponibles:');
      Object.keys(error).forEach(key => {
        console.log(`- ${key}:`, error[key]);
      });
    } else {
      console.log('⚠️ No se produjo error - esto es inesperado');
      console.log('Data:', data);
    }
  } catch (err) {
    console.log('\n❌ Error capturado en try/catch:');
    console.log('- err.message:', err.message);
    console.log('- err.code:', err.code);
    console.log('- err.status:', err.status);
    console.log('\n📋 Estructura completa del error capturado:');
    console.log(JSON.stringify(err, null, 2));
  }
}

diagnoseError().catch(console.error);