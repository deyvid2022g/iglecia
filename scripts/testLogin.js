/**
 * Script para probar login y diagnosticar el error 500
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno requeridas:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Crear cliente con clave anónima (como en la app)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log('🚀 Probando login con credenciales de prueba...');
  console.log('URL:', supabaseUrl);
  console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...');
  
  try {
    const testEmail = 'hola@hola.com';
    const testPassword = 'hola123';
    
    console.log(`\n🔐 Intentando login con ${testEmail}...`);
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.error('❌ Error en signInWithPassword:');
      console.error('   - Código:', loginError.status || 'N/A');
      console.error('   - Mensaje:', loginError.message);
      console.error('   - Detalles:', JSON.stringify(loginError, null, 2));
      return;
    }
    
    console.log('✅ Login exitoso en auth!');
    console.log(`   - Usuario ID: ${loginData.user.id}`);
    console.log(`   - Email: ${loginData.user.email}`);
    console.log(`   - Email confirmado: ${loginData.user.email_confirmed_at ? 'Sí' : 'No'}`);
    
    // Ahora probar obtener datos del usuario (aquí es donde falla)
    console.log('\n🔍 Obteniendo datos del usuario desde tabla users...');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loginData.user.id)
      .single();
    
    if (userError) {
      console.error('❌ Error obteniendo datos del usuario:');
      console.error('   - Código:', userError.code);
      console.error('   - Mensaje:', userError.message);
      console.error('   - Detalles:', userError.details);
      console.error('   - Hint:', userError.hint);
      
      // Verificar si es problema de RLS
      if (userError.code === 'PGRST301' || userError.message.includes('row-level security')) {
        console.log('\n🔒 Problema detectado: Row Level Security (RLS)');
        console.log('El usuario autenticado no puede acceder a su propio registro.');
      }
    } else if (userData) {
      console.log('✅ Datos del usuario obtenidos:');
      console.log(`   - ID: ${userData.id}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Nombre: ${userData.name}`);
      console.log(`   - Rol: ${userData.role}`);
    } else {
      console.log('⚠️  No se encontraron datos del usuario en la tabla users');
      console.log('El usuario existe en auth.users pero no en la tabla users.');
    }
    
    // Verificar políticas RLS
    console.log('\n🔍 Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'users' })
      .catch(() => ({ data: null, error: { message: 'Función get_policies_for_table no disponible' } }));
    
    if (policiesError) {
      console.log('⚠️  No se pudieron verificar las políticas RLS automáticamente');
    }
    
    // Cerrar sesión
    await supabase.auth.signOut();
    console.log('\n🚪 Sesión cerrada');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.error('Stack:', error.stack);
  }
}

testLogin();