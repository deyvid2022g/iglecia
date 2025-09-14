import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function fixTriggerIssue() {
  console.log('🔧 Reparando problema del trigger...');
  
  try {
    // 1. Eliminar trigger existente si existe
    console.log('\n1. Eliminando trigger existente...');
    const dropTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropTriggerSQL 
    });
    
    if (dropError) {
      console.log('⚠️  Error eliminando trigger (puede no existir):', dropError.message);
    } else {
      console.log('✅ Trigger eliminado');
    }
    
    // 2. Eliminar función existente si existe
    console.log('\n2. Eliminando función existente...');
    const dropFunctionSQL = `
      DROP FUNCTION IF EXISTS public.handle_new_user();
    `;
    
    const { error: dropFuncError } = await supabase.rpc('exec_sql', { 
      sql: dropFunctionSQL 
    });
    
    if (dropFuncError) {
      console.log('⚠️  Error eliminando función:', dropFuncError.message);
    } else {
      console.log('✅ Función eliminada');
    }
    
    // 3. Crear nueva función mejorada
    console.log('\n3. Creando nueva función handle_new_user...');
    const createFunctionSQL = `
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
    `;
    
    const { error: createFuncError } = await supabase.rpc('exec_sql', { 
      sql: createFunctionSQL 
    });
    
    if (createFuncError) {
      console.log('❌ Error creando función:', createFuncError.message);
      return;
    } else {
      console.log('✅ Función creada exitosamente');
    }
    
    // 4. Crear nuevo trigger
    console.log('\n4. Creando nuevo trigger...');
    const createTriggerSQL = `
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;
    
    const { error: createTriggerError } = await supabase.rpc('exec_sql', { 
      sql: createTriggerSQL 
    });
    
    if (createTriggerError) {
      console.log('❌ Error creando trigger:', createTriggerError.message);
      return;
    } else {
      console.log('✅ Trigger creado exitosamente');
    }
    
    console.log('\n🎉 Reparación completada. Probando registro...');
    
    // 5. Probar registro
    const testEmail = `test${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          full_name: 'Usuario Test Reparado'
        }
      }
    });
    
    if (error) {
      console.log('❌ Aún hay error en el registro:', error.message);
    } else {
      console.log('✅ ¡Registro exitoso! El problema está resuelto.');
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
    
    // Mostrar SQL manual como alternativa
    console.log('\n📋 Si el script automático falla, ejecuta este SQL manualmente en Supabase:');
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
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`);
  }
}

fixTriggerIssue().catch(console.error);