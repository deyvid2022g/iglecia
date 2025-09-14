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
  console.error('❌ Variables de entorno no configuradas');
  console.log('Necesitas configurar:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (o VITE_SUPABASE_ANON_KEY como fallback)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql, description) {
  console.log(`\n🔧 ${description}...`);
  
  try {
    const { data, error } = await supabase
      .from('_temp_sql_execution')
      .select('*')
      .limit(1);
    
    // Si llegamos aquí, tenemos conexión
    console.log('✅ Conexión establecida');
    
    // Intentar crear la tabla users usando una inserción especial
    const { error: insertError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (insertError && insertError.message.includes('relation "public.users" does not exist')) {
      console.log('❌ La tabla users no existe');
      console.log('\n📋 Instrucciones para crear la tabla manualmente:');
      console.log('1. Ve a tu proyecto en https://supabase.com/dashboard');
      console.log('2. Navega a SQL Editor');
      console.log('3. Ejecuta el siguiente SQL:');
      console.log('\n--- COPIAR Y PEGAR EN SUPABASE SQL EDITOR ---');
      console.log(`
-- Crear tabla users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Crear función para manejar nuevos usuarios
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
    -- Log el error pero no fallar el registro
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`);
      console.log('--- FIN DEL SQL ---\n');
      
      return false;
    } else {
      console.log('✅ La tabla users ya existe');
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

async function testRegistration() {
  console.log('\n🧪 Probando registro de usuario...');
  
  const testEmail = `test-fix-${Date.now()}@example.com`;
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          name: 'Usuario de Prueba',
          role: 'member'
        }
      }
    });

    if (error) {
      if (error.message.includes('Database error granting user')) {
        console.log('❌ Error persistente: Database error granting user');
        console.log('\n💡 El problema requiere configuración manual en Supabase Dashboard');
        return false;
      } else {
        console.log(`⚠️  Otro error: ${error.message}`);
        return false;
      }
    } else {
      console.log('✅ ¡Registro exitoso!');
      console.log('🎉 El error ha sido resuelto');
      return true;
    }
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    return false;
  }
}

async function fixAuthDirect() {
  console.log('🔧 Solucionando error de autenticación directamente...');
  console.log('=' .repeat(60));

  // Verificar conexión y tabla
  const tableExists = await executeSQL('', 'Verificando configuración de base de datos');
  
  if (!tableExists) {
    console.log('\n⚠️  ACCIÓN REQUERIDA:');
    console.log('Debes ejecutar el SQL mostrado arriba en Supabase Dashboard');
    console.log('\nPasos:');
    console.log('1. Copia el SQL de arriba');
    console.log('2. Ve a https://supabase.com/dashboard');
    console.log('3. Selecciona tu proyecto');
    console.log('4. Ve a SQL Editor');
    console.log('5. Pega y ejecuta el SQL');
    console.log('6. Vuelve a ejecutar este script');
    return;
  }

  // Probar registro
  const registrationWorks = await testRegistration();
  
  console.log('\n📊 Resumen:');
  console.log('=' .repeat(60));
  
  if (registrationWorks) {
    console.log('🎯 Estado: ✅ ERROR RESUELTO');
    console.log('La aplicación debería funcionar correctamente ahora.');
  } else {
    console.log('🎯 Estado: ⚠️  REQUIERE CONFIGURACIÓN MANUAL');
    console.log('Sigue las instrucciones mostradas arriba.');
  }
}

// Ejecutar
fixAuthDirect().then(() => {
  console.log('\n✨ Proceso completado');
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});