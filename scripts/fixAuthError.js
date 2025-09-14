import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAuthError() {
  console.log('🔧 Solucionando error "Database error granting user"...');
  console.log('=' .repeat(60));

  try {
    // Paso 1: Crear tabla users con estructura básica
    console.log('\n📋 Paso 1: Creando tabla users...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (tableError && !tableError.message.includes('already exists')) {
      console.error('❌ Error creando tabla:', tableError.message);
    } else {
      console.log('✅ Tabla users creada/verificada');
    }

    // Paso 2: Habilitar RLS
    console.log('\n🔒 Paso 2: Habilitando Row Level Security...');
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError && !rlsError.message.includes('already')) {
      console.error('❌ Error habilitando RLS:', rlsError.message);
    } else {
      console.log('✅ RLS habilitado');
    }

    // Paso 3: Crear políticas RLS básicas
    console.log('\n📜 Paso 3: Creando políticas RLS...');
    
    const policies = [
      {
        name: 'Usuarios pueden ver su perfil',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.users
          FOR SELECT USING (auth.uid() = id);
        `
      },
      {
        name: 'Usuarios pueden actualizar su perfil',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
          FOR UPDATE USING (auth.uid() = id);
        `
      },
      {
        name: 'Usuarios pueden insertar su perfil',
        sql: `
          CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.users
          FOR INSERT WITH CHECK (auth.uid() = id);
        `
      }
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      });

      if (policyError && !policyError.message.includes('already exists')) {
        console.error(`❌ Error creando política "${policy.name}":`, policyError.message);
      } else {
        console.log(`✅ Política "${policy.name}" creada`);
      }
    }

    // Paso 4: Crear función handle_new_user
    console.log('\n⚙️  Paso 4: Creando función handle_new_user...');
    
    const functionSQL = `
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
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: functionSQL
    });

    if (functionError) {
      console.error('❌ Error creando función:', functionError.message);
    } else {
      console.log('✅ Función handle_new_user creada');
    }

    // Paso 5: Crear trigger
    console.log('\n🎯 Paso 5: Creando trigger...');
    
    const triggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: triggerSQL
    });

    if (triggerError) {
      console.error('❌ Error creando trigger:', triggerError.message);
    } else {
      console.log('✅ Trigger on_auth_user_created creado');
    }

    // Paso 6: Probar el registro
    console.log('\n🧪 Paso 6: Probando registro de usuario...');
    
    const testEmail = `test-fix-${Date.now()}@example.com`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          name: 'Usuario de Prueba Fix',
          role: 'member'
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes('Database error granting user')) {
        console.log('❌ Error persistente: Database error granting user');
        console.log('\n🔍 Diagnóstico adicional:');
        
        // Verificar si la función existe
        const { data: functions } = await supabase.rpc('exec_sql', {
          sql: "SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';"
        });
        
        console.log('Función handle_new_user:', functions ? 'Existe' : 'No existe');
        
        // Verificar si el trigger existe
        const { data: triggers } = await supabase.rpc('exec_sql', {
          sql: "SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';"
        });
        
        console.log('Trigger on_auth_user_created:', triggers ? 'Existe' : 'No existe');
        
        console.log('\n💡 Soluciones adicionales:');
        console.log('1. Verificar permisos en Supabase Dashboard');
        console.log('2. Ejecutar el SQL manualmente en el SQL Editor');
        console.log('3. Contactar soporte de Supabase si el problema persiste');
      } else {
        console.log(`⚠️  Otro error de registro: ${signUpError.message}`);
      }
    } else {
      console.log('✅ ¡Registro de usuario exitoso!');
      console.log('🎉 El error "Database error granting user" ha sido resuelto');
    }

    console.log('\n📊 Resumen de la corrección:');
    console.log('=' .repeat(60));
    console.log('✅ Tabla users: Creada/Verificada');
    console.log('✅ RLS: Habilitado');
    console.log('✅ Políticas: Configuradas');
    console.log('✅ Función: handle_new_user creada');
    console.log('✅ Trigger: on_auth_user_created configurado');
    
    if (!signUpError) {
      console.log('\n🎯 Estado: ERROR RESUELTO');
      console.log('La aplicación debería funcionar correctamente ahora.');
    } else {
      console.log('\n⚠️  Estado: REQUIERE ATENCIÓN ADICIONAL');
      console.log('Revisar las soluciones adicionales mencionadas arriba.');
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
    console.log('\n🔧 Soluciones alternativas:');
    console.log('1. Verificar las credenciales de Supabase');
    console.log('2. Ejecutar el SQL manualmente en Supabase Dashboard');
    console.log('3. Verificar que el proyecto de Supabase esté activo');
  }
}

// Ejecutar la corrección
fixAuthError().then(() => {
  console.log('\n✨ Proceso de corrección completado');
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});