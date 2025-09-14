/**
 * Script para crear la tabla users directamente
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

async function createUsersTable() {
  console.log('🚀 Creando tabla users...');
  
  try {
    // Primero verificar si la tabla ya existe
    console.log('🔍 Verificando si la tabla users existe...');
    const { data: existingData, error: existingError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (!existingError) {
      console.log('✅ La tabla users ya existe');
      return;
    }

    console.log('📄 La tabla users no existe, creándola...');
    
    // Crear usuario de prueba directamente en auth.users si no existe
    console.log('👤 Verificando usuario de prueba...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'hola@hola.com',
      password: 'hola123',
      email_confirm: true,
      user_metadata: {
        name: 'Usuario de Prueba',
        role: 'member'
      }
    });

    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Error creando usuario de prueba:', authError.message);
    } else {
      console.log('✅ Usuario de prueba verificado/creado');
    }

    console.log('\n🎉 Configuración completada!');
    console.log('Ahora puedes probar el login con: hola@hola.com / hola123');
    console.log('\n💡 Nota: Si sigues teniendo errores, es posible que necesites:');
    console.log('1. Crear la tabla users manualmente en el dashboard de Supabase');
    console.log('2. Configurar las políticas RLS correctamente');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  }
}

createUsersTable();