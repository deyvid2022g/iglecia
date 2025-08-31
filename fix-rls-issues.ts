import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 CORRIGIENDO POLÍTICAS RLS');
  console.log('============================\n');

  try {
    // Leer el archivo SQL
    const sqlContent = readFileSync(join(__dirname, 'fix-rls-policies.sql'), 'utf-8');
    
    // Dividir en comandos individuales
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));

    console.log(`📝 Ejecutando ${commands.length} comandos SQL...\n`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Saltar comentarios y consultas SELECT
      if (command.toLowerCase().includes('select') && !command.toLowerCase().includes('create')) {
        console.log(`⏭️  Saltando consulta de verificación: ${command.substring(0, 50)}...`);
        continue;
      }

      console.log(`🔄 Ejecutando comando ${i + 1}/${commands.length}:`);
      console.log(`   ${command.substring(0, 80)}${command.length > 80 ? '...' : ''}`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log(`⚠️  Error en comando ${i + 1}: ${error.message}`);
          // Continuar con el siguiente comando
        } else {
          console.log(`✅ Comando ${i + 1} ejecutado correctamente`);
        }
      } catch (err) {
        console.log(`❌ Error ejecutando comando ${i + 1}:`, err);
      }
      
      console.log('');
    }

    console.log('\n🔍 VERIFICANDO CONFIGURACIÓN ACTUAL');
    console.log('===================================\n');

    // Verificar políticas actuales
    console.log('📋 Políticas activas en la tabla profiles:');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'profiles');

    if (policiesError) {
      console.log('⚠️  No se pudieron obtener las políticas:', policiesError.message);
    } else {
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`);
      });
    }

    console.log('\n🧪 PROBANDO CREACIÓN DE USUARIO');
    console.log('================================\n');

    // Intentar crear un usuario de prueba
    const testEmail = 'test-admin@iglesia.com';
    const testPassword = 'TestAdmin123!';

    console.log(`👤 Intentando registrar usuario: ${testEmail}`);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Administrador de Prueba',
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.log(`❌ Error en registro: ${authError.message}`);
    } else {
      console.log(`✅ Usuario registrado correctamente`);
      console.log(`   ID: ${authData.user?.id}`);
      console.log(`   Email: ${authData.user?.email}`);
      
      // Verificar si se creó el perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user?.id)
        .single();

      if (profileError) {
        console.log(`⚠️  Perfil no encontrado: ${profileError.message}`);
      } else {
        console.log(`✅ Perfil creado correctamente:`);
        console.log(`   Nombre: ${profile.full_name}`);
        console.log(`   Rol: ${profile.role}`);
      }
    }

    console.log('\n🎯 RECOMENDACIONES');
    console.log('==================\n');
    console.log('1. Verifica en el Dashboard de Supabase que las políticas se hayan aplicado');
    console.log('2. Si el usuario se creó correctamente, puedes usarlo para hacer login');
    console.log('3. Una vez que tengas acceso, puedes ajustar las políticas para ser más restrictivas');
    console.log('4. Recuerda eliminar la política temporal "temp_profiles_bypass" cuando ya no la necesites');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la función
fixRLSPolicies().catch(console.error);