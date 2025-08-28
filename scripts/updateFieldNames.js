/**
 * Script para actualizar los nombres de campos en los archivos del proyecto
 * para que coincidan con el esquema de Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio raíz del proyecto
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

// Mapeo de nombres de campos antiguos a nuevos
const fieldMappings = {
  'startTime': 'start_time',
  'endTime': 'end_time',
  'requiresRSVP': 'requires_rsvp',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'videoUrl': 'video_url',
  'thumbnail': 'thumbnail_url',
  'audioUrl': 'audio_url',
  'hasTranscript': 'has_transcript',
  'viewCount': 'view_count',
  'publishedAt': 'published_at',
  'readTime': 'read_time',
  'featuredImage': 'cover_image',
  'avatar': 'avatar_url'
};

// Extensiones de archivos a procesar
const fileExtensions = ['.tsx', '.ts', '.js'];

// Función para actualizar el contenido de un archivo
function updateFileContent(filePath, content) {
  let updatedContent = content;
  
  // Reemplazar nombres de campos en el contenido
  Object.entries(fieldMappings).forEach(([oldName, newName]) => {
    // Expresión regular para encontrar el nombre del campo como propiedad
    const propRegex = new RegExp(`(\\b|[{\\s,])${oldName}(\\s*:|\\b)`, 'g');
    updatedContent = updatedContent.replace(propRegex, (match, prefix, suffix) => {
      return `${prefix}${newName}${suffix}`;
    });
    
    // Expresión regular para encontrar el nombre del campo como acceso a propiedad
    const accessRegex = new RegExp(`\\.${oldName}\\b`, 'g');
    updatedContent = updatedContent.replace(accessRegex, `.${newName}`);
  });
  
  return updatedContent;
}

// Función para procesar un archivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = updateFileContent(filePath, content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error al procesar ${filePath}:`, error.message);
    return false;
  }
}

// Función para recorrer directorios recursivamente
function walkDir(dir) {
  let filesUpdated = 0;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
      // Procesar subdirectorios
      filesUpdated += walkDir(filePath);
    } else if (stat.isFile() && fileExtensions.includes(path.extname(file))) {
      // Procesar archivos con extensiones específicas
      if (processFile(filePath)) {
        filesUpdated++;
      }
    }
  });
  
  return filesUpdated;
}

// Ejecutar el script
console.log('🔄 Iniciando actualización de nombres de campos...');
const updatedFiles = walkDir(srcDir);
console.log(`✨ Proceso completado. Se actualizaron ${updatedFiles} archivos.`);