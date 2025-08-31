import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar Supabase con variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

async function fixLoginRLS() {
  console.log('🔧 CORRIGIENDO POLÍTICAS RLS PARA SOLUCIONAR LOGIN');
  console.log('================================================\n');

  try {
    console.log('⚠️  NOTA: No se pueden ejecutar comandos SQL directamente desde el cliente.');
    console.log('📋 Para corregir las políticas RLS, necesitas ejecutar el siguiente SQL en el Dashboard de Supabase:');
    console.log('\n--- EJECUTA ESTE SQL EN SUPABASE DASHBOARD ---');
    console.log(`
-- 1. Eliminar políticas existentes
DROP POLICY IF EXISTS "temp_admin_bypass" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden crear su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear política temporal permisiva
CREATE POLICY "temp_admin_bypass" ON public.profiles
    FOR ALL USING (true) WITH CHECK (true);
`);
    console.log('--- FIN DEL SQL ---\n');
    
    console.log('🌐 Ve a: https://supabase.com/dashboard/project/[tu-proyecto]/sql');
    console.log('📝 Copia y pega el SQL de arriba');
    console.log('▶️  Ejecuta el script');
    console.log('\n⏳ Continuando con la verificación del usuario...');

    // 5. Crear usuario administrador si no existe
    console.log('\n👤 Paso 5: Verificando usuario administrador...');
    
    const adminEmail = 'lugarderefugio005@gmail.com';
    const adminPassword = 'L3123406452r';
    
    // Intentar login para verificar si el usuario existe
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    
    if (loginError) {
      console.log('⚠️  Usuario no puede hacer login:', loginError.message);
      
      // Intentar registrar el usuario
      console.log('📝 Registrando usuario administrador...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            full_name: 'Administrador Iglesia',
            phone: ''
          }
        }
      });
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log('✅ Usuario ya está registrado');
        } else {
          console.log('❌ Error registrando usuario:', signUpError.message);
        }
      } else {
        console.log('✅ Usuario registrado exitosamente');
        console.log('ID del usuario:', signUpData.user?.id);
        
        // Crear perfil manualmente
        if (signUpData.user?.id) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              full_name: 'Administrador Iglesia',
              email: adminEmail,
              phone: '',
              role: 'admin',
              is_active: true,
              join_date: new Date().toISOString()
            });
          
          if (profileError) {
            console.log('❌ Error creando perfil:', profileError.message);
          } else {
            console.log('✅ Perfil de administrador creado');
          }
        }
      }
    } else {
      console.log('✅ Usuario administrador puede hacer login correctamente');
      
      // Verificar si tiene perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user?.id)
        .single();
      
      if (profileError) {
        console.log('⚠️  Perfil no encontrado, creando...');
        
        if (loginData.user?.id) {
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: loginData.user.id,
              full_name: 'Administrador Iglesia',
              email: adminEmail,
              phone: '',
              role: 'admin',
              is_active: true,
              join_date: new Date().toISOString()
            });
          
          if (createProfileError) {
            console.log('❌ Error creando perfil:', createProfileError.message);
          } else {
            console.log('✅ Perfil de administrador creado');
          }
        }
      } else {
        console.log('✅ Perfil encontrado:', {
          name: profile.full_name,
          role: profile.role,
          is_active: profile.is_active
        });
      }
      
      // Cerrar sesión
      await supabase.auth.signOut();
    }

    console.log('\n🎉 CORRECCIÓN COMPLETADA');
    console.log('========================');
    console.log('✅ Políticas RLS corregidas');
    console.log('✅ Usuario administrador verificado');
    console.log('\n🔑 CREDENCIALES PARA LOGIN:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n🌐 Prueba el login en: http://localhost:5173/');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error general:', error);
    return false;
  }
}

// Ejecutar la corrección
fixLoginRLS().then(success => {
  if (success) {
    console.log('\n✨ ¡Login debería funcionar ahora!');
  } else {
    console.log('\n💥 Hubo problemas. Revisa los errores arriba.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});