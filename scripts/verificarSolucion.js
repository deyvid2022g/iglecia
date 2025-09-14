import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Crear cliente de Supabase usando las variables de entorno
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Generar un email único para las pruebas
const testEmail = `test_${Math.floor(Math.random() * 10000)}@gmail.com`;
const testPassword = 'TestPassword123!';

async function verificarSolucion() {
  console.log('🔍 VERIFICACIÓN DE SOLUCIÓN');
  console.log('=========================');
  console.log(`Email de prueba: ${testEmail}`);
  
  try {
    // 1. Registrar un nuevo usuario
    console.log('\n1. Registrando nuevo usuario...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Usuario de Prueba'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Error en registro:', signUpError.message);
      console.error('📋 Detalles:', JSON.stringify(signUpError, null, 2));
      return;
    }
    
    console.log('✅ Registro exitoso');
    console.log(`📧 Usuario: ${signUpData.user?.email}`);
    console.log(`🆔 ID: ${signUpData.user?.id}`);
    
    // 2. Verificar creación en tabla users
    console.log('\n2. Verificando creación en tabla users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', signUpData.user?.id);
    
    if (userError) {
      console.error('❌ Error al verificar usuario en tabla users:', userError.message);
      console.error('📋 Detalles:', JSON.stringify(userError, null, 2));
    } else if (userData && userData.length === 0) {
      console.log('⚠️ El usuario NO fue creado en la tabla users');
      console.log('📌 El trigger no está funcionando correctamente');
    } else {
      console.log('✅ Usuario creado correctamente en tabla users');
      console.log('📋 Datos del usuario:');
      console.log(JSON.stringify(userData[0], null, 2));
      console.log('\n🎉 ¡LA SOLUCIÓN HA FUNCIONADO!');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

// Ejecutar la verificación
verificarSolucion().catch(console.error);