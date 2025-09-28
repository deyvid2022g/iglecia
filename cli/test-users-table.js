#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar configurados en .env');
  console.error('URL encontrada:', supabaseUrl ? 'Sí' : 'No');
  console.error('Key encontrada:', supabaseKey ? 'Sí' : 'No');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUsersTable() {
  console.log('🔍 === VERIFICANDO TABLA USERS ===\n');

  try {
    // Verificar si la tabla existe y obtener datos
    console.log('📊 Verificando existencia de la tabla users...');
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (fetchError) {
      console.error('❌ Error al consultar la tabla users:', fetchError);
      return;
    }

    console.log(`✅ Tabla users encontrada con ${users.length} registros`);
    
    if (users.length > 0) {
      console.log('\n📋 Estructura de la tabla users:');
      console.log('Columnas encontradas:', Object.keys(users[0]));
      console.log('\n📄 Ejemplo de registro:');
      console.log(JSON.stringify(users[0], null, 2));
    } else {
      console.log('⚠️  La tabla users está vacía');
    }

    // Probar inserción de un usuario de prueba
    console.log('\n🔄 Intentando insertar usuario de prueba...');
    const testUser = {
      full_name: 'Usuario de Prueba',
      email: 'test@example.com',
      role: 'member',
      password_hash: 'test_hash'
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error al insertar usuario de prueba:', insertError);
      
      // Verificar políticas RLS
      console.log('\n🔒 Verificando políticas RLS...');
      const { data: policies, error: policyError } = await supabase
        .rpc('get_table_policies', { table_name: 'users' })
        .catch(() => {
          console.log('⚠️  No se pudo verificar las políticas RLS automáticamente');
          return { data: null, error: null };
        });

      if (policies) {
        console.log('📋 Políticas RLS encontradas:', policies);
      }
    } else {
      console.log('✅ Usuario de prueba insertado exitosamente:', insertedUser.id);
      
      // Limpiar usuario de prueba
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertedUser.id);

      if (deleteError) {
        console.error('⚠️  Error al eliminar usuario de prueba:', deleteError);
      } else {
        console.log('🧹 Usuario de prueba eliminado');
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la prueba
testUsersTable().then(() => {
  console.log('\n🏁 Prueba de tabla users completada');
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});