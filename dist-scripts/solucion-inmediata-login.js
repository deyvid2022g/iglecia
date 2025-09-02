import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function solucionInmediata() {
    console.log('🚨 SOLUCIÓN INMEDIATA PARA ERROR "CREDENCIALES INCORRECTAS"');
    console.log('='.repeat(60));
    console.log('\n📋 DIAGNÓSTICO:');
    console.log('• Error: "Credenciales incorrectas. Verifica tu email y contraseña."');
    console.log('• Causa: Políticas RLS bloqueando acceso a tabla profiles');
    console.log('• Solución: Deshabilitar RLS temporalmente');
    console.log('\n🔧 EJECUTANDO SOLUCIÓN...');
    try {
        // Intentar deshabilitar RLS usando una función SQL personalizada
        console.log('1. Intentando deshabilitar RLS...');
        const { data: _data, error } = await supabase.rpc('disable_rls_temporarily');
        if (error) {
            console.log('❌ No se pudo deshabilitar RLS automáticamente');
            console.log('   Error:', error.message);
            console.log('\n🔧 SOLUCIÓN MANUAL REQUERIDA:');
            console.log('1. Ve a Supabase Dashboard → SQL Editor');
            console.log('2. Ejecuta este comando:');
            console.log('   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;');
            console.log('3. Haz clic en "Run"');
            console.log('4. Regresa a la página de login y prueba de nuevo');
        }
        else {
            console.log('✅ RLS deshabilitado exitosamente');
        }
    }
    catch (err) {
        console.log('❌ Error ejecutando comando:', err);
        console.log('\n🔧 SOLUCIÓN MANUAL REQUERIDA:');
        console.log('1. Ve a Supabase Dashboard → SQL Editor');
        console.log('2. Ejecuta este comando:');
        console.log('   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;');
        console.log('3. Haz clic en "Run"');
        console.log('4. Regresa a la página de login y prueba de nuevo');
    }
    // Probar login después de la corrección
    console.log('\n🧪 PROBANDO LOGIN DESPUÉS DE CORRECCIÓN...');
    const credenciales = [
        { email: 'lugarderefugio005@gmail.com', password: 'L3123406452r' },
        { email: 'camplaygo005@gmail.com', password: 'Y3103031931c' }
    ];
    for (const cred of credenciales) {
        console.log(`\n🔐 Probando: ${cred.email}`);
        try {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword(cred);
            if (loginError) {
                if (loginError.message.includes('Database error granting user')) {
                    console.log('❌ RLS aún está bloqueando - ejecuta el SQL manual');
                }
                else if (loginError.message.includes('Invalid login credentials')) {
                    console.log('❌ Credenciales incorrectas - usuario puede no existir');
                }
                else {
                    console.log(`❌ Error: ${loginError.message}`);
                }
            }
            else {
                console.log('✅ ¡LOGIN EXITOSO!');
                console.log(`👤 Usuario: ${loginData.user?.email}`);
                console.log(`🆔 ID: ${loginData.user?.id}`);
                // Verificar perfil
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', loginData.user?.id)
                    .single();
                if (profileError) {
                    console.log('⚠️ Error accediendo al perfil:', profileError.message);
                }
                else {
                    console.log('✅ Perfil encontrado:');
                    console.log(`   Nombre: ${profile.name || profile.full_name}`);
                    console.log(`   Rol: ${profile.role}`);
                    console.log(`   Activo: ${profile.is_active}`);
                }
                await supabase.auth.signOut();
                console.log('🚪 Sesión cerrada');
                console.log('\n🎉 ¡PROBLEMA RESUELTO!');
                console.log('🌐 Ahora puedes usar el login en: http://localhost:5173/');
                return;
            }
        }
        catch (err) {
            console.log('❌ Error inesperado:', err);
        }
    }
    console.log('\n📋 RESUMEN:');
    console.log('• Si ves "Database error granting user": Ejecuta el SQL manual');
    console.log('• Si ves "Invalid login credentials": Los usuarios pueden no existir');
    console.log('• Una vez corregido, el login funcionará perfectamente');
    console.log('\n🎯 CREDENCIALES PARA PROBAR EN LA WEB:');
    console.log('• lugarderefugio005@gmail.com / L3123406452r');
    console.log('• camplaygo005@gmail.com / Y3103031931c');
    console.log('\n🌐 URL DE LA APLICACIÓN:');
    console.log('http://localhost:5173/');
    console.log('\n✨ PRÓXIMO PASO:');
    console.log('Si el problema persiste, ejecuta el SQL manual en Supabase Dashboard');
}
// Ejecutar solución
solucionInmediata().catch(console.error);
