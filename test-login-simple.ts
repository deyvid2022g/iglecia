import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configurar Supabase
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

async function testLogin() {
  console.log('🧪 PROBANDO LOGIN DESPUÉS DE CORRECCIÓN RLS');
  console.log('===========================================\n');

  const testCredentials = [
    {
      email: 'lugarderefugio005@gmail.com',
      password: 'L3123406452r',
      name: 'Usuario Admin Principal'
    },
    {
      email: 'camplaygo005@gmail.com', 
      password: 'Y3103031931c',
      name: 'Usuario Admin Alternativo'
    }
  ];

  for (const cred of testCredentials) {
    console.log(`🔐 Probando login con: ${cred.email}`);
    
    try {
      // Intentar login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      });

      if (loginError) {
        console.log(`❌ Error de login: ${loginError.message}`);
        
        // Si el usuario no existe, intentar registrarlo
        if (loginError.message.includes('Invalid login credentials')) {
          console.log(`📝 Intentando registrar usuario: ${cred.email}`);
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: cred.email,
            password: cred.password,
            options: {
              data: {
                full_name: cred.name
              }
            }
          });
          
          if (signUpError) {
            if (signUpError.message.includes('already registered')) {
              console.log(`⚠️  Usuario ya registrado pero no puede hacer login`);
            } else {
              console.log(`❌ Error registrando: ${signUpError.message}`);
            }
          } else {
            console.log(`✅ Usuario registrado exitosamente`);
            console.log(`   ID: ${signUpData.user?.id}`);
            console.log(`   Email confirmado: ${signUpData.user?.email_confirmed_at ? 'Sí' : 'No'}`);
          }
        }
      } else {
        console.log(`✅ LOGIN EXITOSO!`);
        console.log(`   Usuario ID: ${loginData.user?.id}`);
        console.log(`   Email: ${loginData.user?.email}`);
        console.log(`   Email confirmado: ${loginData.user?.email_confirmed_at ? 'Sí' : 'No'}`);
        
        // Verificar perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', loginData.user?.id)
          .single();
        
        if (profileError) {
          console.log(`⚠️  Perfil no encontrado: ${profileError.message}`);
          
          // Intentar crear perfil
          console.log(`📝 Creando perfil...`);
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: loginData.user?.id,
              full_name: cred.name,
              email: cred.email,
              role: 'admin',
              is_active: true
            });
          
          if (createError) {
            console.log(`❌ Error creando perfil: ${createError.message}`);
          } else {
            console.log(`✅ Perfil creado exitosamente`);
          }
        } else {
          console.log(`✅ Perfil encontrado:`);
          console.log(`   Nombre: ${profile.full_name}`);
          console.log(`   Rol: ${profile.role}`);
          console.log(`   Activo: ${profile.is_active}`);
        }
        
        // Cerrar sesión
        await supabase.auth.signOut();
        console.log(`🚪 Sesión cerrada`);
        
        console.log(`\n🎉 ¡LOGIN FUNCIONA CORRECTAMENTE!`);
        console.log(`🌐 Puedes usar estas credenciales en: http://localhost:5173/`);
        console.log(`📧 Email: ${cred.email}`);
        console.log(`🔑 Password: ${cred.password}`);
        return true;
      }
    } catch (error) {
      console.log(`💥 Error inesperado:`, error);
    }
    
    console.log(''); // Línea en blanco
  }
  
  return false;
}

// Ejecutar test
testLogin().then(success => {
  if (success) {
    console.log('\n✨ ¡TEST COMPLETADO - LOGIN FUNCIONA!');
  } else {
    console.log('\n💥 TEST FALLIDO - REVISA LAS INSTRUCCIONES EN INSTRUCCIONES-CORRECCION-LOGIN.md');
    console.log('\n📋 PASOS SIGUIENTES:');
    console.log('1. Ejecuta el SQL en Supabase Dashboard');
    console.log('2. Vuelve a ejecutar este test: npx tsx test-login-simple.ts');
    console.log('3. Si sigue fallando, revisa las variables de entorno');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});