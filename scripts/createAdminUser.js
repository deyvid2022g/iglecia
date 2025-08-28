/**
 * Script para crear un usuario administrador en Supabase
 * 
 * Este script crea un usuario con rol de administrador en la aplicación.
 * Uso: node scripts/createAdminUser.js
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
 * Función para crear un usuario administrador
 * Nota: Este script requiere que el usuario se registre manualmente primero
 */
async function createAdminUser() {
  const adminEmail = 'lugarderefugio005@gmail.com';
  const adminName = 'Administrador Principal';
  
  try {
    console.log('Verificando/actualizando usuario administrador...');
    console.log(`Email: ${adminEmail}`);
    
    // Verificar si el usuario existe en la tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error al verificar usuario en tabla users:', userError.message);
      return;
    }
    
    if (userData) {
      if (userData.role === 'admin') {
        console.log('✅ El usuario ya tiene rol de administrador.');
        console.log(`- Nombre: ${userData.name}`);
        console.log(`- Email: ${userData.email}`);
        console.log(`- Rol: ${userData.role}`);
        return;
      } else {
        // Actualizar rol a admin
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('email', adminEmail);
        
        if (updateError) {
          console.error('Error al actualizar rol de usuario:', updateError.message);
          return;
        }
        
        console.log('✅ Rol de usuario actualizado a administrador.');
        console.log(`- Nombre: ${userData.name}`);
        console.log(`- Email: ${userData.email}`);
        console.log(`- Rol anterior: ${userData.role} → Nuevo rol: admin`);
        return;
      }
    } else {
      console.log('❌ El usuario no existe en la base de datos.');
      console.log('');
      console.log('Para crear el usuario administrador, sigue estos pasos:');
      console.log('1. Ve a la página de registro de la aplicación');
      console.log(`2. Registra una cuenta con el email: ${adminEmail}`);
      console.log('3. Ejecuta este script nuevamente para asignar el rol de administrador');
      console.log('');
      console.log('Alternativamente, puedes insertar el usuario manualmente en Supabase:');
      console.log('1. Ve al panel de Supabase → Authentication → Users');
      console.log(`2. Crea un usuario con email: ${adminEmail}`);
      console.log('3. Ve a Table Editor → users');
      console.log(`4. Actualiza el rol del usuario a 'admin'`);
      return;
    }
    
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

/**
 * Función para listar todos los usuarios administradores
 */
async function listAdminUsers() {
  try {
    console.log('Listando usuarios administradores...');
    
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error al obtener usuarios administradores:', error.message);
      return;
    }
    
    if (adminUsers.length === 0) {
      console.log('No se encontraron usuarios administradores.');
      return;
    }
    
    console.log(`Usuarios administradores encontrados (${adminUsers.length}):`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Creado: ${new Date(user.created_at).toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('Error inesperado:', error);
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Uso: node createAdminUser.js [opciones]

Opciones:
  --create   Crear usuario administrador lugarderefugio005@gmail.com
  --list     Listar todos los usuarios administradores
  --help, -h Mostrar esta ayuda

Ejemplo:
  node createAdminUser.js --create
  node createAdminUser.js --list
`);
} else if (args.includes('--create')) {
  createAdminUser();
} else if (args.includes('--list')) {
  listAdminUsers();
} else {
  console.log('Creando usuario administrador por defecto...');
  createAdminUser();
}