/**
 * Script para crear usuario de prueba
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno requeridas:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY (o VITE_SUPABASE_ANON_KEY como fallback)');
  process.exit(1);
}

// Crear cliente con permisos de servicio
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  console.log('🚀 Configurando usuario de prueba...');
  
  try {
    const testEmail = 'hola@hola.com';
    const testPassword = 'hola123';
    
    // 1. Verificar si el usuario existe en auth.users
    console.log('🔍 Verificando usuario en auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error obteniendo usuarios:', authError.message);
      return;
    }
    
    const existingAuthUser = authUsers.users.find(user => user.email === testEmail);
    
    let userId;
    
    if (existingAuthUser) {
      console.log('✅ Usuario encontrado en auth.users');
      userId = existingAuthUser.id;
    } else {
      console.log('👤 Creando usuario en auth.users...');
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          name: 'Usuario de Prueba',
          role: 'member'
        }
      });
      
      if (createError) {
        console.error('❌ Error creando usuario:', createError.message);
        return;
      }
      
      console.log('✅ Usuario creado en auth.users');
      userId = newUser.user.id;
    }
    
    // 2. Verificar si el usuario existe en la tabla users
    console.log('🔍 Verificando usuario en tabla users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Error verificando tabla users:', userError.message);
      return;
    }
    
    if (userData) {
      console.log('✅ Usuario encontrado en tabla users:');
      console.log(`   - ID: ${userData.id}`);
      console.log(`   - Email: ${userData.email}`);
      console.log(`   - Nombre: ${userData.name}`);
      console.log(`   - Rol: ${userData.role}`);
    } else {
      console.log('👤 Creando registro en tabla users...');
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: testEmail,
          name: 'Usuario de Prueba',
          role: 'member'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error creando registro en users:', insertError.message);
        return;
      }
      
      console.log('✅ Registro creado en tabla users:');
      console.log(`   - ID: ${insertData.id}`);
      console.log(`   - Email: ${insertData.email}`);
      console.log(`   - Nombre: ${insertData.name}`);
      console.log(`   - Rol: ${insertData.role}`);
    }
    
    // 3. Probar login
    console.log('🧪 Probando login...');
    const clientSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    const { data: loginData, error: loginError } = await clientSupabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.error('❌ Error en login:', loginError.message);
    } else {
      console.log('✅ Login exitoso!');
      console.log(`   - Usuario ID: ${loginData.user.id}`);
      console.log(`   - Email: ${loginData.user.email}`);
      
      // Cerrar sesión
      await clientSupabase.auth.signOut();
    }
    
    console.log('\n🎉 Configuración completada!');
    console.log('Credenciales de prueba:');
    console.log(`   - Email: ${testEmail}`);
    console.log(`   - Password: ${testPassword}`);
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  }
}

createTestUser();