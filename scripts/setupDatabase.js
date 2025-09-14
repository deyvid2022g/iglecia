/**
 * Script para configurar la base de datos Supabase
 * 
 * Este script ejecuta el schema SQL para crear las tablas necesarias.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
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

async function setupDatabase() {
  console.log('🚀 Configurando base de datos de Supabase...');
  console.log('=' .repeat(50));

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'setup_supabase_complete.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando script SQL de configuración...');

    // Dividir el SQL en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Saltar comentarios y comandos vacíos
      if (command.startsWith('--') || command.length < 10) {
        continue;
      }

      try {
        console.log(`⏳ Ejecutando comando ${i + 1}/${commands.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command
        });

        if (error) {
          // Algunos errores son esperados (como "ya existe")
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️  Advertencia: ${error.message}`);
          } else {
            console.error(`❌ Error en comando ${i + 1}: ${error.message}`);
            errorCount++;
          }
        } else {
          successCount++;
          console.log(`✅ Comando ${i + 1} ejecutado exitosamente`);
        }
      } catch (err) {
        console.error(`❌ Error ejecutando comando ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n📊 Resumen de configuración:');
    console.log('=' .repeat(50));
    console.log(`✅ Comandos exitosos: ${successCount}`);
    console.log(`❌ Errores: ${errorCount}`);

    // Verificar la configuración
    await verifySetup();

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    await setupWithDirectSQL();
  }
}

async function verifySetup() {
  console.log('\n🔍 Verificando configuración...');
  
  try {
    // Probar inserción de usuario de prueba
    console.log('\n🧪 Probando registro de usuario...');
    
    const testEmail = `test-setup-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          name: 'Usuario de Prueba',
          role: 'member'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('Database error granting user')) {
        console.log('❌ Error persistente: Database error granting user');
        console.log('💡 Solución: Verificar que el trigger handle_new_user esté funcionando');
      } else {
        console.log(`⚠️  Error de registro: ${signUpError.message}`);
      }
    } else {
      console.log('✅ Registro de usuario exitoso');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

// Función alternativa usando SQL directo
async function setupWithDirectSQL() {
  console.log('\n🔄 Intentando configuración con SQL directo...');
  
  const setupCommands = [
    {
      name: 'Crear tabla users',
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT,
          role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
          avatar_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'Habilitar RLS',
      sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'
    },
    {
      name: 'Crear función handle_new_user',
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.users (id, email, name, role)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            COALESCE(NEW.raw_user_meta_data->>'role', 'member')
          );
          RETURN NEW;
        EXCEPTION
          WHEN others THEN
            RAISE WARNING 'Error creating user profile: %', SQLERRM;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    },
    {
      name: 'Crear trigger',
      sql: `
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    }
  ];

  for (const command of setupCommands) {
    try {
      console.log(`⏳ ${command.name}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: command.sql
      });

      if (error) {
        console.log(`⚠️  ${command.name}: ${error.message}`);
      } else {
        console.log(`✅ ${command.name} completado`);
      }
    } catch (err) {
      console.log(`❌ Error en ${command.name}: ${err.message}`);
    }
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
    console.log('\n🔧 Iniciando configuración automática...');
    await setupDatabase();
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

// Ejecutar configuración
main().then(() => {
  console.log('\n✨ Configuración de base de datos completada');
  console.log('\n🔧 Próximos pasos:');
  console.log('1. Ejecutar: npm run diagnostic');
  console.log('2. Ejecutar: npm run test:run');
  console.log('3. Probar la aplicación con registro/login');
}).catch(error => {
  console.error('❌ Error fatal durante la configuración:', error);
  process.exit(1);
});