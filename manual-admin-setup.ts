import { createClient } from '@supabase/supabase-js';

// Credenciales directas para prueba
const supabaseUrl = 'https://toopbtydsiepeoisuecg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3BidHlkc2llcGVvaXN1ZWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzY0MDQsImV4cCI6MjA3MjA1MjQwNH0.ckYKpJDfqhbQ4mnZNDBBdR3Qd63VaS1jOhSIW3_SE8g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupAdmin() {
  console.log('🔧 Configurando administrador manualmente...');
  
  const adminEmail = 'lugarderefugio005@gmail.com';
  const adminPassword = 'Admin123!';
  
  try {
    // Paso 1: Registrar el usuario si no existe
    console.log('📝 Paso 1: Registrando usuario administrador...');
    
    const { data: _signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          full_name: 'Administrador Iglesia'
        }
      }
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.log('❌ Error en registro:', signUpError.message);
      return;
    }
    
    console.log('✅ Usuario registrado o ya existe');
    
    // Paso 2: Intentar login para obtener el ID del usuario
    console.log('\n🔑 Paso 2: Obteniendo ID del usuario...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (signInError) {
      console.log('❌ Error en login:', signInError.message);
      
      // Si el login falla, intentar con un trigger de base de datos
      console.log('\n🛠️  Intentando solución alternativa...');
      
      // Ejecutar SQL directo para crear la política y el perfil
      const sqlCommands = [
        `
        -- Crear política de inserción para perfiles
        DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON public.profiles;
        CREATE POLICY "Los usuarios pueden crear su propio perfil" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
        `,
        `
        -- Crear función para setup inicial de admin
        CREATE OR REPLACE FUNCTION setup_admin_profile()
        RETURNS void AS $$
        BEGIN
            -- Deshabilitar RLS temporalmente para esta operación
            SET row_security = off;
            
            -- Insertar perfil de admin si no existe
            INSERT INTO public.profiles (id, name, email, role, is_active, join_date, created_at, updated_at)
            VALUES (
                '550e8400-e29b-41d4-a716-446655440000',
                'Administrador Iglesia',
                'lugarderefugio005@gmail.com',
                'admin',
                true,
                NOW(),
                NOW(),
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                role = 'admin',
                is_active = true,
                updated_at = NOW();
            
            -- Rehabilitar RLS
            SET row_security = on;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        `,
        `
        -- Ejecutar la función de setup
        SELECT setup_admin_profile();
        `
      ];
      
      for (const sql of sqlCommands) {
        console.log('🔧 Ejecutando SQL:', sql.substring(0, 100) + '...');
        
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (sqlError) {
          console.log('❌ Error ejecutando SQL:', sqlError.message);
        } else {
          console.log('✅ SQL ejecutado exitosamente');
        }
      }
      
      return;
    }
    
    console.log('✅ Login exitoso, ID del usuario:', signInData.user?.id);
    
    // Paso 3: Crear perfil de administrador
    console.log('\n👤 Paso 3: Creando perfil de administrador...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: signInData.user?.id,
        name: 'Administrador Iglesia',
        email: adminEmail,
        phone: '',
        role: 'admin',
        is_active: true,
        join_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });
    
    if (profileError) {
      console.log('❌ Error creando perfil:', profileError.message);
    } else {
      console.log('✅ Perfil de administrador creado exitosamente');
    }
    
    // Cerrar sesión
    await supabase.auth.signOut();
    console.log('🚪 Sesión cerrada');
    
  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

// Ejecutar setup
setupAdmin();