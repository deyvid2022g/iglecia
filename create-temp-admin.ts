import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Usuario temporal para pruebas
const TEMP_EMAIL = 'admin@test.com';
const TEMP_PASSWORD = 'TestAdmin123!';
const TEMP_NAME = 'Administrador Temporal';

async function createTempAdmin() {
  console.log('🔧 CREANDO USUARIO TEMPORAL DE PRUEBA');
  console.log('====================================\n');
  
  try {
    // 1. Registrar usuario temporal
    console.log('👤 1. Registrando usuario temporal...');
    console.log('Email:', TEMP_EMAIL);
    console.log('Password:', TEMP_PASSWORD);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: TEMP_EMAIL,
      password: TEMP_PASSWORD,
      options: {
        data: {
          name: TEMP_NAME,
          role: 'admin'
        }
      }
    });
    
    if (authError) {
      if (authError.message.includes('User already registered')) {
        console.log('ℹ️  Usuario temporal ya existe, intentando login...');
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: TEMP_EMAIL,
          password: TEMP_PASSWORD
        });
        
        if (loginError) {
          console.log('❌ Error de login con usuario temporal:', loginError.message);
          console.log('\n🔧 Intenta eliminar el usuario desde el Dashboard y vuelve a ejecutar este script');
          return;
        } else {
          console.log('✅ Login exitoso con usuario temporal!');
          console.log('   - User ID:', loginData.user?.id);
          
          // Verificar/crear perfil
          if (loginData.user?.id) {
            await ensureProfile(loginData.user.id);
          }
          await supabase.auth.signOut();
          
          console.log('\n🎉 USUARIO TEMPORAL LISTO PARA USAR:');
          console.log('Email:', TEMP_EMAIL);
          console.log('Password:', TEMP_PASSWORD);
          return;
        }
      } else {
        console.log('❌ Error registrando usuario temporal:', authError.message);
        return;
      }
    }
    
    if (authData.user) {
      console.log('✅ Usuario temporal registrado exitosamente!');
      console.log('   - User ID:', authData.user.id);
      console.log('   - Email:', authData.user.email);
      
      // 2. Crear perfil en la tabla profiles
      await ensureProfile(authData.user.id);
      
      console.log('\n🎉 USUARIO TEMPORAL CREADO EXITOSAMENTE!');
      console.log('\n📋 CREDENCIALES PARA LOGIN:');
      console.log('Email:', TEMP_EMAIL);
      console.log('Password:', TEMP_PASSWORD);
      
      if (!authData.user.email_confirmed_at) {
        console.log('\n⚠️  NOTA: Email necesita confirmación');
        console.log('Ve al Dashboard de Supabase > Authentication > Users');
        console.log('Busca el usuario y haz clic en "Confirm email"');
      }
      
      // 3. Probar login inmediatamente
      console.log('\n🧪 3. Probando login con usuario temporal...');
      await testLogin();
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function ensureProfile(userId: string) {
  console.log('\n👤 2. Creando/verificando perfil...');
  
  try {
    // Verificar si ya existe
    const { data: existingProfile, error: _checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (existingProfile) {
      console.log('✅ Perfil ya existe');
      
      // Actualizar rol a admin si no lo es
      if (existingProfile.role !== 'admin') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin', name: TEMP_NAME })
          .eq('id', userId);
        
        if (updateError) {
          console.log('❌ Error actualizando rol:', updateError.message);
        } else {
          console.log('✅ Rol actualizado a admin');
        }
      }
    } else {
      // Crear nuevo perfil
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: TEMP_NAME,
          email: TEMP_EMAIL,
          role: 'admin',
          is_active: true,
          join_date: new Date().toISOString()
        });
      
      if (insertError) {
        console.log('❌ Error creando perfil:', insertError.message);
        
        // Si es error de RLS, intentar con upsert
        if (insertError.message.includes('row-level security')) {
          console.log('🔧 Intentando con upsert debido a RLS...');
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              name: TEMP_NAME,
              email: TEMP_EMAIL,
              role: 'admin',
              is_active: true,
              join_date: new Date().toISOString()
            });
          
          if (upsertError) {
            console.log('❌ Error con upsert:', upsertError.message);
          } else {
            console.log('✅ Perfil creado con upsert');
          }
        }
      } else {
        console.log('✅ Perfil creado exitosamente');
      }
    }
  } catch (error) {
    console.log('❌ Error manejando perfil:', error);
  }
}

async function testLogin() {
  try {
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: TEMP_EMAIL,
      password: TEMP_PASSWORD
    });
    
    if (loginError) {
      console.log('❌ Error en prueba de login:', loginError.message);
    } else {
      console.log('✅ Prueba de login exitosa!');
      console.log('   - User ID:', loginData.user?.id);
      console.log('   - Email confirmado:', loginData.user?.email_confirmed_at ? 'Sí' : 'No');
      
      // Cerrar sesión
      await supabase.auth.signOut();
      console.log('✅ Sesión cerrada');
    }
  } catch (error) {
    console.log('❌ Error en prueba de login:', error);
  }
}

createTempAdmin().catch(console.error);