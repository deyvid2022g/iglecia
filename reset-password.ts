import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'lugarderefugio005@gmail.com';

async function resetPassword() {
  console.log('🔄 RESETEANDO CONTRASEÑA DE USUARIO');
  console.log('==================================\n');
  
  try {
    console.log('📧 Enviando email de reset de contraseña a:', ADMIN_EMAIL);
    
    const { data: _data, error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
      redirectTo: 'http://localhost:5173/reset-password'
    });
    
    if (error) {
      console.log('❌ Error enviando reset:', error.message);
      
      // Intentar diferentes enfoques
      console.log('\n🔧 ALTERNATIVAS PARA RESETEAR CONTRASEÑA:');
      console.log('\n1. DESDE EL DASHBOARD DE SUPABASE:');
      console.log('   - Ve a https://supabase.com/dashboard');
      console.log('   - Selecciona tu proyecto');
      console.log('   - Ve a Authentication > Users');
      console.log('   - Busca el usuario:', ADMIN_EMAIL);
      console.log('   - Haz clic en los 3 puntos > "Reset Password"');
      console.log('   - O haz clic en "Send Magic Link"');
      
      console.log('\n2. CREAR NUEVO USUARIO CON EMAIL DIFERENTE:');
      console.log('   - Usa un email temporal como admin@test.com');
      console.log('   - Crea el usuario desde el dashboard');
      console.log('   - Asigna rol de admin en la tabla profiles');
      
      console.log('\n3. USAR CONTRASEÑA TEMPORAL:');
      console.log('   - Desde el dashboard, edita el usuario');
      console.log('   - Establece una contraseña temporal');
      console.log('   - Confirma el email si no está confirmado');
      
      return;
    }
    
    console.log('✅ Email de reset enviado exitosamente!');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Revisa el email en:', ADMIN_EMAIL);
    console.log('2. Haz clic en el enlace de reset');
    console.log('3. Establece una nueva contraseña');
    console.log('4. Usa las nuevas credenciales para hacer login');
    
    console.log('\n⚠️  NOTA IMPORTANTE:');
    console.log('Si no recibes el email, verifica:');
    console.log('- Carpeta de spam/correo no deseado');
    console.log('- Configuración de email en Supabase Dashboard');
    console.log('- Que el email esté confirmado en Authentication > Users');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// También crear una función para verificar el estado del usuario
async function checkUserStatus() {
  console.log('\n🔍 VERIFICANDO ESTADO DEL USUARIO');
  console.log('=================================\n');
  
  try {
    // Verificar en profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();
    
    if (profileError) {
      console.log('❌ Error verificando profile:', profileError.message);
    } else {
      console.log('✅ Usuario en tabla profiles:');
      console.log('   - ID:', profile.id);
      console.log('   - Nombre:', profile.name);
      console.log('   - Email:', profile.email);
      console.log('   - Rol:', profile.role);
      console.log('   - Activo:', profile.is_active);
    }
    
    console.log('\n📋 PARA VERIFICAR EN SUPABASE AUTH:');
    console.log('1. Ve al Dashboard de Supabase');
    console.log('2. Authentication > Users');
    console.log('3. Busca:', ADMIN_EMAIL);
    console.log('4. Verifica que:');
    console.log('   - El usuario existe');
    console.log('   - Email está confirmado (email_confirmed_at)');
    console.log('   - No está bloqueado');
    console.log('   - Tiene una contraseña establecida');
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
  }
}

// Ejecutar ambas funciones
async function main() {
  await checkUserStatus();
  await resetPassword();
}

main().catch(console.error);