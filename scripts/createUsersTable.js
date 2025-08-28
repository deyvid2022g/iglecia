/**
 * Script para crear la tabla users en Supabase
 * 
 * Este script ejecuta el SQL necesario para crear la tabla users.
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
 * SQL para crear la tabla users y sus políticas
 */
const createUsersTableSQL = `
-- Crear tabla de usuarios personalizada
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política para que los administradores puedan ver todos los usuarios
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'pastor')
    )
  );

-- Política para que los administradores puedan actualizar cualquier usuario
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Función para crear automáticamente un registro en users cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

/**
 * Función para ejecutar SQL usando la API REST de Supabase
 */
async function executeSQL(sql) {
  try {
    // Dividir el SQL en declaraciones individuales
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Ejecutando ${statements.length} declaraciones SQL...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Ejecutando declaración ${i + 1}/${statements.length}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          console.error(`Error en declaración ${i + 1}:`, error.message);
          // Continuar con las siguientes declaraciones
        } else {
          console.log(`✅ Declaración ${i + 1} ejecutada correctamente`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ejecutando SQL:', error);
    return false;
  }
}

/**
 * Función para verificar si la tabla users existe
 */
async function checkUsersTable() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Función para crear el usuario administrador
 */
async function createAdminUser() {
  const adminEmail = 'lugarderefugio005@gmail.com';
  const adminName = 'Administrador Principal';
  
  try {
    console.log('\nCreando usuario administrador...');
    
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
  console.log('=== CREACIÓN DE TABLA USERS ===\n');
  
  // Verificar si la tabla ya existe
  const tableExists = await checkUsersTable();
  
  if (tableExists) {
    console.log('✅ La tabla users ya existe.');
  } else {
    console.log('❌ La tabla users no existe. Intentando crearla...');
    console.log('\n⚠️  NOTA: Este método puede no funcionar debido a limitaciones de permisos.');
    console.log('Si falla, deberás crear la tabla manualmente en el panel de Supabase.');
    console.log('\nInstrucciones manuales:');
    console.log('1. Ve a https://supabase.com/dashboard');
    console.log('2. Selecciona tu proyecto');
    console.log('3. Ve a SQL Editor');
    console.log('4. Ejecuta el contenido del archivo: supabase/schema.sql');
    console.log('\nIntentando crear tabla automáticamente...');
    
    const success = await executeSQL(createUsersTableSQL);
    
    if (!success) {
      console.log('\n❌ No se pudo crear la tabla automáticamente.');
      console.log('Por favor, créala manualmente siguiendo las instrucciones anteriores.');
      return;
    }
    
    // Verificar nuevamente
    const tableExistsNow = await checkUsersTable();
    if (!tableExistsNow) {
      console.log('\n❌ La tabla no se creó correctamente.');
      console.log('Por favor, créala manualmente en el panel de Supabase.');
      return;
    }
    
    console.log('\n✅ Tabla users creada exitosamente.');
  }
  
  // Verificar si el usuario administrador existe
  const { data: existingUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'lugarderefugio005@gmail.com')
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('\nError al verificar usuario:', error.message);
    return;
  }
  
  if (existingUser) {
    if (existingUser.role === 'admin') {
      console.log('\n✅ El usuario administrador ya existe y tiene el rol correcto.');
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
        console.error('\nError al actualizar rol:', updateError.message);
      } else {
        console.log('\n✅ Rol actualizado a administrador.');
      }
    }
  } else {
    console.log('\n❌ Usuario administrador no encontrado. Creándolo...');
    await createAdminUser();
  }
  
  console.log('\n=== PROCESO COMPLETADO ===');
  console.log('\n⚠️  RECORDATORIO IMPORTANTE:');
  console.log('Para que el usuario pueda iniciar sesión, debe:');
  console.log('1. Registrarse en la aplicación con el email: lugarderefugio005@gmail.com');
  console.log('2. O ser creado manualmente en Authentication → Users del panel de Supabase');
}

// Ejecutar función principal
main().catch(console.error);