/**
 * Script para ejecutar el fix SQL del problema del trigger
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

// Crear cliente con clave anónima
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeSqlFix() {
  console.log('🚀 Ejecutando fix para el problema del trigger...');
  
  try {
    // 1. Primero, intentar insertar manualmente el usuario de prueba
    console.log('\n🔧 Paso 1: Insertando usuario de prueba manualmente...');
    
    const testEmail = 'hola@hola.com';
    const testUserId = '550e8400-e29b-41d4-a716-446655440000'; // UUID fijo para prueba
    
    // Intentar insertar directamente en la tabla users
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .upsert({
        id: testUserId,
        email: testEmail,
        name: 'Usuario de Prueba',
        role: 'member'
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (insertError) {
      console.error('❌ Error insertando usuario:', insertError.message);
      
      // Si falla, intentar con un enfoque diferente
      console.log('\n🔧 Intentando enfoque alternativo...');
      
      // Crear usuario usando signUp (esto debería activar el trigger)
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'hola123',
        options: {
          data: {
            name: 'Usuario de Prueba',
            role: 'member'
          }
        }
      });
      
      if (signupError) {
        if (signupError.message.includes('already registered')) {
          console.log('✅ Usuario ya existe en auth.users');
          
          // El problema es que existe en auth pero no en public.users
          console.log('\n🔧 Sincronizando usuario existente...');
          
          // Intentar obtener el ID real del usuario
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: 'hola123'
          });
          
          if (loginError && loginError.status === 500) {
            console.log('⚠️  Confirmado: Error 500 por desincronización');
            
            // Usar un ID temporal para insertar
            const tempId = crypto.randomUUID();
            
            const { data: tempInsert, error: tempError } = await supabase
              .from('users')
              .insert({
                id: tempId,
                email: `temp_${Date.now()}@test.com`,
                name: 'Usuario Temporal',
                role: 'member'
              })
              .select();
            
            if (!tempError) {
              console.log('✅ Tabla users es accesible');
              
              // Eliminar usuario temporal
              await supabase.from('users').delete().eq('id', tempId);
              
              console.log('\n📋 INSTRUCCIONES MANUALES:');
              console.log('Necesitas ejecutar este SQL en el Supabase SQL Editor:');
              console.log('');
              console.log('-- 1. Encontrar el ID real del usuario');
              console.log(`SELECT id FROM auth.users WHERE email = '${testEmail}';`);
              console.log('');
              console.log('-- 2. Insertar en public.users (reemplaza USER_ID_AQUI con el ID real)');
              console.log(`INSERT INTO public.users (id, email, name, role, created_at, updated_at)`);
              console.log(`VALUES (`);
              console.log(`    'USER_ID_AQUI',`);
              console.log(`    '${testEmail}',`);
              console.log(`    'Usuario de Prueba',`);
              console.log(`    'member',`);
              console.log(`    NOW(),`);
              console.log(`    NOW()`);
              console.log(`);`);
              console.log('');
              console.log('-- 3. Verificar la sincronización');
              console.log('SELECT * FROM public.users WHERE email = \'hola@hola.com\';');
              
            } else {
              console.error('❌ No se puede acceder a la tabla users:', tempError.message);
            }
          } else if (!loginError) {
            console.log('🎉 ¡Login exitoso! El problema se resolvió.');
            await supabase.auth.signOut();
          }
        } else {
          console.error('❌ Error en signUp:', signupError.message);
        }
      } else {
        console.log('✅ Usuario creado exitosamente');
        console.log(`   - ID: ${signupData.user.id}`);
        console.log(`   - Email: ${signupData.user.email}`);
      }
    } else {
      console.log('✅ Usuario insertado manualmente:');
      console.log(`   - ID: ${insertData[0].id}`);
      console.log(`   - Email: ${insertData[0].email}`);
    }
    
    // 2. Probar login final
    console.log('\n🧪 Paso 2: Probando login...');
    
    const { data: finalLogin, error: finalError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'hola123'
    });
    
    if (finalError) {
      console.error('❌ Login aún falla:', finalError.message);
      
      if (finalError.status === 500) {
        console.log('\n🔧 SOLUCIÓN RECOMENDADA:');
        console.log('1. Ve al Supabase Dashboard > SQL Editor');
        console.log('2. Ejecuta el archivo fixTriggerIssue.sql que se creó');
        console.log('3. Esto sincronizará todos los usuarios y arreglará el trigger');
        console.log('');
        console.log('Alternativamente, puedes:');
        console.log('1. Eliminar el usuario hola@hola.com del Authentication');
        console.log('2. Registrarlo nuevamente desde la aplicación');
      }
    } else {
      console.log('🎉 ¡LOGIN EXITOSO!');
      console.log(`   - Usuario ID: ${finalLogin.user.id}`);
      console.log(`   - Email: ${finalLogin.user.email}`);
      
      // Verificar que puede obtener sus datos
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', finalLogin.user.id)
        .single();
      
      if (userError) {
        console.error('⚠️  Aún hay problema obteniendo datos del usuario:', userError.message);
      } else {
        console.log('✅ Datos del usuario obtenidos correctamente:');
        console.log(`   - Nombre: ${userData.name}`);
        console.log(`   - Rol: ${userData.role}`);
      }
      
      await supabase.auth.signOut();
      
      console.log('\n🎉 ¡PROBLEMA RESUELTO!');
      console.log('El usuario puede hacer login correctamente.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la ejecución:', error.message);
  }
}

executeSqlFix();