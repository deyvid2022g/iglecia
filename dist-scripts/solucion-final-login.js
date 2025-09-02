import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function solucionFinalLogin() {
    console.log('🔧 SOLUCIÓN FINAL PARA PROBLEMA DE LOGIN');
    console.log('=======================================\n');
    // 1. Verificar estructura actual de profiles
    console.log('1️⃣ VERIFICANDO ESTRUCTURA ACTUAL DE PROFILES...');
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        if (error) {
            console.log('❌ Error accediendo a profiles:', error.message);
        }
        else {
            console.log('✅ Tabla profiles accesible');
            if (profiles && profiles.length > 0) {
                console.log('📋 Estructura detectada:', Object.keys(profiles[0]));
                console.log('📊 Registro de ejemplo:', profiles[0]);
            }
            else {
                console.log('📊 Tabla vacía');
            }
        }
    }
    catch (err) {
        console.log('❌ Error:', err);
    }
    // 2. Probar inserción con estructura correcta
    console.log('\n2️⃣ PROBANDO INSERCIÓN CON ESTRUCTURA CORRECTA...');
    try {
        const testEmail = `test-${Date.now()}@example.com`;
        const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert({
            email: testEmail,
            name: 'Test User',
            role: 'member'
        })
            .select()
            .single();
        if (insertError) {
            console.log('❌ Error insertando:', insertError.message);
            console.log('🔍 Código:', insertError.code);
            console.log('🔍 Detalles:', insertError.details);
        }
        else {
            console.log('✅ Inserción exitosa:', insertData);
            // Limpiar
            await supabase.from('profiles').delete().eq('email', testEmail);
            console.log('🧹 Registro de prueba eliminado');
        }
    }
    catch (err) {
        console.log('❌ Error en inserción:', err);
    }
    // 3. Intentar crear usuario de prueba completo
    console.log('\n3️⃣ CREANDO USUARIO DE PRUEBA COMPLETO...');
    try {
        const testEmail = 'admin@iglesiaderefugio.com';
        const testPassword = 'AdminRefugio2024!';
        console.log('📝 Intentando crear usuario:', testEmail);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: 'Administrador',
                    role: 'admin'
                }
            }
        });
        if (signUpError) {
            console.log('⚠️ Error/Info en signup:', signUpError.message);
            // Si el usuario ya existe, intentar login
            if (signUpError.message.includes('already registered')) {
                console.log('👤 Usuario ya existe, probando login...');
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword
                });
                if (loginError) {
                    console.log('❌ Error de login:', loginError.message);
                }
                else {
                    console.log('✅ Login exitoso con usuario existente!');
                    console.log('👤 Usuario:', loginData.user?.email);
                    // Verificar/crear perfil
                    await verificarCrearPerfil(loginData.user);
                    await supabase.auth.signOut();
                }
            }
        }
        else {
            console.log('✅ Usuario creado exitosamente!');
            if (signUpData.user) {
                console.log('👤 Usuario:', signUpData.user.email);
                // Verificar/crear perfil
                await verificarCrearPerfil(signUpData.user);
            }
        }
    }
    catch (err) {
        console.log('❌ Error creando usuario:', err);
    }
    // 4. Probar con credenciales originales
    console.log('\n4️⃣ PROBANDO CREDENCIALES ORIGINALES...');
    const credenciales = [
        { email: 'lugarderefugio005@gmail.com', password: 'LugarDeRefugio2024!' },
        { email: 'camplaygo005@gmail.com', password: 'CamplayGo2024!' },
        { email: 'admin@iglesiaderefugio.com', password: 'AdminRefugio2024!' }
    ];
    for (const cred of credenciales) {
        console.log(`\n🔐 Probando: ${cred.email}`);
        try {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword(cred);
            if (loginError) {
                console.log(`❌ Error: ${loginError.message}`);
            }
            else {
                console.log(`✅ Login exitoso!`);
                console.log(`👤 Usuario: ${loginData.user?.email}`);
                // Verificar perfil
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', loginData.user?.email)
                    .single();
                if (profileError) {
                    console.log(`⚠️ Sin perfil en tabla: ${profileError.message}`);
                }
                else {
                    console.log(`✅ Perfil encontrado:`, profile);
                }
                await supabase.auth.signOut();
            }
        }
        catch (err) {
            console.log(`❌ Error: ${err}`);
        }
    }
    console.log('\n🏁 ANÁLISIS COMPLETADO');
    console.log('======================');
    console.log('\n💡 CONCLUSIONES:');
    console.log('1. Si algún login fue exitoso, el problema NO es RLS');
    console.log('2. Si todos fallan con "Invalid credentials", los usuarios no existen');
    console.log('3. Si hay "Database error granting user", entonces SÍ es RLS');
    console.log('4. La tabla profiles usa "name" no "full_name"');
}
async function verificarCrearPerfil(user) {
    console.log('🔍 Verificando perfil para:', user.email);
    const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();
    if (selectError && selectError.code === 'PGRST116') {
        // No existe, crear
        console.log('📝 Creando perfil...');
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'Usuario',
            role: user.user_metadata?.role || 'member'
        })
            .select()
            .single();
        if (insertError) {
            console.log('❌ Error creando perfil:', insertError.message);
        }
        else {
            console.log('✅ Perfil creado:', newProfile);
        }
    }
    else if (selectError) {
        console.log('❌ Error verificando perfil:', selectError.message);
    }
    else {
        console.log('✅ Perfil ya existe:', existingProfile);
    }
}
solucionFinalLogin().catch(console.error);
