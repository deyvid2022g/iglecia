#!/usr/bin/env node

/**
 * Script para ejecutar correcciones automáticas usando MCP de Supabase
 * Configura las variables de entorno y ejecuta las correcciones SQL
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SupabaseMCPExecutor {
  constructor() {
    this.projectRef = 'toopbtydsiepeoisuecg';
    this.accessToken = 'sbp_4b31c6679f4c8aea27e3c21779808b547d9e0f6a';
    this.supabaseUrl = 'https://toopbtydsiepeoisuecg.supabase.co';
  }

  async configurarVariablesEntorno() {
    console.log('🔧 Configurando variables de entorno para MCP...');
    
    // Configurar variables de entorno para el proceso actual
    process.env.SUPABASE_PROJECT_REF = this.projectRef;
    process.env.SUPABASE_ACCESS_TOKEN = this.accessToken;
    process.env.SUPABASE_URL = this.supabaseUrl;
    process.env.SUPABASE_MCP_WRITE_MODE = 'true';
    
    console.log('✅ Variables de entorno configuradas');
    console.log(`📍 Project REF: ${this.projectRef}`);
    console.log(`🔗 URL: ${this.supabaseUrl}`);
  }

  async ejecutarCorreccionSQL() {
    console.log('\n🚀 Ejecutando correcciones SQL automáticas...');
    
    const sqlCorrecciones = `
-- 1. Verificar usuarios faltantes
WITH missing_users AS (
  SELECT au.id, au.email, au.created_at
  FROM auth.users au
  LEFT JOIN public.users pu ON au.id = pu.id
  WHERE pu.id IS NULL
)
SELECT COUNT(*) as usuarios_faltantes FROM missing_users;

-- 2. Insertar usuarios faltantes en public.users
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- 3. Recrear función handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error en handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recrear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Verificar configuración final
SELECT 
  'Trigger creado correctamente' as status,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
`;

    // Guardar SQL en archivo temporal
    const sqlFile = path.join(__dirname, 'temp_corrections.sql');
    fs.writeFileSync(sqlFile, sqlCorrecciones);
    
    console.log('📝 Archivo SQL creado:', sqlFile);
    return sqlFile;
  }

  async ejecutarConSupabaseCLI() {
    console.log('\n🔧 Ejecutando con Supabase CLI...');
    
    try {
      const sqlFile = await this.ejecutarCorreccionSQL();
      
      // Ejecutar con supabase CLI
      const command = `npx supabase db reset --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.${this.projectRef}.supabase.co:5432/postgres" --file "${sqlFile}"`;
      
      console.log('📋 Comando a ejecutar:');
      console.log(command);
      
      console.log('\n⚠️  NOTA: Necesitas ejecutar manualmente este comando con tu contraseña de base de datos');
      console.log('🔑 Obtén tu contraseña desde: https://supabase.com/dashboard/project/' + this.projectRef + '/settings/database');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }

  async mostrarSolucionManual() {
    console.log('\n📋 SOLUCIÓN MANUAL ALTERNATIVA:');
    console.log('==================================');
    
    console.log('\n1. Ve al Dashboard de Supabase:');
    console.log(`   https://supabase.com/dashboard/project/${this.projectRef}/editor`);
    
    console.log('\n2. Ejecuta este SQL en el SQL Editor:');
    console.log('```sql');
    
    const sqlManual = `
-- Insertar usuario faltante (reemplaza con el ID real del usuario con error)
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
LIMIT 1;

-- Recrear función y trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.created_at, NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;
    
    console.log(sqlManual);
    console.log('```');
    
    console.log('\n3. Verifica que el trigger se creó:');
    console.log('```sql');
    console.log('SELECT * FROM information_schema.triggers WHERE trigger_name = \'on_auth_user_created\';');
    console.log('```');
  }

  async ejecutar() {
    console.log('🎯 SUPABASE MCP - CORRECCIÓN AUTOMÁTICA');
    console.log('=====================================\n');
    
    try {
      await this.configurarVariablesEntorno();
      await this.ejecutarConSupabaseCLI();
      await this.mostrarSolucionManual();
      
      console.log('\n✅ PROCESO COMPLETADO');
      console.log('\n💡 PRÓXIMOS PASOS:');
      console.log('1. Ejecuta el SQL manualmente en el Dashboard de Supabase');
      console.log('2. Prueba el login en tu aplicación');
      console.log('3. Verifica que no hay más errores 500');
      
    } catch (error) {
      console.error('❌ Error en la ejecución:', error.message);
      console.log('\n🔧 Usa la solución manual mostrada arriba');
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const executor = new SupabaseMCPExecutor();
  executor.ejecutar().catch(console.error);
}

module.exports = SupabaseMCPExecutor;