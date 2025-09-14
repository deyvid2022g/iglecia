import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno no configuradas:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

class SupabaseDiagnostic {
  constructor() {
    this.results = [];
  }

  addResult(test, status, message, solution = null) {
    this.results.push({ test, status, message, solution });
  }

  log(result) {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.solution) {
      console.log(`   💡 Solución: ${result.solution}`);
    }
  }

  async testEnvironmentVariables() {
    console.log('\n🔍 Verificando variables de entorno...');
    
    if (!supabaseUrl) {
      this.addResult(
        'Variables de entorno - URL',
        'FAIL',
        'VITE_SUPABASE_URL no está definida',
        'Agregar VITE_SUPABASE_URL al archivo .env'
      );
    } else {
      this.addResult(
        'Variables de entorno - URL',
        'PASS',
        `URL configurada: ${supabaseUrl}`
      );
    }

    if (!supabaseAnonKey) {
      this.addResult(
        'Variables de entorno - Key',
        'FAIL',
        'VITE_SUPABASE_ANON_KEY no está definida',
        'Agregar VITE_SUPABASE_ANON_KEY al archivo .env'
      );
    } else {
      this.addResult(
        'Variables de entorno - Key',
        'PASS',
        'Clave anónima configurada'
      );
    }
  }

  async testConnectivity() {
    console.log('\n🔍 Verificando conectividad con Supabase...');
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        this.addResult(
          'Conectividad',
          'FAIL',
          `Error de conectividad: ${error.message}`,
          'Verificar la configuración de red y las credenciales de Supabase'
        );
      } else {
        this.addResult(
          'Conectividad',
          'PASS',
          'Conexión exitosa con Supabase'
        );
      }
    } catch (error) {
      this.addResult(
        'Conectividad',
        'FAIL',
        `Error de red: ${error.message}`,
        'Verificar la conexión a internet y la configuración de Supabase'
      );
    }
  }

  async testAuthentication() {
    console.log('\n🔍 Probando autenticación...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@nonexistent.com',
        password: 'wrongpassword'
      });

      if (error && error.message === 'Invalid login credentials') {
        this.addResult(
          'Autenticación - Credenciales incorrectas',
          'PASS',
          'El sistema rechaza correctamente credenciales incorrectas'
        );
      } else if (error) {
        this.addResult(
          'Autenticación - Error inesperado',
          'FAIL',
          `Error inesperado: ${error.message}`,
          'Revisar la configuración de autenticación en Supabase'
        );
      } else {
        this.addResult(
          'Autenticación - Comportamiento anómalo',
          'WARNING',
          'Login exitoso con credenciales de prueba (inesperado)'
        );
      }
    } catch (error) {
      this.addResult(
        'Autenticación - Error de red',
        'FAIL',
        `Error de red durante autenticación: ${error.message}`,
        'Verificar la conectividad y configuración de Supabase'
      );
    }
  }

  async testRegistration() {
    console.log('\n🔍 Probando registro de usuarios...');
    
    const testEmail = `diagnostic-${Date.now()}@test.com`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          data: {
            name: 'Usuario de Diagnóstico',
            role: 'member'
          }
        }
      });

      if (error) {
        if (error.message.includes('Database error granting user')) {
          this.addResult(
            'Registro - Error de base de datos',
            'FAIL',
            'Error: Database error granting user',
            'Verificar las políticas RLS y triggers en Supabase Dashboard. Ejecutar setup_supabase_complete.sql'
          );
        } else if (error.message.includes('User already registered')) {
          this.addResult(
            'Registro - Usuario duplicado',
            'WARNING',
            'El email ya está registrado (comportamiento normal)',
            'Usar un email diferente para pruebas'
          );
        } else {
          this.addResult(
            'Registro - Otro error',
            'FAIL',
            `Error de registro: ${error.message}`,
            'Revisar la configuración de autenticación'
          );
        }
      } else {
        this.addResult(
          'Registro',
          'PASS',
          'Registro de usuario exitoso'
        );
      }
    } catch (error) {
      this.addResult(
        'Registro - Error de red',
        'FAIL',
        `Error de red durante registro: ${error.message}`,
        'Verificar la conectividad y configuración'
      );
    }
  }

  async testDatabaseAccess() {
    console.log('\n🔍 Verificando acceso a la base de datos...');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        if (error.message.includes('relation "public.users" does not exist')) {
          this.addResult(
            'Base de datos - Tabla users',
            'FAIL',
            'La tabla users no existe',
            'Ejecutar el script setup_supabase_complete.sql para crear las tablas'
          );
        } else if (error.message.includes('permission') || error.message.includes('policy')) {
          this.addResult(
            'Base de datos - RLS',
            'WARNING',
            'Las políticas RLS están activas (esto es normal)',
            'Verificar que las políticas RLS permitan las operaciones necesarias'
          );
        } else {
          this.addResult(
            'Base de datos - Error',
            'FAIL',
            `Error de acceso: ${error.message}`,
            'Verificar la configuración de la base de datos'
          );
        }
      } else {
        this.addResult(
          'Base de datos',
          'PASS',
          'Acceso a la base de datos exitoso'
        );
      }
    } catch (error) {
      this.addResult(
        'Base de datos - Error de red',
        'FAIL',
        `Error: ${error.message}`,
        'Verificar la conectividad'
      );
    }
  }

  async runDiagnostic() {
    console.log('🚀 Iniciando diagnóstico de Supabase...');
    console.log('=' .repeat(50));

    await this.testEnvironmentVariables();
    await this.testConnectivity();
    await this.testAuthentication();
    await this.testRegistration();
    await this.testDatabaseAccess();

    console.log('\n📊 Resumen del diagnóstico:');
    console.log('=' .repeat(50));
    
    this.results.forEach(result => this.log(result));

    const failures = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    const passes = this.results.filter(r => r.status === 'PASS').length;

    console.log('\n📈 Estadísticas:');
    console.log(`✅ Pruebas exitosas: ${passes}`);
    console.log(`⚠️  Advertencias: ${warnings}`);
    console.log(`❌ Errores: ${failures}`);

    if (failures > 0) {
      console.log('\n🔧 Acciones recomendadas:');
      this.results
        .filter(r => r.status === 'FAIL' && r.solution)
        .forEach(r => console.log(`- ${r.solution}`));
    }

    return {
      total: this.results.length,
      passes,
      warnings,
      failures,
      results: this.results
    };
  }
}

// Ejecutar diagnóstico
const diagnostic = new SupabaseDiagnostic();
diagnostic.runDiagnostic().then((summary) => {
  console.log('\n✨ Diagnóstico completado');
  
  if (summary.failures > 0) {
    console.log('\n⚠️  Se encontraron problemas que requieren atención.');
    process.exit(1);
  } else {
    console.log('\n🎉 Todas las pruebas pasaron exitosamente!');
    process.exit(0);
  }
}).catch(error => {
  console.error('❌ Error durante el diagnóstico:', error);
  process.exit(1);
});