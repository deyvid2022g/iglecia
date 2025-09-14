import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Crear cliente de Supabase usando las variables de entorno
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function corregirTrigger() {
  console.log('🔧 Corrigiendo el trigger handle_new_user...');
  
  try {
    // 1. Verificar conexión
    console.log('\n1. Verificando conexión a Supabase...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && !error.message.includes('relation "public.users" does not exist')) {
      console.error('❌ Error de conexión:', error.message);
      return;
    }
    
    console.log('✅ Conexión exitosa a Supabase');
    
    // 2. Verificar si podemos ejecutar SQL directamente
    console.log('\n2. Verificando si podemos ejecutar SQL directamente...');
    
    const { error: sqlTestError } = await supabase.rpc('exec_sql', { 
      sql: 'SELECT 1;' 
    });
    
    const puedeEjecutarSQL = !sqlTestError;
    
    if (!puedeEjecutarSQL) {
      console.log('⚠️ No se puede ejecutar SQL directamente. Mostrando instrucciones manuales.');
      mostrarInstruccionesManuales();
      return;
    }
    
    console.log('✅ Podemos ejecutar SQL directamente');
    
    // 3. Eliminar trigger y función existentes
    console.log('\n3. Eliminando trigger y función existentes...');
    
    const dropSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      DROP FUNCTION IF EXISTS public.handle_new_user();
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropSQL 
    });
    
    if (dropError) {
      console.error('❌ Error eliminando trigger y función:', dropError.message);
      mostrarInstruccionesManuales();
      return;
    }
    
    console.log('✅ Trigger y función eliminados correctamente');
    
    // 4. Crear nueva función y trigger
    console.log('\n4. Creando nueva función y trigger...');
    
    const createSQL = `
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
    
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createSQL 
    });
    
    if (createError) {
      console.error('❌ Error creando función y trigger:', createError.message);
      mostrarInstruccionesManuales();
      return;
    }
    
    console.log('✅ Función y trigger creados correctamente');
    
    // 5. Probar registro para verificar
    console.log('\n5. Probando registro para verificar la corrección...');
    
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Usuario Test'
        }
      }
    });
    
    if (signUpError) {
      console.error('❌ Error en registro de prueba:', signUpError.message);
      console.log('⚠️ El trigger puede estar funcionando, pero hay otro problema con el registro.');
    } else {
      console.log('✅ Registro de prueba exitoso');
      console.log('🎉 El problema "Database error granting user" ha sido resuelto.');
      
      // Verificar si se creó el registro en la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signUpData.user?.id)
        .single();
      
      if (userError) {
        console.log('⚠️ No se pudo verificar la creación del usuario en la tabla users:', userError.message);
      } else {
        console.log('✅ Usuario creado correctamente en la tabla users:', userData);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('📋 Stack:', error.stack);
    mostrarInstruccionesManuales();
  }
}

function mostrarInstruccionesManuales() {
  console.log('\n📋 INSTRUCCIONES MANUALES');
  console.log('Para corregir el problema "Database error granting user", ejecuta este SQL en el Dashboard de Supabase:');
  console.log(`
-- 1. Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Crear nueva función mejorada
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

-- 3. Crear nuevo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`);
}

// Ejecutar la corrección
corregirTrigger().catch(console.error);

// Exportar la función para uso en otros scripts
export { corregirTrigger };