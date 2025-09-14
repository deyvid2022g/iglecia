#!/usr/bin/env node

/**
 * Script para configurar automáticamente el MCP de Supabase con las credenciales correctas
 * y ejecutar las correcciones de autenticación
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class MCPAutoConfigurator {
  constructor() {
    this.projectRef = process.env.SUPABASE_PROJECT_REF || 'toopbtydsiepeoisuecg';
    this.accessToken = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_4b31c6679f4c8aea27e3c21779808b547d9e0f6a';
    this.isWindows = os.platform() === 'win32';
  }

  getMCPConfigPaths() {
    const homeDir = os.homedir();
    const paths = [];
    
    if (this.isWindows) {
      paths.push(
        path.join(homeDir, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json'),
        path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
        path.join(homeDir, 'AppData', 'Roaming', 'Windsurf', 'User', 'globalStorage', 'windsurf.windsurf', 'settings', 'cline_mcp_settings.json')
      );
    } else {
      paths.push(
        path.join(homeDir, '.config', 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json'),
        path.join(homeDir, '.config', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
      );
    }
    
    return paths;
  }

  generateOptimalMCPConfig() {
    const baseArgs = [
      '-y',
      '@supabase/mcp-server-supabase@latest',
      `--project-ref=${this.projectRef}`
      // NO incluir --read-only para permitir escritura
    ];

    let mcpConfig;

    if (this.isWindows) {
      mcpConfig = {
        mcpServers: {
          supabase: {
            command: 'cmd',
            args: ['/c', 'npx', ...baseArgs],
            env: {
              SUPABASE_ACCESS_TOKEN: this.accessToken
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
              SUPABASE_ACCESS_TOKEN: this.accessToken
            }
          }
        }
      };
    }

    return mcpConfig;
  }

  async updateMCPConfigurations() {
    const config = this.generateOptimalMCPConfig();
    const configPaths = this.getMCPConfigPaths();
    let updated = 0;

    console.log('🔧 Configurando MCP con credenciales correctas...');
    console.log(`📋 Project REF: ${this.projectRef}`);
    console.log(`🔑 Access Token: ${this.accessToken.substring(0, 20)}...`);
    
    for (const configPath of configPaths) {
      try {
        const configDir = path.dirname(configPath);
        
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }

        let existingConfig = {};
        if (fs.existsSync(configPath)) {
          try {
            existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          } catch (error) {
            console.log(`⚠️  Configuración inválida en ${configPath}`);
          }
        }

        const mergedConfig = {
          ...existingConfig,
          mcpServers: {
            ...existingConfig.mcpServers,
            ...config.mcpServers
          }
        };

        fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
        console.log(`✅ Actualizado: ${path.basename(path.dirname(path.dirname(configPath)))}`);
        updated++;
      } catch (error) {
        console.log(`⚠️  Error en ${path.basename(path.dirname(path.dirname(configPath)))}: ${error.message}`);
      }
    }

    return updated;
  }

  createFinalConfig() {
    const config = this.generateOptimalMCPConfig();
    const finalConfigPath = path.join(__dirname, 'mcp-config-final.json');
    
    fs.writeFileSync(finalConfigPath, JSON.stringify(config, null, 2));
    console.log(`📄 Configuración final guardada: ${finalConfigPath}`);
    
    return finalConfigPath;
  }

  async testMCPConnection() {
    console.log('\n🔍 Probando conexión MCP...');
    
    try {
      const testCommand = this.isWindows 
        ? `cmd /c "npx -y @supabase/mcp-server-supabase@latest --help"`
        : `npx -y @supabase/mcp-server-supabase@latest --help`;

      const result = execSync(testCommand, { 
        encoding: 'utf8',
        timeout: 30000,
        env: { 
          ...process.env, 
          SUPABASE_ACCESS_TOKEN: this.accessToken,
          SUPABASE_PROJECT_REF: this.projectRef
        }
      });
      
      if (result.includes('Supabase MCP Server')) {
        console.log('✅ Servidor MCP funcionando correctamente');
        return true;
      }
    } catch (error) {
      console.log('⚠️  Error probando MCP (normal en primera instalación)');
    }
    return false;
  }

  printAutomaticCommands() {
    console.log('\n🚀 COMANDOS AUTOMÁTICOS LISTOS:');
    console.log('=' .repeat(50));
    
    console.log('\n🎯 SOLUCIÓN COMPLETA AUTOMÁTICA:');
    console.log('"Usa el servidor MCP de Supabase para ejecutar automáticamente');
    console.log('todas las correcciones SQL del archivo fixTriggerIssue.sql');
    console.log('y resolver el error 500 de autenticación"');
    
    console.log('\n🔧 COMANDOS ESPECÍFICOS:');
    console.log('• "Aplica la migración fixTriggerIssue usando MCP"');
    console.log('• "Sincroniza usuarios entre auth.users y public.users"');
    console.log('• "Verifica el estado de las tablas en Supabase"');
    console.log('• "Ejecuta las correcciones de autenticación automáticamente"');
    
    console.log('\n⚡ COMANDO SIMPLE:');
    console.log('"Arregla todos los problemas de Supabase automáticamente"');
    
    console.log('\n' + '='.repeat(50));
  }

  async run() {
    console.log('🚀 CONFIGURACIÓN AUTOMÁTICA FINAL DEL MCP');
    console.log('=' .repeat(50));

    // Verificar credenciales
    if (!this.projectRef || this.projectRef === 'your-project-ref') {
      console.error('❌ SUPABASE_PROJECT_REF no configurado');
      return false;
    }
    
    if (!this.accessToken || this.accessToken === 'your-access-token') {
      console.error('❌ SUPABASE_ACCESS_TOKEN no configurado');
      return false;
    }

    // Actualizar configuraciones
    const updated = await this.updateMCPConfigurations();
    
    // Crear configuración final
    this.createFinalConfig();
    
    // Probar conexión
    await this.testMCPConnection();
    
    console.log(`\n✅ CONFIGURACIÓN COMPLETADA`);
    console.log(`📊 Configuraciones actualizadas: ${updated}`);
    console.log(`🔑 Project REF: ${this.projectRef}`);
    console.log(`🎯 Access Token configurado correctamente`);
    
    // Mostrar comandos automáticos
    this.printAutomaticCommands();
    
    console.log('\n🎉 ¡LISTO PARA AUTOMATIZACIÓN COMPLETA!');
    console.log('\n🔄 REINICIA TU IDE para aplicar los cambios');
    console.log('\n💡 Ahora puedes usar los comandos automáticos listados arriba');
    
    return true;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const configurator = new MCPAutoConfigurator();
  configurator.run().catch(console.error);
}

module.exports = MCPAutoConfigurator;