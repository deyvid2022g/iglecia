import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deshabilitarRLSTemporal() {
  console.log('🚨 DESHABILITANDO RLS TEMPORALMENTE');
  console.log('===================================\n');

  console.log('⚠️ ADVERTENCIA: Esto deshabilita la seguridad temporalmente');
  console.log('⚠️ SOLO para diagnóstico - NO usar en producción\n');

  try {
    // Intentar deshabilitar RLS usando función SQL
    console.log('1️⃣ Intentando deshabilitar RLS...');
    
    const { data: _data, error } = await supabase.rpc('disable_rls_temporarily');
    
    if (error) {
      console.log('❌ Error con función RPC:', error.message);
      console.log('\n🔧 SOLUCIÓN MANUAL REQUERIDA:');
      console.log('===============================');
      console.log('\nEjecuta este SQL en Supabase Dashboard > SQL Editor:');
      console.log('\n```sql');
      console.log('-- DESHABILITAR RLS TEMPORALMENTE (SOLO PARA DIAGNÓSTICO)');
      console.log('ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;');
      console.log('\n-- Verificar que se deshabilitó');
      console.log('SELECT schemaname, tablename, rowsecurity ');
      console.log('FROM pg_tables ');
      console.log('WHERE tablename = \'profiles\';');
      console.log('```\n');
      
      console.log('📋 DESPUÉS DE EJECUTAR EL SQL:');
      console.log('1. Ejecuta: npx tsx test-login-simple.ts');
      console.log('2. Si funciona, el problema ERA RLS');
      console.log('3. Si sigue fallando, hay otro problema');
      console.log('\n🔄 PARA REACTIVAR RLS DESPUÉS:');
      console.log('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
      
    } else {
      console.log('✅ RLS deshabilitado exitosamente');
      console.log('\n🧪 Ahora ejecuta: npx tsx test-login-simple.ts');
    }
    
  } catch (err) {
    console.log('❌ Error inesperado:', err);
  }

  // Probar acceso directo a la tabla
  console.log('\n2️⃣ Probando acceso directo a profiles...');
  
  try {
    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('id, email, name, role')
      .limit(3);
    
    if (selectError) {
      console.log('❌ Error accediendo a profiles:', selectError.message);
      console.log('🔍 Código:', selectError.code);
    } else {
      console.log('✅ Acceso a profiles exitoso');
      console.log('📊 Registros encontrados:', profiles?.length || 0);
      if (profiles && profiles.length > 0) {
        console.log('👤 Primer usuario:', profiles[0]);
      }
    }
  } catch (err) {
    console.log('❌ Error en acceso directo:', err);
  }

  // Probar login después
  console.log('\n3️⃣ Probando login después de cambios...');
  
  const usuarios = [
    { email: 'lugarderefugio005@gmail.com', password: 'LugarDeRefugio2024!' },
    { email: 'camplaygo005@gmail.com', password: 'CamplayGo2024!' }
  ];

  for (const usuario of usuarios) {
    console.log(`\n🔐 Probando: ${usuario.email}`);
    
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: usuario.password
      });
      
      if (loginError) {
        console.log(`❌ Error: ${loginError.message}`);
        
        if (loginError.message === 'Database error granting user') {
          console.log('🚨 PROBLEMA CONFIRMADO: Es RLS o políticas de base de datos');
        } else if (loginError.message === 'Invalid login credentials') {
          console.log('👤 Usuario no existe o contraseña incorrecta');
        } else if (loginError.message === 'Email not confirmed') {
          console.log('📧 Email no confirmado');
        }
      } else {
        console.log(`✅ Login exitoso!`);
        console.log(`👤 Usuario: ${loginData.user?.email}`);
        console.log(`🆔 ID: ${loginData.user?.id}`);
        
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.log(`❌ Error inesperado: ${err}`);
    }
  }

  console.log('\n🎯 DIAGNÓSTICO FINAL');
  console.log('====================');
  console.log('\n💡 INTERPRETACIÓN DE RESULTADOS:');
  console.log('• Si login funciona DESPUÉS de deshabilitar RLS → Problema es RLS');
  console.log('• Si login SIGUE fallando → Problema es otro (usuarios, configuración, etc.)');
  console.log('\n⚠️ IMPORTANTE: Reactivar RLS después del diagnóstico');
  console.log('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
}

deshabilitarRLSTemporal().catch(console.error);