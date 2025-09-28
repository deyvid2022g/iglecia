#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 CONFIGURACIÓN DEL CLI DE PRÉDICAS');
  console.log('=====================================\n');
  
  // Verificar si ya existe un archivo .env
  const envPath = join(__dirname, '.env');
  const envExamplePath = join(__dirname, '.env.example');
  
  if (existsSync(envPath)) {
    console.log('⚠️ Ya existe un archivo .env');
    const overwrite = await question('¿Deseas sobrescribirlo? (s/n): ');
    if (overwrite.toLowerCase() !== 's') {
      console.log('❌ Configuración cancelada.');
      rl.close();
      return;
    }
  }
  
  console.log('📝 Ingresa las credenciales de Supabase:\n');
  
  const supabaseUrl = await question('🔗 URL de Supabase: ');
  const supabaseKey = await question('🔑 Clave anónima de Supabase: ');
  
  // Crear archivo .env
  const envContent = `# Configuración de Supabase para el CLI de Prédicas
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}`;
  
  try {
    writeFileSync(envPath, envContent);
    console.log('\n✅ Archivo .env creado exitosamente!');
    console.log('🎯 Ahora puedes ejecutar el CLI con: node predicas-cli.js');
    console.log('\n📋 Comandos disponibles:');
    console.log('  1. Listar prédicas');
    console.log('  2. Subir nueva prédica');
    console.log('  3. Buscar prédica');
    console.log('  4. Ver estadísticas');
    console.log('\n🔧 Para ejecutar directamente desde cualquier lugar, considera agregar un alias:');
    console.log('  alias predicas="node ' + join(__dirname, 'predicas-cli.js') + '"');
    
  } catch (error) {
    console.error('❌ Error al crear el archivo .env:', error.message);
  }
  
  rl.close();
}

setup().catch(console.error);