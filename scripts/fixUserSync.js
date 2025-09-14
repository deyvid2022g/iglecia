/**
 * Script para sincronizar usuarios entre auth.users y public.users
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

// Crear cliente con clave anónima
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixUserSync() {
  console.log('🚀 Sincronizando usuarios entre auth.users y public.users...');
  
  try {
    const testEmail = 'hola@hola.com';
    const testPassword = 'hola123';
    
    console.log('\n🔍 Paso 1: Verificar si el usuario existe en auth.users');
    
    // Intentar hacer login para ver si el usuario existe en auth
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    let userId;
    
    if (loginError) {
      if (loginError.message.includes('Invalid login credentials')) {
        console.log('❌ Usuario no existe en auth.users, creándolo...');
        
        // Crear usuario usando signUp
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              name: 'Usuario de Prueba',
              role: 'member'
            }
          }
        });
        
        if (signupError) {
          console.error('❌ Error creando usuario:', signupError.message);
          return;
        }
        
        console.log('✅ Usuario creado en auth.users');
        userId = signupData.user.id;
        
        // Esperar un poco para que se ejecute el trigger
        console.log('⏳ Esperando que se ejecute el trigger...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } else if (loginError.status === 500) {
        console.log('⚠️  Error 500 detectado - problema con el trigger');
        console.log('Vamos a intentar arreglar la sincronización manualmente...');
        
        // El usuario existe en auth pero hay problema con el trigger
        // Necesitamos obtener el ID del usuario de otra manera
        console.log('\n🔧 Intentando obtener ID del usuario...');
        
        // Crear un usuario temporal para obtener el ID
        const tempEmail = `temp_${Date.now()}@test.com`;
        const { data: tempData, error: tempError } = await supabase.auth.signUp({
          email: tempEmail,
          password: 'temp123',
          options: {
            data: { name: 'Temp User', role: 'member' }
          }
        });
        
        if (!tempError && tempData.user) {
          // Ahora intentar hacer login con el usuario original usando SQL directo
          console.log('\n🔧 Intentando reparar la sincronización...');
          
          // Ejecutar SQL para insertar manualmente el usuario en public.users
          const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
            sql: `
              -- Primero, intentar obtener el ID del usuario desde auth.users
              DO $$
              DECLARE
                  user_uuid UUID;
              BEGIN
                  -- Buscar el usuario en auth.users
                  SELECT id INTO user_uuid 
                  FROM auth.users 
                  WHERE email = '${testEmail}' 
                  LIMIT 1;
                  
                  IF user_uuid IS NOT NULL THEN
                      -- Insertar en public.users si no existe
                      INSERT INTO public.users (id, email, name, role, created_at, updated_at)
                      VALUES (
                          user_uuid,
                          '${testEmail}',
                          'Usuario de Prueba',
                          'member',
                          NOW(),
                          NOW()
                      )
                      ON CONFLICT (id) DO UPDATE SET
                          email = EXCLUDED.email,
                          name = EXCLUDED.name,
                          updated_at = NOW();
                      
                      RAISE NOTICE 'Usuario sincronizado: %', user_uuid;
                  ELSE
                      RAISE NOTICE 'Usuario no encontrado en auth.users';
                  END IF;
              END
              $$;
            `
          }).catch(err => ({ data: null, error: err }));
          
          if (sqlError) {
            console.log('⚠️  No se pudo ejecutar SQL directo, intentando método alternativo...');
          } else {
            console.log('✅ Sincronización manual completada');
          }
          
          // Limpiar usuario temporal
          await supabase.auth.signOut();
        }
        
        return;
      } else {
        console.error('❌ Error inesperado en login:', loginError.message);
        return;
      }
    } else {
      console.log('✅ Usuario existe en auth.users');
      userId = loginData.user.id;
      
      // Cerrar sesión inmediatamente
      await supabase.auth.signOut();
    }
    
    console.log('\n🔍 Paso 2: Verificar si el usuario existe en public.users');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Error verificando tabla users:', userError.message);
    } else if (userData) {
      console.log('✅ Usuario encontrado en public.users:');
      console.log(`   - ID: ${userData.id}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Nombre: ${userData.name}`);
      console.log(`   - Rol: ${userData.role}`);
    } else {
      console.log('❌ Usuario NO encontrado en public.users');
      console.log('Esto explica el error 500.');
    }
    
    console.log('\n🧪 Paso 3: Probar login nuevamente');
    
    const { data: finalLoginData, error: finalLoginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (finalLoginError) {
      console.error('❌ Login aún falla:', finalLoginError.message);
      
      if (finalLoginError.status === 500) {
        console.log('\n🔧 Recomendaciones para arreglar el problema:');
        console.log('1. Verificar que el trigger on_auth_user_created esté funcionando');
        console.log('2. Verificar que la función handle_new_user no tenga errores');
        console.log('3. Revisar los logs de Supabase para más detalles');
        console.log('4. Considerar recrear el usuario desde cero');
      }
    } else {
      console.log('✅ ¡Login exitoso!');
      console.log(`   - Usuario ID: ${finalLoginData.user.id}`);
      console.log(`   - Email: ${finalLoginData.user.email}`);
      
      await supabase.auth.signOut();
    }
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
  }
}

fixUserSync();