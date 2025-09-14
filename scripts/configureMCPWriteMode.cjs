#!/usr/bin/env node

/**
 * Script para configurar el servidor MCP de Supabase en modo de escritura
 * y ejecutar automáticamente las correcciones de autenticación
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class SupabaseMCPWriteConfig {
  constructor() {
    this.isWindows = os.platform() === 'win32';
  }

  getMCPConfigPaths() {
    const homeDir = os.homedir();
    const possiblePaths = [];
    
    if (this.isWindows) {
      // Rutas comunes para Windows
      possiblePaths.push(
        path.join(homeDir, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json'),
        path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
        path.join(homeDir, 'AppData', 'Roaming', 'Windsurf', 'User', 'globalStorage', 'windsurf.windsurf', 'settings', 'cline_mcp_settings.json'),
        path.join(homeDir, '.config', 'mcp', 'settings.json')
      );
    } else {
      // Rutas comunes para macOS/Linux
      possiblePaths.push(
        path.join(homeDir, '.config', 'Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json'),
        path.join(homeDir, '.config', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
        path.join(homeDir, '.config', 'mcp', 'settings.json'),
        path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
      );
    }
    
    return possiblePaths;
  }

  generateWriteModeConfig() {
    const projectRef = process.env.SUPABASE_PROJECT_REF || 'your-project-ref';
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN || 'your-access-token';

    const baseArgs = [
      '-y',
      '@supabase/mcp-server-supabase@latest'
    ];

    // NO agregar --read-only para permitir escritura
    if (projectRef && projectRef !== 'your-project-ref') {
      baseArgs.push(`--project-ref=${projectRef}`);
    }

    let mcpConfig;

    if (this.isWindows) {
      mcpConfig = {
        mcpServers: {
          supabase: {
            command: 'cmd',
            args: ['/c', 'npx', ...baseArgs],
            env: {
              SUPABASE_ACCESS_TOKEN: accessToken
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
              SUPABASE_ACCESS_TOKEN: accessToken
            }
          }
        }
      };
    }

    return mcpConfig;
  }

  async updateAllMCPConfigs() {
    const config = this.generateWriteModeConfig();
    const configPaths = this.getMCPConfigPaths();
    let updated = 0;

    console.log('🔧 Configurando MCP en modo de escritura...');
    
    for (const configPath of configPaths) {
      try {
        const configDir = path.dirname(configPath);
        
        // Crear directorio si no existe
        if (!fs.existsSync(configDir)) {
          fs.mkdirSync(configDir, { recursive: true });
        }

        // Leer configuración existente si existe
        let existingConfig = {};
        if (fs.existsSync(configPath)) {
          try {
            existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            console.log(`📁 Encontrada configuración existente: ${configPath}`);
          } catch (error) {
            console.log(`⚠️  Configuración inválida en ${configPath}, creando nueva`);
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
        fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
        console.log(`✓ Configuración actualizada: ${configPath}`);
        updated++;
      } catch (error) {
        console.log(`⚠️  No se pudo actualizar ${configPath}: ${error.message}`);
      }
    }

    return updated;
  }

  createManualConfig() {
    const config = this.generateWriteModeConfig();
    const manualConfigPath = path.join(__dirname, 'mcp-config-write-mode.json');
    
    fs.writeFileSync(manualConfigPath, JSON.stringify(config, null, 2));
    console.log(`📄 Configuración manual creada: ${manualConfigPath}`);
    
    return manualConfigPath;
  }

  printInstructions() {
    console.log('\n📚 INSTRUCCIONES PARA HABILITAR MODO DE ESCRITURA:');
    console.log('=' .repeat(60));
    
    console.log('\n🔑 1. CONFIGURAR VARIABLES DE ENTORNO:');
    console.log('   Asegúrate de tener en tu .env:');
    console.log('   SUPABASE_PROJECT_REF=tu-project-ref');
    console.log('   SUPABASE_ACCESS_TOKEN=tu-access-token');
    
    console.log('\n🎯 2. OBTENER PROJECT REF:');
    console.log('   - Dashboard de Supabase > Tu Proyecto > Settings > General');
    console.log('   - Copia el "Reference ID"');
    
    console.log('\n🔐 3. CREAR ACCESS TOKEN:');
    console.log('   - Dashboard de Supabase > Account Settings > Access Tokens');
    console.log('   - "Generate new token" con permisos completos');
    
    console.log('\n🚀 4. REINICIAR IDE:');
    console.log('   - Cierra completamente tu IDE (VS Code/Cursor/Windsurf)');
    console.log('   - Vuelve a abrirlo para cargar la nueva configuración');
    
    console.log('\n🛠️  5. COMANDOS PARA EL ASISTENTE:');
    console.log('   Ahora puedes decir:');
    console.log('   - "Usa MCP de Supabase para aplicar la migración fixTriggerIssue"');
    console.log('   - "Ejecuta el SQL para sincronizar usuarios"');
    console.log('   - "Arregla automáticamente los problemas de autenticación"');
    
    console.log('\n⚡ 6. SOLUCIÓN AUTOMÁTICA COMPLETA:');
    console.log('   "Usa el servidor MCP de Supabase para ejecutar automáticamente');
    console.log('   todas las correcciones SQL del archivo fixTriggerIssue.sql');
    console.log('   y resolver el error 500 de autenticación"');
    
    console.log('\n' + '='.repeat(60));
  }

  async run() {
    console.log('🚀 Configurando MCP de Supabase en MODO DE ESCRITURA...');
    console.log('=' .repeat(60));

    // Actualizar todas las configuraciones posibles
    const updated = await this.updateAllMCPConfigs();
    
    // Crear configuración manual como respaldo
    const manualPath = this.createManualConfig();
    
    console.log(`\n✅ Configuraciones actualizadas: ${updated}`);
    console.log(`📄 Configuración manual disponible en: ${manualPath}`);
    
    // Mostrar instrucciones
    this.printInstructions();
    
    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!');
    console.log('\n🔄 IMPORTANTE: Reinicia tu IDE para aplicar los cambios');
    console.log('\n💡 Ahora el MCP puede ejecutar migraciones y correcciones SQL');
    
    return true;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const configurator = new SupabaseMCPWriteConfig();
  configurator.run().catch(console.error);
}

module.exports = SupabaseMCPWriteConfig;