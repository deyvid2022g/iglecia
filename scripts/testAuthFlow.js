import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testAuthFlow() {
  console.log('🧪 Probando flujo de autenticación...');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    console.log('\n1. Intentando registro...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Usuario Test'
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ Error en registro:', signUpError.message);
      console.log('📋 Detalles del error:', JSON.stringify(signUpError, null, 2));
    } else {
      console.log('✅ Registro exitoso');
      console.log('👤 Usuario creado:', signUpData.user?.email);
      
      // Verificar si se creó el registro en la tabla users
      console.log('\n2. Verificando creación en tabla users...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signUpData.user?.id)
        .single();
      
      if (userError) {
        console.log('❌ Error al verificar usuario en tabla:', userError.message);
        console.log('📋 Detalles:', JSON.stringify(userError, null, 2));
      } else {
        console.log('✅ Usuario encontrado en tabla users:', userData);
      }
    }
    
    // Probar login con usuario existente
    console.log('\n3. Probando login con usuario existente...');
    const existingEmail = 'admin@iglesia.com'; // Email que sabemos que existe
    const existingPassword = 'admin123';
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: existingEmail,
      password: existingPassword
    });
    
    if (signInError) {
      console.log('❌ Error en login:', signInError.message);
      console.log('📋 Detalles del error:', JSON.stringify(signInError, null, 2));
    } else {
      console.log('✅ Login exitoso con usuario existente');
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
    console.log('📋 Stack:', error.stack);
  }
}

testAuthFlow().catch(console.error);