import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

// Cliente normal para pruebas de usuario
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔧 CONFIGURACIÓN DETECTADA:');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Configurada ✅' : 'No configurada ❌');
console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada ✅' : 'No configurada ❌');
console.log('');

async function diagnosticoCompleto() {
  console.log('🔍 DIAGNÓSTICO AVANZADO RLS');
  console.log('============================\n');

  // 1. Verificar conexión básica
  console.log('1️⃣ VERIFICANDO CONEXIÓN BÁSICA...');
  try {
    const { data: _data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.log('❌ Error de conexión:', error.message);
      console.log('🔍 Código de error:', error.code);
      console.log('🔍 Detalles:', error.details);
      console.log('🔍 Hint:', error.hint);
    } else {
      console.log('✅ Conexión exitosa\n');
    }
  } catch (err) {
    console.log('❌ Error de conexión:', err);
  }

  // 2. Intentar acceso directo a profiles
  console.log('\n2️⃣ PROBANDO ACCESO DIRECTO A PROFILES...');
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Error accediendo a profiles:', profilesError.message);
      console.log('🔍 Código de error:', profilesError.code);
      console.log('🔍 Detalles:', profilesError.details);
    } else {
      console.log('✅ Acceso a profiles exitoso');
      console.log('📊 Registros encontrados:', profiles?.length || 0);
    }
  } catch (err) {
    console.log('❌ Error accediendo a profiles:', err);
  }

  // 3. Intentar crear un registro de prueba
  console.log('\n3️⃣ PROBANDO INSERCIÓN DE REGISTRO DE PRUEBA...');
  try {
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user'
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Error insertando registro de prueba:', insertError.message);
      console.log('🔍 Código de error:', insertError.code);
      console.log('🔍 Detalles:', insertError.details);
    } else {
      console.log('✅ Inserción exitosa:', insertData);
      
      // Limpiar el registro de prueba
      await supabase.from('profiles').delete().eq('email', 'test@example.com');
      console.log('🧹 Registro de prueba eliminado');
    }
  } catch (err) {
    console.log('❌ Error en inserción de prueba:', err);
  }

  // 4. Probar login con usuario normal
  console.log('\n4️⃣ PROBANDO LOGIN CON USUARIO NORMAL...');
  try {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'lugarderefugio005@gmail.com',
      password: 'LugarDeRefugio2024!'
    });
    
    if (loginError) {
      console.log('❌ Error de login:', loginError.message);
      console.log('🔍 Código de error:', loginError.code || 'N/A');
      console.log('🔍 Detalles completos:', JSON.stringify(loginError, null, 2));
    } else {
      console.log('✅ Login exitoso');
      console.log('👤 Usuario logueado:', loginData.user?.email);
      
      // Probar acceso a profiles después del login
      console.log('\n5️⃣ PROBANDO ACCESO A PROFILES DESPUÉS DEL LOGIN...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', loginData.user?.email)
        .single();
      
      if (profileError) {
        console.log('❌ Error accediendo a profile:', profileError.message);
        console.log('🔍 Código de error:', profileError.code);
      } else {
        console.log('✅ Acceso a profile exitoso:', profileData);
      }
      
      // Cerrar sesión
      await supabase.auth.signOut();
      console.log('🚪 Sesión cerrada');
    }
  } catch (err) {
    console.log('❌ Error en prueba de login:', err);
  }

  console.log('\n🏁 DIAGNÓSTICO COMPLETADO');
  console.log('==========================');
  console.log('\n💡 ANÁLISIS BASADO EN LOS ERRORES:');
  console.log('\n🔍 Si ves errores como:');
  console.log('   • "permission denied for table profiles" → RLS está bloqueando el acceso');
  console.log('   • "Database error granting user" → Problema en el proceso de autenticación');
  console.log('   • "row-level security policy" → Las políticas RLS son muy restrictivas');
  console.log('\n🛠️ SOLUCIONES RECOMENDADAS:');
  console.log('1. Ejecutar TODOS los comandos SQL de SOLUCION-EMERGENCIA-RLS.md en Supabase Dashboard');
  console.log('2. Verificar que la política "temp_admin_bypass" se haya creado correctamente');
  console.log('3. Si persiste, puede ser necesario recrear la tabla profiles');
  console.log('4. Considerar deshabilitar RLS temporalmente para diagnóstico');
  console.log('\n⚠️ NOTA: Sin clave de servicio, el diagnóstico es limitado');
  console.log('   Para diagnóstico completo, configura SUPABASE_SERVICE_ROLE_KEY en .env');
}

diagnosticoCompleto().catch(console.error);