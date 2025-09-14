import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Crear cliente de Supabase usando las variables de entorno
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// ID del último usuario creado (reemplazar con el ID real del último test)
const userId = 'e62bf002-fde5-4ca3-8597-c7488e088065'; // Reemplazar con el ID del último usuario creado
const userEmail = 'test_193@gmail.com'; // Reemplazar con el email del último usuario creado

async function insertarManual() {
  console.log('🔧 INSERCIÓN MANUAL DE USUARIO');
  console.log('============================');
  console.log(`ID de usuario: ${userId}`);
  console.log(`Email de usuario: ${userEmail}`);
  
  try {
    // 1. Verificar si el usuario ya existe en la tabla
    console.log('\n1. Verificando si el usuario ya existe...');
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    
    if (existingError) {
      console.error('❌ Error al verificar usuario:', existingError.message);
      console.error('📋 Detalles:', JSON.stringify(existingError, null, 2));
      return;
    }
    
    if (existingUser && existingUser.length > 0) {
      console.log('⚠️ El usuario ya existe en la tabla users');
      console.log('📋 Datos del usuario:');
      console.log(JSON.stringify(existingUser[0], null, 2));
      return;
    }
    
    console.log('✅ El usuario no existe en la tabla, procediendo a insertar...');
    
    // 2. Insertar el usuario manualmente
    console.log('\n2. Insertando usuario manualmente...');
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: userEmail,
          name: 'Usuario Insertado Manualmente',
          role: 'member'
        }
      ]);
    
    if (insertError) {
      console.error('❌ Error al insertar usuario:', insertError.message);
      console.error('📋 Detalles:', JSON.stringify(insertError, null, 2));
      
      // Verificar si es un problema de RLS
      if (insertError.message.includes('new row violates row-level security policy')) {
        console.log('\n🔒 ERROR DE POLÍTICAS RLS');
        console.log('El error indica que las políticas RLS están impidiendo la inserción.');
        console.log('Esto puede explicar por qué el trigger también está fallando.');
        console.log('\n📋 SOLUCIÓN RECOMENDADA:');
        console.log('1. Verifica las políticas RLS para la tabla users');
        console.log('2. Asegúrate de que exista una política que permita la inserción:');
        console.log(`
CREATE POLICY "Allow insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
`);
      }
      return;
    }
    
    console.log('✅ Usuario insertado manualmente con éxito');
    
    // 3. Verificar la inserción
    console.log('\n3. Verificando inserción...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);
    
    if (userError) {
      console.error('❌ Error al verificar inserción:', userError.message);
      return;
    }
    
    if (userData && userData.length > 0) {
      console.log('✅ Usuario verificado en la tabla users');
      console.log('📋 Datos del usuario:');
      console.log(JSON.stringify(userData[0], null, 2));
    } else {
      console.log('⚠️ El usuario no fue encontrado después de la inserción');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

// Ejecutar la inserción manual
insertarManual().catch(console.error);