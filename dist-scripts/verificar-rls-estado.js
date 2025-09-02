import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
// Cargar variables de entorno
config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables de entorno faltantes');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function verificarEstadoRLS() {
    console.log('🔍 VERIFICANDO ESTADO DE POLÍTICAS RLS');
    console.log('=====================================\n');
    try {
        // Verificar políticas existentes
        console.log('📋 Verificando políticas existentes en tabla profiles...');
        const { data: policies, error: policiesError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'profiles');
        if (policiesError) {
            console.log('⚠️  No se pudieron obtener las políticas (esto es normal si no tienes permisos de admin)');
            console.log('Error:', policiesError.message);
        }
        else {
            console.log('✅ Políticas encontradas:', policies?.length || 0);
            if (policies && policies.length > 0) {
                policies.forEach(policy => {
                    console.log(`   - ${policy.policyname} (${policy.cmd})`);
                });
            }
        }
        console.log('\n🧪 Probando operaciones básicas...');
        // Probar login
        console.log('\n🔐 Probando login con lugarderefugio005@gmail.com...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: 'lugarderefugio005@gmail.com',
            password: 'L3123406452r'
        });
        if (loginError) {
            console.log('❌ Error de login:', loginError.message);
            console.log('   Código:', loginError.status);
        }
        else {
            console.log('✅ Login exitoso!');
            console.log('   Usuario ID:', loginData.user?.id);
            // Probar acceso a profiles
            console.log('\n📊 Probando acceso a tabla profiles...');
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', loginData.user?.id)
                .single();
            if (profileError) {
                console.log('❌ Error accediendo a profiles:', profileError.message);
                console.log('   Código:', profileError.code);
            }
            else {
                console.log('✅ Acceso a profiles exitoso!');
                console.log('   Perfil:', profileData);
            }
            // Cerrar sesión
            await supabase.auth.signOut();
        }
    }
    catch (error) {
        console.error('💥 Error general:', error);
    }
    console.log('\n📋 INSTRUCCIONES:');
    console.log('==================');
    console.log('1. Si ves "Error de login: Database error granting user":');
    console.log('   → Las políticas RLS NO están aplicadas correctamente');
    console.log('   → Ejecuta el SQL en INSTRUCCIONES-CORRECCION-LOGIN.md');
    console.log('\n2. Si ves "Login exitoso" pero "Error accediendo a profiles":');
    console.log('   → El login funciona pero las políticas RLS son muy restrictivas');
    console.log('   → Ejecuta el SQL en INSTRUCCIONES-CORRECCION-LOGIN.md');
    console.log('\n3. Si todo funciona:');
    console.log('   → ¡Perfecto! El problema está resuelto');
    console.log('\n🔗 Supabase Dashboard: https://supabase.com/dashboard');
    console.log('📁 Archivo SQL: INSTRUCCIONES-CORRECCION-LOGIN.md (líneas 14-46)');
}
verificarEstadoRLS();
