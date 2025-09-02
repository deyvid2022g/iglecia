import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const TEST_EMAIL = 'lugarderefugio005@gmail.com';
const TEST_PASSWORD = 'password123'; // Cambia esto por la contraseña real
async function diagnoseAuthIssues() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN');
    console.log('==========================================\n');
    // 1. Verificar conectividad con Supabase
    console.log('📡 1. Verificando conectividad con Supabase...');
    try {
        const { data: _data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
            console.log('❌ Error de conectividad:', error.message);
            return;
        }
        console.log('✅ Conectividad con Supabase: OK\n');
    }
    catch (error) {
        console.log('❌ Error de conectividad:', error);
        return;
    }
    // 2. Verificar configuración de variables de entorno
    console.log('⚙️  2. Verificando variables de entorno...');
    console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada');
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Configurada' : '❌ No configurada');
    console.log('');
    // 3. Verificar estructura de la tabla profiles
    console.log('🗄️  3. Verificando estructura de tabla profiles...');
    try {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        if (profilesError) {
            console.log('❌ Error accediendo a profiles:', profilesError.message);
        }
        else {
            console.log('✅ Tabla profiles accesible');
            if (profiles && profiles.length > 0) {
                console.log('📋 Columnas disponibles:', Object.keys(profiles[0]));
            }
        }
    }
    catch (error) {
        console.log('❌ Error verificando tabla profiles:', error);
    }
    console.log('');
    // 4. Buscar usuario en tabla profiles
    console.log('👤 4. Verificando usuario en tabla profiles...');
    try {
        const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', TEST_EMAIL)
            .single();
        if (profileError) {
            if (profileError.code === 'PGRST116') {
                console.log('❌ Usuario no encontrado en tabla profiles');
            }
            else {
                console.log('❌ Error buscando usuario:', profileError.message);
            }
        }
        else {
            console.log('✅ Usuario encontrado en profiles:');
            console.log('   - ID:', userProfile.id);
            console.log('   - Nombre:', userProfile.name);
            console.log('   - Email:', userProfile.email);
            console.log('   - Rol:', userProfile.role);
            console.log('   - Activo:', userProfile.is_active);
        }
    }
    catch (error) {
        console.log('❌ Error verificando usuario en profiles:', error);
    }
    console.log('');
    // 5. Intentar login
    console.log('🔑 5. Intentando login...');
    try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        if (authError) {
            console.log('❌ Error de login:', authError.message);
            console.log('   Código:', authError.status);
            // Verificar si es problema de credenciales o de configuración
            if (authError.message.includes('Invalid login credentials')) {
                console.log('\n🔍 POSIBLES CAUSAS:');
                console.log('   1. Contraseña incorrecta');
                console.log('   2. Usuario no existe en Supabase Auth');
                console.log('   3. Usuario no confirmado (email verification)');
            }
        }
        else {
            console.log('✅ Login exitoso!');
            console.log('   - User ID:', authData.user?.id);
            console.log('   - Email:', authData.user?.email);
            console.log('   - Email confirmado:', authData.user?.email_confirmed_at ? 'Sí' : 'No');
            // Cerrar sesión después de la prueba
            await supabase.auth.signOut();
        }
    }
    catch (error) {
        console.log('❌ Error durante login:', error);
    }
    console.log('');
    // 6. Verificar usuarios en Auth (requiere service role)
    console.log('👥 6. Información adicional...');
    console.log('Para verificar usuarios en Supabase Auth, necesitas:');
    console.log('1. Ir al Dashboard de Supabase');
    console.log('2. Sección Authentication > Users');
    console.log('3. Buscar el email:', TEST_EMAIL);
    console.log('4. Verificar que el usuario existe y está confirmado');
    console.log('');
    console.log('🔧 RECOMENDACIONES:');
    console.log('1. Si el usuario no existe en Auth, créalo desde el Dashboard');
    console.log('2. Si existe pero no está confirmado, confirma el email');
    console.log('3. Verifica que la contraseña sea correcta');
    console.log('4. Asegúrate de que las políticas RLS permitan el acceso');
}
diagnoseAuthIssues().catch(console.error);
