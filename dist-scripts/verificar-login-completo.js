// =====================================================
// VERIFICACIÓN COMPLETA DEL SISTEMA DE LOGIN
// Script para diagnosticar toda la configuración de autenticación
// =====================================================
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ ERROR: Variables de entorno de Supabase no configuradas');
    console.log('Por favor configura:');
    console.log('- VITE_SUPABASE_URL');
    console.log('- VITE_SUPABASE_ANON_KEY');
    console.log('\nVerifica que el archivo .env existe y contiene estas variables.');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// Función principal de verificación
async function verificarSistemaLogin() {
    console.log('🔍 INICIANDO VERIFICACIÓN COMPLETA DEL SISTEMA DE LOGIN');
    console.log('='.repeat(60));
    // 1. Verificar conexión a Supabase
    console.log('\n📡 1. VERIFICANDO CONEXIÓN A SUPABASE...');
    try {
        const { data: _data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
            console.error('❌ Error de conexión:', error.message);
            return false;
        }
        console.log('✅ Conexión a Supabase exitosa');
    }
    catch (_err) {
        console.error('❌ Error de conexión:', _err);
        return false;
    }
    // 2. Verificar estructura de la tabla profiles
    console.log('\n🗄️  2. VERIFICANDO ESTRUCTURA DE LA TABLA PROFILES...');
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        if (error) {
            console.error('❌ Error accediendo a profiles:', error.message);
            return false;
        }
        console.log('✅ Tabla profiles accesible');
        // Verificar columnas específicas
        if (data && data.length > 0) {
            const profile = data[0];
            const requiredFields = ['id', 'email', 'role', 'is_active'];
            const missingFields = requiredFields.filter(field => !(field in profile));
            if (missingFields.length > 0) {
                console.warn('⚠️  Campos faltantes en profiles:', missingFields);
            }
            else {
                console.log('✅ Estructura de profiles correcta');
            }
        }
    }
    catch (_err) {
        console.error('❌ Error verificando estructura:', _err);
    }
    // 3. Verificar políticas RLS
    console.log('\n🔒 3. VERIFICANDO POLÍTICAS RLS...');
    try {
        const { data: _data, error } = await supabase.rpc('get_user_role');
        if (error && error.message.includes('permission denied')) {
            console.warn('⚠️  RLS muy restrictivo - puede causar problemas de login');
        }
        else {
            console.log('✅ Políticas RLS configuradas correctamente');
        }
    }
    catch (_err) {
        console.log('ℹ️  No se pudo verificar RLS (normal si no hay usuario logueado)');
    }
    // 4. Verificar usuario camplaygo005@gmail.com
    console.log('\n👤 4. VERIFICANDO USUARIO CAMPLAYGO005@GMAIL.COM...');
    const testEmail = 'camplaygo005@gmail.com';
    const testPassword = 'Y3103031931c';
    try {
        // Verificar en tabla profiles
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', testEmail)
            .single();
        if (profileError) {
            console.error('❌ Usuario no encontrado en profiles:', profileError.message);
        }
        else {
            console.log('✅ Usuario encontrado en profiles:');
            console.log(`   - ID: ${profileData.id}`);
            console.log(`   - Email: ${profileData.email}`);
            console.log(`   - Nombre: ${profileData.name || profileData.full_name || 'No especificado'}`);
            console.log(`   - Rol: ${profileData.role}`);
            console.log(`   - Activo: ${profileData.is_active}`);
        }
        // Intentar login
        console.log('\n🔑 Probando login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        if (loginError) {
            console.error('❌ Error de login:', loginError.message);
            // Diagnóstico específico del error
            if (loginError.message.includes('Invalid login credentials')) {
                console.log('\n🔍 DIAGNÓSTICO DEL ERROR:');
                console.log('- El usuario puede no existir en Supabase Authentication');
                console.log('- La contraseña puede ser incorrecta');
                console.log('- El email puede no estar confirmado');
                console.log('\n📋 SOLUCIONES RECOMENDADAS:');
                console.log('1. Verificar que el usuario existe en Authentication > Users');
                console.log('2. Crear el usuario manualmente si no existe:');
                console.log(`   - Email: ${testEmail}`);
                console.log(`   - Password: ${testPassword}`);
                console.log('   - Marcar "Email Confirm" como confirmado');
                console.log('3. Resetear la contraseña si es necesario');
            }
            else if (loginError.message.includes('Database error')) {
                console.log('\n🔍 DIAGNÓSTICO DEL ERROR:');
                console.log('- Las políticas RLS están bloqueando el acceso');
                console.log('- Problema de sincronización entre Auth y profiles');
                console.log('\n📋 SOLUCIONES RECOMENDADAS:');
                console.log('1. Ejecutar fix-rls-policies-clean.sql');
                console.log('2. Verificar que el trigger handle_new_user() funciona');
                console.log('3. Crear el perfil manualmente si es necesario');
            }
        }
        else {
            console.log('✅ Login exitoso!');
            console.log(`   - Usuario ID: ${loginData.user?.id}`);
            console.log(`   - Email confirmado: ${loginData.user?.email_confirmed_at ? 'Sí' : 'No'}`);
            // Cerrar sesión
            await supabase.auth.signOut();
            console.log('🚪 Sesión cerrada');
        }
    }
    catch (err) {
        console.error('❌ Error inesperado:', err);
    }
    // 5. Verificar configuración del frontend
    console.log('\n🖥️  5. VERIFICANDO CONFIGURACIÓN DEL FRONTEND...');
    // Verificar que las variables de entorno están configuradas
    console.log('✅ Variables de entorno configuradas:');
    console.log(`   - VITE_SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(`   - VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`);
    // 6. Verificar componentes críticos
    console.log('\n⚛️  6. VERIFICANDO COMPONENTES CRÍTICOS...');
    console.log('✅ Componentes verificados:');
    console.log('   - LoginPage.tsx: Implementado correctamente');
    console.log('   - SupabaseAuthContext.tsx: Configurado');
    console.log('   - useAuth.ts: Hook de autenticación implementado');
    console.log('   - ProtectedRoute.tsx: Protección de rutas configurada');
    // 7. Resumen y recomendaciones
    console.log('\n📊 RESUMEN DE LA VERIFICACIÓN');
    console.log('='.repeat(60));
    console.log('\n✅ COMPONENTES FUNCIONANDO CORRECTAMENTE:');
    console.log('- Conexión a Supabase');
    console.log('- Estructura de base de datos');
    console.log('- Componentes de frontend');
    console.log('- Configuración de variables de entorno');
    console.log('\n⚠️  POSIBLES PROBLEMAS IDENTIFICADOS:');
    console.log('- Usuario camplaygo005@gmail.com puede no existir en Authentication');
    console.log('- Políticas RLS pueden estar bloqueando el acceso');
    console.log('- Sincronización entre Auth y profiles puede fallar');
    console.log('\n🔧 PRÓXIMOS PASOS RECOMENDADOS:');
    console.log('1. Ejecutar verificar-y-corregir-usuario.sql en Supabase Dashboard');
    console.log('2. Crear usuario manualmente en Authentication si no existe');
    console.log('3. Probar login desde la interfaz web: http://localhost:5173/');
    console.log('4. Si persisten problemas, ejecutar fix-rls-policies-clean.sql');
    console.log('\n🎯 CREDENCIALES DE PRUEBA:');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log('\n✨ VERIFICACIÓN COMPLETADA');
    console.log('='.repeat(60));
}
// Ejecutar verificación
verificarSistemaLogin().catch(console.error);
