import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function crearUsuariosFaltantes() {
    console.log('👥 CREANDO USUARIOS FALTANTES');
    console.log('=============================\n');
    // Usuarios a crear
    const usuarios = [
        {
            email: 'lugarderefugio005@gmail.com',
            password: 'LugarDeRefugio2024!',
            name: 'Lugar de Refugio Admin',
            role: 'admin'
        },
        {
            email: 'camplaygo005@gmail.com',
            password: 'CamplayGo2024!',
            name: 'CamplayGo Admin',
            role: 'admin'
        },
        {
            email: 'admin@iglesiaderefugio.com',
            password: 'AdminRefugio2024!',
            name: 'Administrador Principal',
            role: 'admin'
        }
    ];
    for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];
        console.log(`${i + 1}️⃣ CREANDO USUARIO: ${usuario.email}`);
        try {
            // Intentar crear el usuario
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: usuario.email,
                password: usuario.password,
                options: {
                    data: {
                        name: usuario.name,
                        role: usuario.role
                    }
                }
            });
            if (signUpError) {
                if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
                    console.log('⚠️ Usuario ya registrado, probando login...');
                    // Probar login
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                        email: usuario.email,
                        password: usuario.password
                    });
                    if (loginError) {
                        console.log('❌ Login falló:', loginError.message);
                        console.log('💡 Puede que la contraseña sea diferente o el usuario esté inactivo');
                    }
                    else {
                        console.log('✅ Login exitoso! Usuario funcional');
                        // Verificar/actualizar perfil
                        await verificarActualizarPerfil(loginData.user, usuario);
                        await supabase.auth.signOut();
                    }
                }
                else {
                    console.log('❌ Error creando usuario:', signUpError.message);
                }
            }
            else {
                console.log('✅ Usuario creado exitosamente!');
                if (signUpData.user) {
                    console.log('📧 Confirmación requerida:', !signUpData.user.email_confirmed_at);
                    // Crear/actualizar perfil
                    await verificarActualizarPerfil(signUpData.user, usuario);
                    // Si necesita confirmación, mostrar instrucciones
                    if (!signUpData.user.email_confirmed_at) {
                        console.log('📬 IMPORTANTE: Revisa el email para confirmar la cuenta');
                        console.log('   O configura Supabase para auto-confirmar en desarrollo');
                    }
                }
            }
        }
        catch (err) {
            console.log('❌ Error inesperado:', err);
        }
        console.log(''); // Línea en blanco
    }
    // Probar login final con todos los usuarios
    console.log('🧪 PRUEBA FINAL DE LOGIN');
    console.log('========================\n');
    for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];
        console.log(`🔐 Probando login: ${usuario.email}`);
        try {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: usuario.email,
                password: usuario.password
            });
            if (loginError) {
                console.log(`❌ Error: ${loginError.message}`);
                if (loginError.message === 'Email not confirmed') {
                    console.log('📧 Solución: Confirma el email o habilita auto-confirmación en Supabase');
                }
                else if (loginError.message === 'Invalid login credentials') {
                    console.log('🔑 Solución: Verifica que el usuario existe y la contraseña es correcta');
                }
            }
            else {
                console.log(`✅ Login exitoso!`);
                console.log(`👤 Usuario: ${loginData.user?.email}`);
                console.log(`📧 Confirmado: ${loginData.user?.email_confirmed_at ? 'Sí' : 'No'}`);
                await supabase.auth.signOut();
            }
        }
        catch (err) {
            console.log(`❌ Error inesperado: ${err}`);
        }
        console.log(''); // Línea en blanco
    }
    console.log('🎯 RESUMEN FINAL');
    console.log('================');
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('1. Si ves "Email not confirmed", ve a Supabase Dashboard > Authentication > Settings');
    console.log('2. Desactiva "Enable email confirmations" para desarrollo');
    console.log('3. O confirma manualmente los emails en Authentication > Users');
    console.log('4. Ejecuta nuevamente: npx tsx test-login-simple.ts');
    console.log('\n🔧 CONFIGURACIÓN SUPABASE RECOMENDADA PARA DESARROLLO:');
    console.log('   • Authentication > Settings > Enable email confirmations: OFF');
    console.log('   • Authentication > Settings > Enable phone confirmations: OFF');
    console.log('   • Authentication > URL Configuration > Site URL: http://localhost:5173');
}
async function verificarActualizarPerfil(user, datosUsuario) {
    console.log('🔍 Verificando perfil...');
    try {
        // Buscar perfil existente
        const { data: existingProfile, error: selectError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', user.email)
            .single();
        if (selectError && selectError.code === 'PGRST116') {
            // No existe, crear nuevo
            console.log('📝 Creando nuevo perfil...');
            const { data: _newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                id: user.id,
                email: user.email,
                name: datosUsuario.name,
                role: datosUsuario.role
            })
                .select()
                .single();
            if (insertError) {
                console.log('❌ Error creando perfil:', insertError.message);
            }
            else {
                console.log('✅ Perfil creado exitosamente');
            }
        }
        else if (selectError) {
            console.log('❌ Error verificando perfil:', selectError.message);
        }
        else {
            // Existe, actualizar si es necesario
            console.log('✅ Perfil existe');
            if (existingProfile.id !== user.id) {
                console.log('🔄 Actualizando ID del perfil...');
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ id: user.id })
                    .eq('email', user.email);
                if (updateError) {
                    console.log('❌ Error actualizando perfil:', updateError.message);
                }
                else {
                    console.log('✅ Perfil actualizado');
                }
            }
        }
    }
    catch (err) {
        console.log('❌ Error en verificación de perfil:', err);
    }
}
crearUsuariosFaltantes().catch(console.error);
