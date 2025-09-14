import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixDatabaseConfig() {
  console.log('🔧 Corrigiendo configuración de la base de datos...');
  console.log('=' .repeat(60));

  try {
    // Verificar si la tabla users existe
    console.log('\n📋 Verificando tabla users...');
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');

    if (tableError) {
      console.log('❌ Error verificando tabla:', tableError.message);
      console.log('\n📝 Necesitas ejecutar el script SQL manualmente:');
      console.log('1. Ve a tu proyecto en supabase.com');
      console.log('2. Navega a SQL Editor');
      console.log('3. Ejecuta el contenido del archivo setup_supabase_complete.sql');
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('❌ La tabla users no existe');
      console.log('\n📝 Ejecuta este SQL en tu panel de Supabase:');
      console.log(getCreateTableSQL());
      return;
    }

    console.log('✅ Tabla users existe');

    // Verificar políticas RLS
    console.log('\n🔒 Verificando políticas RLS...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('policyname')
      .eq('schemaname', 'public')
      .eq('tablename', 'users');

    if (policyError) {
      console.log('⚠️  No se pudieron verificar las políticas:', policyError.message);
    } else {
      console.log(`✅ Encontradas ${policies?.length || 0} políticas RLS`);
      
      const requiredPolicies = [
        'Users can view own profile',
        'Users can update own profile', 
        'Enable insert for authenticated users'
      ];
      
      const existingPolicies = policies?.map(p => p.policyname) || [];
      const missingPolicies = requiredPolicies.filter(policy => 
        !existingPolicies.some(existing => existing.includes(policy.toLowerCase().replace(/\s+/g, '_')))
      );
      
      if (missingPolicies.length > 0) {
        console.log('❌ Políticas faltantes:', missingPolicies);
        console.log('\n📝 Ejecuta este SQL para agregar las políticas faltantes:');
        console.log(getMissingPoliciesSQL());
      } else {
        console.log('✅ Todas las políticas necesarias están presentes');
      }
    }

    // Verificar función handle_new_user
    console.log('\n⚙️  Verificando función handle_new_user...');
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'handle_new_user');

    if (funcError) {
      console.log('⚠️  No se pudo verificar la función:', funcError.message);
    } else if (!functions || functions.length === 0) {
      console.log('❌ Función handle_new_user no existe');
      console.log('\n📝 Ejecuta este SQL para crear la función:');
      console.log(getHandleNewUserSQL());
    } else {
      console.log('✅ Función handle_new_user existe');
    }

    // Verificar trigger
    console.log('\n🔄 Verificando trigger on_auth_user_created...');
    const { data: triggers, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('tgname')
      .eq('tgname', 'on_auth_user_created');

    if (triggerError) {
      console.log('⚠️  No se pudo verificar el trigger:', triggerError.message);
    } else if (!triggers || triggers.length === 0) {
      console.log('❌ Trigger on_auth_user_created no existe');
      console.log('\n📝 Ejecuta este SQL para crear el trigger:');
      console.log(getTriggerSQL());
    } else {
      console.log('✅ Trigger on_auth_user_created existe');
    }

    console.log('\n🎉 Verificación completada!');
    console.log('\n💡 Si sigues teniendo errores:');
    console.log('1. Ejecuta el archivo setup_supabase_complete.sql completo');
    console.log('2. Espera 22 segundos entre intentos de login/registro');
    console.log('3. Verifica que tu proyecto de Supabase esté activo');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

function getCreateTableSQL() {
  return `
-- Crear tabla users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
`;
}

function getMissingPoliciesSQL() {
  return `
-- Políticas RLS para la tabla users
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'pastor')
    )
  );

CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
`;
}

function getHandleNewUserSQL() {
  return `
-- Función para crear automáticamente un registro en users
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
`;
}

function getTriggerSQL() {
  return `
-- Trigger para ejecutar la función cuando se crea un nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  fixDatabaseConfig();
}

export { fixDatabaseConfig };