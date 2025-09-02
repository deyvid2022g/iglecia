import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Cargar variables de entorno
dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
// Cliente con clave anon (limitado)
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function checkAndCreateProfile() {
    const email = 'camplaygo005@gmail.com';
    console.log('🔍 Verificando configuración para:', email);
    console.log('\n⚠️  IMPORTANTE: Este script requiere que primero crees el usuario manualmente');
    console.log('\n📋 PASOS MANUALES REQUERIDOS:');
    console.log('\n1️⃣ Ve al Dashboard de Supabase:');
    console.log('   https://supabase.com/dashboard');
    console.log('\n2️⃣ Selecciona tu proyecto y ve a Authentication > Users');
    console.log('\n3️⃣ Haz clic en "Add user" y completa:');
    console.log(`   - Email: ${email}`);
    console.log('   - Password: AdminIglesia123! (o la que prefieras)');
    console.log('   - Email Confirm: ✅ (marcado)');
    console.log('\n4️⃣ Haz clic en "Create user"');
    console.log('\n5️⃣ COPIA el UUID del usuario creado');
    console.log('\n🔄 Verificando si el usuario ya existe en Auth...');
    try {
        // Intentar verificar si podemos obtener información del usuario
        const { data: _session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.log('ℹ️  No hay sesión activa (normal)');
        }
        // Verificar si existe perfil
        console.log('\n🔍 Verificando perfil existente...');
        const { data: existingProfile, error: _profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();
        if (existingProfile) {
            console.log('✅ Perfil encontrado:');
            console.log(`   - ID: ${existingProfile.id}`);
            console.log(`   - Email: ${existingProfile.email}`);
            console.log(`   - Nombre: ${existingProfile.full_name}`);
            console.log(`   - Rol: ${existingProfile.role}`);
            if (existingProfile.role === 'admin') {
                console.log('\n🎉 ¡El usuario ya es administrador!');
                console.log('\n🧪 Probando login...');
                await testLoginInstructions(email);
            }
            else {
                console.log('\n⚠️  El usuario existe pero no es administrador');
                console.log('\n📝 Para convertirlo en admin, ejecuta este SQL en el Dashboard:');
                console.log(`\nUPDATE public.profiles `);
                console.log(`SET role = 'admin', updated_at = NOW()`);
                console.log(`WHERE email = '${email}';`);
            }
        }
        else {
            console.log('❌ No se encontró perfil para este email');
            console.log('\n📝 Después de crear el usuario en el Dashboard, ejecuta este SQL:');
            console.log(`\nINSERT INTO public.profiles (`);
            console.log(`    id, email, full_name, role, created_at, updated_at`);
            console.log(`) VALUES (`);
            console.log(`    'UUID_DEL_USUARIO_AQUI', -- Reemplazar con el UUID real`);
            console.log(`    '${email}',`);
            console.log(`    'Administrador Principal',`);
            console.log(`    'admin',`);
            console.log(`    NOW(),`);
            console.log(`    NOW()`);
            console.log(`);`);
        }
    }
    catch (error) {
        console.error('❌ Error:', error);
        if (error instanceof Error) {
            if (error.message.includes('JWT')) {
                console.log('\n💡 Error de autenticación - esto es normal sin Service Role Key');
            }
        }
    }
    console.log('\n🔧 SOLUCIÓN ALTERNATIVA:');
    console.log('\n1. Ejecuta primero el script fix-rls-policies.sql en el Dashboard');
    console.log('2. Crea el usuario manualmente en Authentication > Users');
    console.log('3. Ejecuta el SQL para crear/actualizar el perfil');
    console.log('4. Prueba el login en: http://localhost:5173/');
}
async function testLoginInstructions(email) {
    console.log('\n🧪 Para probar el login:');
    console.log(`\n1. Ve a: http://localhost:5173/`);
    console.log(`2. Email: ${email}`);
    console.log(`3. Password: AdminIglesia123! (o la que hayas usado)`);
    console.log('\n✅ Si el login funciona, ¡todo está configurado correctamente!');
    console.log('❌ Si falla, verifica:');
    console.log('   - Que el email esté confirmado en el Dashboard');
    console.log('   - Que el password sea correcto');
    console.log('   - Que las políticas RLS estén corregidas');
}
// Ejecutar el script
checkAndCreateProfile().then(() => {
    console.log('\n🏁 Verificación completada.');
}).catch(console.error);
