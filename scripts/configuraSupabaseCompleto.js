import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Crear cliente de Supabase usando las variables de entorno
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function configurarSupabase() {
  console.log('🚀 Iniciando configuración completa de Supabase...');
  
  try {
    // 1. Verificar conexión
    console.log('\n1. Verificando conexión a Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.message.includes('relation "public.users" does not exist')) {
      console.log('⚠️ La tabla users no existe. Vamos a crearla.');
    } else if (error && !error.message.includes('relation "public.users" does not exist')) {
      console.error('❌ Error de conexión:', error.message);
      return;
    } else {
      console.log('✅ Conexión exitosa a Supabase');
      console.log('⚠️ La tabla users ya existe. Verificando configuración...');
    }
    
    // 2. Ejecutar SQL para configurar la base de datos
    console.log('\n2. Configurando base de datos...');
    
    // Crear tabla users si no existe
    const createUsersTableSQL = `
      -- Crear tabla users si no existe
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'pastor', 'leader', 'member')),
        phone TEXT,
        address TEXT,
        birth_date DATE,
        membership_date DATE DEFAULT CURRENT_DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createTableError } = await supabase.rpc('exec_sql', { 
      sql: createUsersTableSQL 
    });
    
    if (createTableError) {
      if (createTableError.message.includes('function "exec_sql" does not exist')) {
        console.log('⚠️ La función exec_sql no existe. Intentando método alternativo...');
        
        // Método alternativo: usar la API REST para ejecutar SQL
        const { error: tableCheckError } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        if (tableCheckError && tableCheckError.message.includes('relation "public.users" does not exist')) {
          console.log('❌ La tabla users no existe y no se puede crear automáticamente.');
          console.log('📋 Por favor, ejecuta manualmente el siguiente SQL en el Dashboard de Supabase:');
          console.log(createUsersTableSQL);
          console.log('\n📋 Luego ejecuta el SQL para RLS y triggers:');
          console.log(getRLSAndTriggersSQL());
          return;
        } else {
          console.log('✅ La tabla users ya existe');
        }
      } else {
        console.error('❌ Error creando tabla users:', createTableError.message);
        return;
      }
    } else {
      console.log('✅ Tabla users creada o ya existente');
      
      // Configurar RLS y triggers
      console.log('\n3. Configurando RLS y triggers...');
      
      const rlsAndTriggersSQL = getRLSAndTriggersSQL();
      
      const { error: rlsError } = await supabase.rpc('exec_sql', { 
        sql: rlsAndTriggersSQL 
      });
      
      if (rlsError) {
        console.error('❌ Error configurando RLS y triggers:', rlsError.message);
        console.log('📋 Por favor, ejecuta manualmente el siguiente SQL en el Dashboard de Supabase:');
        console.log(rlsAndTriggersSQL);
      } else {
        console.log('✅ RLS y triggers configurados correctamente');
      }
    }
    
    // 4. Verificar configuración
    console.log('\n4. Verificando configuración final...');
    
    // Verificar tabla users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error verificando tabla users:', usersError.message);
    } else {
      console.log('✅ Tabla users accesible');
    }
    
    // Verificar si hay usuarios admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Error verificando usuarios admin:', adminError.message);
    } else if (adminData && adminData.length === 0) {
      console.log('⚠️ No hay usuarios admin. Considera crear uno.');
    } else {
      console.log('✅ Existe al menos un usuario admin');
    }
    
    console.log('\n🎉 Configuración completada. El sistema debería funcionar correctamente ahora.');
    console.log('📝 Si sigues teniendo problemas, ejecuta el SQL manualmente en el Dashboard de Supabase.');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('📋 Stack:', error.stack);
  }
}

// Función para obtener el SQL de RLS y triggers
function getRLSAndTriggersSQL() {
  return `
    -- Habilitar RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Eliminar políticas existentes si existen
    DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
    DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
    DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
    DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.users;
    
    -- Crear políticas RLS
    CREATE POLICY "Users can view own profile" ON public.users
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own profile" ON public.users
      FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Admins can view all users" ON public.users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    CREATE POLICY "Admins can update all users" ON public.users
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    CREATE POLICY "Allow insert for authenticated users" ON public.users
      FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Eliminar trigger y función existentes si existen
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user();
    
    -- Crear función trigger mejorada
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Verificar que el usuario no existe ya en la tabla
      IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        INSERT INTO public.users (id, email, full_name)
        VALUES (
          NEW.id, 
          NEW.email, 
          COALESCE(NEW.raw_user_meta_data->>'full_name', '')
        );
      END IF;
      RETURN NEW;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log el error pero no fallar el registro
        RAISE WARNING 'Error creating user record: %', SQLERRM;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Crear trigger
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;
}

// Ejecutar la configuración
configurarSupabase().catch(console.error);

// Exportar la función para uso en otros scripts
export { configurarSupabase };