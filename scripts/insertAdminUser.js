/**
 * Script simple para insertar usuario administrador
 * 
 * Este script inserta directamente el usuario administrador en la tabla users.
 * Requiere que la tabla users ya exista.
 */

import { createClient } from '@supabase/supabase-js';

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
 * Función para insertar usuario administrador
 */
async function insertAdminUser() {
  const adminEmail = 'lugarderefugio005@gmail.com';
  const adminName = 'Administrador Principal';
  
  console.log('=== INSERTAR USUARIO ADMINISTRADOR ===\n');
  console.log(`Email: ${adminEmail}`);
  console.log(`Nombre: ${adminName}`);
  console.log('Rol: admin\n');
  
  try {
    // Verificar si el usuario ya existe
    console.log('Verificando si el usuario ya existe...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error al verificar usuario existente:', checkError.message);
      
      if (checkError.message.includes('Could not find the table')) {
        console.log('\n❌ La tabla "users" no existe.');
        console.log('\nPor favor, sigue estas instrucciones:');
        console.log('1. Ve a https://supabase.com/dashboard');
        console.log('2. Selecciona tu proyecto');
        console.log('3. Ve a SQL Editor');
        console.log('4. Ejecuta el contenido del archivo: supabase/schema.sql');
        console.log('5. O revisa el archivo: scripts/manualSetupInstructions.md');
        return;
      }
      
      return;
    }
    
    if (existingUser) {
      console.log('✅ El usuario ya existe.');
      
      if (existingUser.role === 'admin') {
        console.log('✅ El usuario ya tiene rol de administrador.');
        console.log('\nDetalles del usuario:');
        console.log(`- ID: ${existingUser.id}`);
        console.log(`- Nombre: ${existingUser.name}`);
        console.log(`- Email: ${existingUser.email}`);
        console.log(`- Rol: ${existingUser.role}`);
        console.log(`- Creado: ${existingUser.created_at}`);
      } else {
        console.log(`❌ El usuario existe pero tiene rol: ${existingUser.role}`);
        console.log('Actualizando rol a administrador...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('email', adminEmail);
        
        if (updateError) {
          console.error('Error al actualizar rol:', updateError.message);
        } else {
          console.log('✅ Rol actualizado a administrador exitosamente.');
        }
      }
      return;
    }
    
    // El usuario no existe, crearlo
    console.log('❌ El usuario no existe. Creándolo...');
    
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
      
      if (error.message.includes('Could not find the table')) {
        console.log('\n❌ La tabla "users" no existe.');
        console.log('\nPor favor, sigue estas instrucciones:');
        console.log('1. Ve a https://supabase.com/dashboard');
        console.log('2. Selecciona tu proyecto');
        console.log('3. Ve a SQL Editor');
        console.log('4. Ejecuta el contenido del archivo: supabase/schema.sql');
        console.log('5. O revisa el archivo: scripts/manualSetupInstructions.md');
      }
      return;
    }
    
    console.log('\n✅ Usuario administrador creado exitosamente!');
    console.log('\nDetalles del usuario creado:');
    console.log(`- ID: ${userId}`);
    console.log(`- Nombre: ${adminName}`);
    console.log(`- Email: ${adminEmail}`);
    console.log(`- Rol: admin`);
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('Este usuario solo existe en la tabla "users".');
    console.log('Para que pueda iniciar sesión en la aplicación, debe:');
    console.log('\n1. Registrarse normalmente en la aplicación con este email, O');
    console.log('2. Ser creado manualmente en Authentication → Users del panel de Supabase');
    console.log('\nPasos para crear en Authentication:');
    console.log('1. Ve a https://supabase.com/dashboard');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a Authentication → Users');
    console.log('4. Haz clic en "Add user"');
    console.log(`5. Email: ${adminEmail}`);
    console.log('6. Contraseña: [Crea una contraseña segura]');
    console.log('7. Haz clic en "Create user"');
    
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

/**
 * Función para listar usuarios administradores
 */
async function listAdminUsers() {
  console.log('=== USUARIOS ADMINISTRADORES ===\n');
  
  try {
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error al obtener usuarios administradores:', error.message);
      return;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('❌ No se encontraron usuarios administradores.');
      return;
    }
    
    console.log(`✅ Se encontraron ${adminUsers.length} usuario(s) administrador(es):\n`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Creado: ${user.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    await listAdminUsers();
  } else {
    await insertAdminUser();
  }
}

// Ejecutar función principal
main().catch(console.error);