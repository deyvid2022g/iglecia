import { createClient } from '@supabase/supabase-js';

// Credenciales directas para prueba
const supabaseUrl = 'https://toopbtydsiepeoisuecg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3BidHlkc2llcGVvaXN1ZWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzY0MDQsImV4cCI6MjA3MjA1MjQwNH0.ckYKpJDfqhbQ4mnZNDBBdR3Qd63VaS1jOhSIW3_SE8g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Script para diagnosticar y solucionar problemas de autenticación
async function diagnoseAndFix() {
  console.log('🔍 Diagnosticando problema de autenticación...');
  
  const email = 'lugarderefugio005@gmail.com';
  const password = 'L3123406452r';
  
  try {
    // Paso 1: Intentar registrar el usuario (esto debería fallar si ya existe)
    console.log('\n📝 Paso 1: Verificando si el usuario necesita ser registrado...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Administrador Iglesia',
          phone: ''
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ Usuario ya está registrado, continuando...');
      } else {
        console.error('❌ Error en registro:', signUpError.message);
      }
    } else {
      console.log('✅ Usuario registrado exitosamente');
      console.log('ID del usuario:', signUpData.user?.id);
    }
    
    // Paso 2: Intentar login
    console.log('\n🔑 Paso 2: Intentando login...');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (loginError) {
      console.error('❌ Error de login:', loginError.message);
      console.error('Código:', loginError.status);
      
      // Si hay error de base de datos, intentar crear el perfil manualmente
      if (loginError.message.includes('Database error')) {
        console.log('\n🛠️  Detectado error de base de datos, intentando solución...');
        
        // Intentar obtener el ID del usuario de otra manera
        console.log('Intentando obtener información del usuario...');
        
        // Crear perfil manualmente usando un ID temporal
        const tempUserId = '00000000-0000-0000-0000-000000000000';
        console.log('\n👤 Creando perfil de administrador...');
        
        const { error: profileError } = await supabase
           .from('profiles')
           .upsert({
             id: tempUserId,
             name: 'Administrador Iglesia',
             email: email,
             phone: '',
             role: 'admin',
             is_active: true,
             join_date: new Date().toISOString(),
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString()
           });
          
        if (profileError) {
          console.error('❌ Error creando perfil:', profileError.message);
        } else {
          console.log('✅ Perfil de administrador creado');
        }
      }
      
    } else {
      console.log('✅ Login exitoso!');
      console.log('Usuario:', {
        id: loginData.user?.id,
        email: loginData.user?.email,
        email_confirmed_at: loginData.user?.email_confirmed_at
      });
      
      // Verificar/crear perfil
      console.log('\n👤 Verificando perfil...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user?.id)
        .single();
        
      if (profileError) {
        console.log('❌ Perfil no encontrado, creando...');
        
        const { error: createError } = await supabase
           .from('profiles')
           .insert({
             id: loginData.user?.id,
             name: 'Administrador Iglesia',
             email: email,
             phone: '',
             role: 'admin',
             is_active: true,
             join_date: new Date().toISOString(),
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString()
           });
          
        if (createError) {
          console.error('❌ Error creando perfil:', createError.message);
        } else {
          console.log('✅ Perfil de administrador creado exitosamente');
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
      console.log('🚪 Sesión cerrada');
    }
    
  } catch (err) {
    console.error('💥 Error inesperado:', err);
  }
}

// Ejecutar diagnóstico
diagnoseAndFix();