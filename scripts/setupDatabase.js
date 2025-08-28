/**
 * Script para configurar la base de datos Supabase
 * 
 * Este script ejecuta el schema SQL para crear las tablas necesarias.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están configuradas.');
  console.log('Asegúrate de tener configuradas:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Función para verificar si las tablas existen
 */
async function checkTables() {
  const tables = ['users', 'events', 'sermons', 'blog_posts'];
  const results = {};
  
  console.log('Verificando tablas existentes...');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        results[table] = false;
        console.log(`❌ Tabla '${table}': No existe`);
      } else {
        results[table] = true;
        console.log(`✅ Tabla '${table}': Existe`);
      }
    } catch (err) {
      results[table] = false;
      console.log(`❌ Tabla '${table}': Error al verificar`);
    }
  }
  
  return results;
}

/**
 * Función para mostrar instrucciones de configuración manual
 */
function showManualSetupInstructions() {
  console.log('\n=== INSTRUCCIONES PARA CONFIGURAR LA BASE DE DATOS ===\n');
  
  console.log('Para configurar la base de datos Supabase, sigue estos pasos:');
  console.log('');
  console.log('1. Ve al panel de control de Supabase:');
  console.log('   https://supabase.com/dashboard');
  console.log('');
  console.log('2. Selecciona tu proyecto');
  console.log('');
  console.log('3. Ve a "SQL Editor" en el menú lateral');
  console.log('');
  console.log('4. Crea una nueva consulta y copia el contenido del archivo:');
  console.log('   supabase/schema.sql');
  console.log('');
  console.log('5. Ejecuta la consulta SQL para crear todas las tablas');
  console.log('');
  console.log('6. Una vez creadas las tablas, ejecuta nuevamente:');
  console.log('   node scripts/createAdminUser.js --create');
  console.log('');
  console.log('Alternativamente, puedes crear el usuario administrador manualmente:');
  console.log('');
  console.log('1. Ve a Authentication → Users en el panel de Supabase');
  console.log('2. Crea un nuevo usuario con email: lugarderefugio005@gmail.com');
  console.log('3. Ve a Table Editor → users');
  console.log('4. Encuentra el usuario y cambia el campo "role" a "admin"');
  console.log('');
}

/**
 * Función para crear el usuario administrador directamente en la tabla
 */
async function createAdminUserDirect() {
  const adminEmail = 'lugarderefugio005@gmail.com';
  const adminName = 'Administrador Principal';
  
  try {
    console.log('\nIntentando crear usuario administrador directamente...');
    
    // Generar un UUID para el usuario
    const userId = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          name: adminName,
          email: adminEmail,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error('Error al crear usuario administrador:', error.message);
      return false;
    }
    
    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`- ID: ${userId}`);
    console.log(`- Nombre: ${adminName}`);
    console.log(`- Email: ${adminEmail}`);
    console.log(`- Rol: admin`);
    console.log('');
    console.log('⚠️  NOTA: Este usuario solo existe en la tabla users.');
    console.log('   Para que pueda iniciar sesión, debe registrarse normalmente');
    console.log('   en la aplicación con el mismo email.');
    
    return true;
  } catch (error) {
    console.error('Error inesperado:', error);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('=== CONFIGURACIÓN DE BASE DE DATOS SUPABASE ===\n');
  
  const tableStatus = await checkTables();
  
  const allTablesExist = Object.values(tableStatus).every(exists => exists);
  
  if (!allTablesExist) {
    console.log('\n❌ Algunas tablas no existen en la base de datos.');
    showManualSetupInstructions();
    return;
  }
  
  console.log('\n✅ Todas las tablas existen. Procediendo a verificar usuario administrador...');
  
  // Verificar si el usuario administrador ya existe
  const { data: existingUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'lugarderefugio005@gmail.com')
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error al verificar usuario:', error.message);
    return;
  }
  
  if (existingUser) {
    if (existingUser.role === 'admin') {
      console.log('✅ El usuario administrador ya existe y tiene el rol correcto.');
      console.log(`- Nombre: ${existingUser.name}`);
      console.log(`- Email: ${existingUser.email}`);
      console.log(`- Rol: ${existingUser.role}`);
    } else {
      // Actualizar rol
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('email', 'lugarderefugio005@gmail.com');
      
      if (updateError) {
        console.error('Error al actualizar rol:', updateError.message);
      } else {
        console.log('✅ Rol actualizado a administrador.');
      }
    }
  } else {
    console.log('\n❌ Usuario administrador no encontrado.');
    console.log('\nOpciones disponibles:');
    console.log('1. Crear entrada en tabla users (recomendado)');
    console.log('2. Registrar usuario manualmente en la aplicación');
    
    const success = await createAdminUserDirect();
    if (!success) {
      showManualSetupInstructions();
    }
  }
}

// Ejecutar función principal
main().catch(console.error);