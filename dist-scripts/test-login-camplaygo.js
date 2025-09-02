import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
// Cliente con clave anon
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function testLogin() {
    const email = 'camplaygo005@gmail.com';
    const password = 'Y3103031931c';
    console.log('🧪 Probando login con las credenciales correctas...');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    try {
        // Intentar login
        console.log('\n🔄 Intentando autenticación...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        if (loginError) {
            console.error('❌ Error en login:', loginError.message);
            if (loginError.message.includes('Invalid login credentials')) {
                console.log('\n💡 Posibles causas:');
                console.log('   1. El usuario no existe en Supabase Auth');
                console.log('   2. La contraseña es incorrecta');
                console.log('   3. El email no está confirmado');
                console.log('\n🔧 Soluciones:');
                console.log('   1. Crear el usuario en Dashboard > Authentication > Users');
                console.log('   2. Verificar que el email esté confirmado');
                console.log('   3. Usar la contraseña exacta: Y3103031931c');
            }
            else if (loginError.message.includes('Email not confirmed')) {
                console.log('\n📧 El email no está confirmado.');
                console.log('🔧 Ve al Dashboard > Authentication > Users y confirma el email');
            }
            return;
        }
        console.log('✅ Login exitoso!');
        console.log(`🎉 Usuario autenticado: ${loginData.user?.email}`);
        console.log(`🆔 ID del usuario: ${loginData.user?.id}`);
        // Verificar perfil
        console.log('\n🔍 Verificando perfil del usuario...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', loginData.user?.id)
            .single();
        if (profileError) {
            console.error('❌ Error obteniendo perfil:', profileError.message);
            if (profileError.code === 'PGRST116') {
                console.log('\n⚠️  No se encontró perfil para este usuario');
                console.log('🔧 Ejecuta el script update-camplaygo-to-admin.sql para crear el perfil');
            }
        }
        else {
            console.log('✅ Perfil encontrado:');
            console.log(`   - Email: ${profile.email}`);
            console.log(`   - Nombre: ${profile.full_name || 'No definido'}`);
            console.log(`   - Rol: ${profile.role}`);
            console.log(`   - Creado: ${profile.created_at}`);
            if (profile.role === 'admin') {
                console.log('\n🎯 ¡PERFECTO! El usuario tiene permisos de administrador');
                console.log('🚀 Puedes acceder a todas las funciones administrativas');
            }
            else {
                console.log('\n⚠️  El usuario no tiene rol de administrador');
                console.log('🔧 Ejecuta update-camplaygo-to-admin.sql para actualizar el rol');
            }
        }
        // Cerrar sesión
        await supabase.auth.signOut();
        console.log('\n🔓 Sesión cerrada correctamente');
    }
    catch (error) {
        console.error('❌ Error inesperado:', error);
    }
}
// Ejecutar el test
testLogin().then(() => {
    console.log('\n🏁 Test de login completado.');
    console.log('\n📱 Si todo está correcto, puedes usar estas credenciales en:');
    console.log('   http://localhost:5173/');
}).catch(console.error);
