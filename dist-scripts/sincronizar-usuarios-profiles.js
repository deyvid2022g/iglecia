import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function sincronizarUsuarios() {
    console.log('🔄 SINCRONIZANDO USUARIOS Y PROFILES');
    console.log('====================================\n');
    // 1. Verificar usuarios en auth.users
    console.log('1️⃣ Verificando usuarios en auth.users...');
    try {
        // Intentar obtener el usuario actual (esto nos dirá si hay sesión)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            console.log('⚠️ No hay sesión activa:', userError.message);
        }
        else if (user) {
            console.log('👤 Usuario en sesión:', user.email);
        }
        else {
            console.log('❌ No hay usuario en sesión');
        }
    }
    catch (err) {
        console.log('❌ Error verificando sesión:', err);
    }
    // 2. Verificar registros en profiles
    console.log('\n2️⃣ Verificando registros en profiles...');
    try {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, name, role, created_at')
            .order('created_at', { ascending: false });
        if (profilesError) {
            console.log('❌ Error accediendo a profiles:', profilesError.message);
        }
        else {
            console.log(`✅ Profiles encontrados: ${profiles?.length || 0}`);
            if (profiles && profiles.length > 0) {
                console.log('\n📋 USUARIOS EN PROFILES:');
                profiles.forEach((profile, index) => {
                    console.log(`   ${index + 1}. ${profile.email} (${profile.role}) - ID: ${profile.id}`);
                });
            }
        }
    }
    catch (err) {
        console.log('❌ Error en profiles:', err);
    }
    // 3. Intentar crear usuarios de prueba
    console.log('\n3️⃣ Intentando crear/verificar usuarios de autenticación...');
    const usuariosObjetivo = [
        {
            email: 'lugarderefugio005@gmail.com',
            password: 'LugarDeRefugio2024!',
            name: 'Lugar de Refugio Admin'
        },
        {
            email: 'camplaygo005@gmail.com',
            password: 'CamplayGo2024!',
            name: 'CamplayGo Admin'
        }
    ];
    for (const usuario of usuariosObjetivo) {
        console.log(`\n🔐 Procesando: ${usuario.email}`);
        try {
            // Intentar login primero para ver si existe
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: usuario.email,
                password: usuario.password
            });
            if (loginError) {
                if (loginError.message === 'Invalid login credentials') {
                    console.log('❌ Usuario no existe en auth.users');
                    console.log('💡 Necesitas crearlo manualmente en Supabase Dashboard');
                    // Intentar signup (puede fallar si ya existe)
                    console.log('🔄 Intentando crear usuario...');
                    const { data: signupData, error: signupError } = await supabase.auth.signUp({
                        email: usuario.email,
                        password: usuario.password,
                        options: {
                            data: {
                                name: usuario.name
                            }
                        }
                    });
                    if (signupError) {
                        console.log('❌ Error en signup:', signupError.message);
                        if (signupError.message.includes('already registered')) {
                            console.log('⚠️ Usuario ya registrado pero con contraseña diferente');
                        }
                    }
                    else {
                        console.log('✅ Usuario creado exitosamente');
                        if (signupData.user && !signupData.user.email_confirmed_at) {
                            console.log('📧 IMPORTANTE: Confirma el email en Supabase Dashboard');
                        }
                    }
                }
                else {
                    console.log(`❌ Error de login: ${loginError.message}`);
                }
            }
            else {
                console.log('✅ Usuario existe y login funciona');
                console.log(`👤 ID: ${loginData.user?.id}`);
                console.log(`📧 Confirmado: ${loginData.user?.email_confirmed_at ? 'Sí' : 'No'}`);
                // Cerrar sesión
                await supabase.auth.signOut();
            }
        }
        catch (err) {
            console.log(`❌ Error inesperado: ${err}`);
        }
    }
    // 4. Instrucciones finales
    console.log('\n🎯 RESUMEN Y PRÓXIMOS PASOS');
    console.log('=============================');
    console.log('\n📋 ESTADO ACTUAL:');
    console.log('• Profiles: Existen registros en la tabla');
    console.log('• Auth.users: Probablemente vacío o incompleto');
    console.log('\n🔧 SOLUCIÓN MANUAL REQUERIDA:');
    console.log('1. Ve a Supabase Dashboard > Authentication > Users');
    console.log('2. Haz clic en "Add user" para cada usuario:');
    console.log('   • lugarderefugio005@gmail.com (password: LugarDeRefugio2024!)');
    console.log('   • camplaygo005@gmail.com (password: CamplayGo2024!)');
    console.log('3. Marca "Auto Confirm User" = SÍ');
    console.log('4. Ejecuta: npx tsx test-login-simple.ts');
    console.log('\n⚠️ IMPORTANTE:');
    console.log('• Los usuarios DEBEN existir en auth.users para el login');
    console.log('• La tabla profiles es solo para datos adicionales');
    console.log('• Supabase no permite crear usuarios via API sin permisos especiales');
    console.log('\n🔄 DESPUÉS DE CREAR USUARIOS:');
    console.log('• Reactivar RLS: ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
    console.log('• Probar login: npx tsx test-login-simple.ts');
}
sincronizarUsuarios().catch(console.error);
