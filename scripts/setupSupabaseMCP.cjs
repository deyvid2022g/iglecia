#!/usr/bin/env node

/**
 * Script para configurar y usar el servidor MCP de Supabase
 * Automatiza la gestión de la base de datos y resolución de problemas
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuración del proyecto
const CONFIG = {
  projectRef: process.env.SUPABASE_PROJECT_REF || 'your-project-ref',
  accessToken: process.env.SUPABASE_ACCESS_TOKEN || 'your-access-token',
  readOnly: false // Cambiamos a false para permitir operaciones de escritura
};

class SupabaseMCPManager {
  constructor() {
    this.mcpConfigPath = this.getMCPConfigPath();
    this.isWindows = os.platform() === 'win32';
  }

  getMCPConfigPath() {
    const homeDir = os.homedir();
    if (this.isWindows) {
      return path.join(homeDir, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json');
    } else {
      return path.join(homeDir, '.config', 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json');
    }
  }

  async checkNodeVersion() {
    try {
      const version = execSync('node -v', { encoding: 'utf8' }).trim();
      const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
      
      console.log(`✓ Node.js version: ${version}`);
      
      if (majorVersion < 18) {
        console.warn('⚠️  Se recomienda Node.js 18+ para el servidor MCP de Supabase');
        return false;
      }
      return true;
    } catch (error) {
      console.error('❌ Node.js no está instalado o no está en PATH');
      return false;
    }
  }

  async installMCPServer() {
    console.log('📦 Instalando servidor MCP de Supabase...');
    
    try {
      // Instalar globalmente para mejor rendimiento
      execSync('npm install -g @supabase/mcp-server-supabase@latest', { 
        stdio: 'inherit',
        timeout: 60000 
      });
      console.log('✓ Servidor MCP de Supabase instalado correctamente');
      return true;
    } catch (error) {
      console.log('ℹ️  Instalación global falló, usando npx en su lugar');
      return true; // npx funcionará como fallback
    }
  }

  generateMCPConfig() {
    const baseArgs = [
      '-y',
      '@supabase/mcp-server-supabase@latest'
    ];

    // Solo agregar --read-only si está habilitado
    if (CONFIG.readOnly) {
      baseArgs.push('--read-only');
    }

    // Agregar project-ref si está configurado
    if (CONFIG.projectRef && CONFIG.projectRef !== 'your-project-ref') {
      baseArgs.push(`--project-ref=${CONFIG.projectRef}`);
    }

    let mcpConfig;

    if (this.isWindows) {
      mcpConfig = {
        mcpServers: {
          supabase: {
            command: 'cmd',
            args: ['/c', 'npx', ...baseArgs],
            env: {
              SUPABASE_ACCESS_TOKEN: CONFIG.accessToken
            }
          }
        }
      };
    } else {
      mcpConfig = {
        mcpServers: {
          supabase: {
            command: 'npx',
            args: baseArgs,
            env: {
              SUPABASE_ACCESS_TOKEN: CONFIG.accessToken
            }
          }
        }
      };
    }

    return mcpConfig;
  }

  async saveMCPConfig() {
    const config = this.generateMCPConfig();
    const configDir = path.dirname(this.mcpConfigPath);

    try {
      // Crear directorio si no existe
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Leer configuración existente si existe
      let existingConfig = {};
      if (fs.existsSync(this.mcpConfigPath)) {
        try {
          existingConfig = JSON.parse(fs.readFileSync(this.mcpConfigPath, 'utf8'));
        } catch (error) {
          console.log('⚠️  Configuración MCP existente inválida, creando nueva');
        }
      }

      // Fusionar configuraciones
      const mergedConfig = {
        ...existingConfig,
        mcpServers: {
          ...existingConfig.mcpServers,
          ...config.mcpServers
        }
      };

      // Guardar configuración
      fs.writeFileSync(this.mcpConfigPath, JSON.stringify(mergedConfig, null, 2));
      console.log(`✓ Configuración MCP guardada en: ${this.mcpConfigPath}`);
      return true;
    } catch (error) {
      console.error('❌ Error guardando configuración MCP:', error.message);
      return false;
    }
  }

  async testMCPConnection() {
    console.log('🔍 Probando conexión MCP...');
    
    try {
      const command = this.isWindows ? 'cmd' : 'npx';
      const args = this.isWindows 
        ? ['/c', 'npx', '-y', '@supabase/mcp-server-supabase@latest', '--help']
        : ['-y', '@supabase/mcp-server-supabase@latest', '--help'];

      const result = execSync(`${command} ${args.join(' ')}`, { 
        encoding: 'utf8',
        timeout: 30000,
        env: { ...process.env, SUPABASE_ACCESS_TOKEN: CONFIG.accessToken }
      });
      
      if (result.includes('Supabase MCP Server')) {
        console.log('✓ Servidor MCP de Supabase funcionando correctamente');
        return true;
      }
    } catch (error) {
      console.error('❌ Error probando MCP:', error.message);
    }
    return false;
  }

  async fixAuthenticationIssues() {
    console.log('🔧 Ejecutando correcciones automáticas de autenticación...');
    
    // Leer el script SQL de corrección
    const sqlFixPath = path.join(__dirname, 'fixTriggerIssue.sql');
    
    if (!fs.existsSync(sqlFixPath)) {
      console.error('❌ Archivo fixTriggerIssue.sql no encontrado');
      return false;
    }

    console.log('📋 Para ejecutar las correcciones automáticamente:');
    console.log('1. El servidor MCP puede ejecutar SQL directamente');
    console.log('2. Usa el comando: apply_migration con el contenido del archivo SQL');
    console.log('3. O ejecuta manualmente en Supabase SQL Editor');
    
    return true;
  }

  printInstructions() {
    console.log('\n📚 INSTRUCCIONES DE USO:');
    console.log('=' .repeat(50));
    console.log('\n1. 🔑 CONFIGURAR VARIABLES DE ENTORNO:');
    console.log('   Agrega estas variables a tu archivo .env:');
    console.log(`   SUPABASE_PROJECT_REF=${CONFIG.projectRef}`);
    console.log(`   SUPABASE_ACCESS_TOKEN=${CONFIG.accessToken}`);
    
    console.log('\n2. 🎯 OBTENER PROJECT REF:');
    console.log('   - Ve a tu proyecto en Supabase Dashboard');
    console.log('   - Settings > General > Project ID');
    
    console.log('\n3. 🔐 CREAR ACCESS TOKEN:');
    console.log('   - Ve a Supabase Dashboard > Account > Access Tokens');
    console.log('   - Crea un nuevo token con permisos de proyecto');
    
    console.log('\n4. 🚀 USAR CON TU ASISTENTE AI:');
    console.log('   - Reinicia tu IDE (VS Code/Cursor)');
    console.log('   - El servidor MCP estará disponible automáticamente');
    console.log('   - Puedes pedirle al asistente que:');
    console.log('     * Ejecute migraciones SQL');
    console.log('     * Consulte datos de la base');
    console.log('     * Arregle problemas de autenticación');
    console.log('     * Gestione tablas y políticas RLS');
    
    console.log('\n5. 🛠️  COMANDOS DISPONIBLES PARA EL ASISTENTE:');
    console.log('   - "Ejecuta el SQL de fixTriggerIssue.sql"');
    console.log('   - "Sincroniza usuarios entre auth.users y public.users"');
    console.log('   - "Verifica el estado de las tablas"');
    console.log('   - "Aplica las migraciones pendientes"');
    
    console.log('\n6. 🔧 SOLUCIÓN AUTOMÁTICA:');
    console.log('   Simplemente di: "Usa el MCP de Supabase para arreglar');
    console.log('   todos los problemas de autenticación automáticamente"');
    
    console.log('\n' + '='.repeat(50));
  }

  async run() {
    console.log('🚀 Configurando servidor MCP de Supabase...');
    console.log('=' .repeat(50));

    // Verificar Node.js
    const nodeOk = await this.checkNodeVersion();
    if (!nodeOk) {
      console.log('\n❌ Por favor instala Node.js 18+ desde https://nodejs.org');
      return;
    }

    // Instalar servidor MCP
    await this.installMCPServer();

    // Guardar configuración
    const configSaved = await this.saveMCPConfig();
    if (!configSaved) {
      console.log('\n⚠️  Configuración no guardada, pero puedes usar npx directamente');
    }

    // Probar conexión
    await this.testMCPConnection();

    // Preparar correcciones
    await this.fixAuthenticationIssues();

    // Mostrar instrucciones
    this.printInstructions();

    console.log('\n✅ ¡Configuración completada!');
    console.log('\n🔄 Reinicia tu IDE para que los cambios tomen efecto.');
    console.log('\n💡 Ahora puedes pedirle a tu asistente AI que use Supabase MCP');
    console.log('   para resolver automáticamente todos los problemas!');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const manager = new SupabaseMCPManager();
  manager.run().catch(console.error);
}

module.exports = SupabaseMCPManager;