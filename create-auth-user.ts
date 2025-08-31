import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'lugarderefugio005@gmail.com';
const ADMIN_PASSWORD = 'LugarRefugio2024!'; // Contraseña segura
const ADMIN_NAME = 'Administrador';

async function createAuthUser() {
  console.log('🔧 CREANDO USUARIO EN SUPABASE AUTH');
  console.log('===================================\n');
  
  try {
    // 1. Verificar si el usuario ya existe en profiles
    console.log('👤 1. Verificando usuario existente en profiles...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.log('❌ Error verificando perfil:', profileError.message);
      return;
    }
    
    if (existingProfile) {
      console.log('✅ Usuario encontrado en profiles con ID:', existingProfile.id);
    } else {
      console.log('ℹ️  Usuario no encontrado en profiles');
    }
    
    // 2. Intentar registrar usuario en Auth
    console.log('\n🔑 2. Registrando usuario en Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        data: {
          name: ADMIN_NAME,
          role: 'admin'
        }
      }
    });
    
    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('ℹ️  Usuario ya existe en Auth, intentando login...');
        
        // Intentar login para verificar credenciales
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });
        
        if (loginError) {
          console.log('❌ Error de login:', loginError.message);
          console.log('\n🔧 SOLUCIONES POSIBLES:');
          console.log('1. Resetear contraseña desde el Dashboard de Supabase');
          console.log('2. Usar una contraseña diferente');
          console.log('3. Verificar que el email esté confirmado');
          return;
        } else {
          console.log('✅ Login exitoso con credenciales existentes!');
          console.log('   - User ID:', loginData.user?.id);
          
          // Verificar sincronización con profiles
          await checkProfileSync(loginData.user?.id, existingProfile);
          await supabase.auth.signOut();
          return;
        }
      } else {
        console.log('❌ Error registrando usuario:', authError.message);
        return;
      }
    }
    
    if (authData.user) {
      console.log('✅ Usuario registrado exitosamente en Auth!');
      console.log('   - User ID:', authData.user.id);
      console.log('   - Email:', authData.user.email);
      console.log('   - Confirmación requerida:', !authData.user.email_confirmed_at);
      
      // 3. Sincronizar con tabla profiles
      await syncWithProfiles(authData.user.id, existingProfile);
      
      // 4. Confirmar email automáticamente (solo para desarrollo)
      if (!authData.user.email_confirmed_at) {
        console.log('\n📧 NOTA: El email necesita confirmación.');
        console.log('Para desarrollo, puedes:');
        console.log('1. Ir al Dashboard de Supabase > Authentication > Users');
        console.log('2. Buscar el usuario y hacer clic en "Confirm email"');
        console.log('3. O configurar auto-confirmación en Settings > Authentication');
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function checkProfileSync(authUserId: string, existingProfile: any) {
  console.log('\n🔄 3. Verificando sincronización Auth <-> Profiles...');
  
  if (existingProfile) {
    if (existingProfile.id === authUserId) {
      console.log('✅ IDs sincronizados correctamente');
      
      // Actualizar rol a admin si no lo es
      if (existingProfile.role !== 'admin') {
        console.log('🔧 Actualizando rol a admin...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin', name: ADMIN_NAME })
          .eq('id', authUserId);
        
        if (updateError) {
          console.log('❌ Error actualizando rol:', updateError.message);
        } else {
          console.log('✅ Rol actualizado a admin');
        }
      }
    } else {
      console.log('⚠️  IDs no coinciden:');
      console.log('   Auth ID:', authUserId);
      console.log('   Profile ID:', existingProfile.id);
      console.log('   Se necesita corrección manual');
    }
  }
}

async function syncWithProfiles(authUserId: string, existingProfile: any) {
  console.log('\n🔄 3. Sincronizando con tabla profiles...');
  
  if (existingProfile) {
    // Actualizar perfil existente con el ID correcto
    console.log('🔧 Actualizando perfil existente...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        id: authUserId,
        role: 'admin',
        name: ADMIN_NAME
      })
      .eq('email', ADMIN_EMAIL);
    
    if (updateError) {
      console.log('❌ Error actualizando perfil:', updateError.message);
    } else {
      console.log('✅ Perfil actualizado con ID de Auth');
    }
  } else {
    // Crear nuevo perfil
    console.log('🆕 Creando nuevo perfil...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: authUserId,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: 'admin',
        is_active: true,
        join_date: new Date().toISOString()
      });
    
    if (insertError) {
      console.log('❌ Error creando perfil:', insertError.message);
    } else {
      console.log('✅ Perfil creado exitosamente');
    }
  }
}

console.log('🔐 CREDENCIALES PARA LOGIN:');
console.log('Email:', ADMIN_EMAIL);
console.log('Password:', ADMIN_PASSWORD);
console.log('\nGuarda estas credenciales para hacer login en la aplicación.\n');

createAuthUser().catch(console.error);