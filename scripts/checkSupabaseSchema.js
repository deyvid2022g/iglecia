/**
 * Script para verificar la estructura de la base de datos Supabase
 * 
 * Este script verifica que las tablas y columnas necesarias existan en Supabase
 * antes de ejecutar la migración de datos.
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Verifica la estructura de la base de datos Supabase
 */
async function checkSupabaseSchema() {
  console.log('Verificando estructura de la base de datos Supabase...');
  
  // Definición de las tablas y columnas esperadas
  const expectedSchema = {
    users: [
      'id', 'name', 'email', 'role', 'avatar_url', 'phone', 'created_at', 'updated_at'
    ],
    events: [
      'id', 'title', 'date', 'start_time', 'end_time', 'type', 'location', 'description',
      'capacity', 'registrations', 'image', 'host', 'requires_rsvp', 'created_at', 'updated_at'
    ],
    sermons: [
      'id', 'slug', 'title', 'speaker', 'date', 'description', 'tags', 'video_url',
      'thumbnail_url', 'audio_url', 'scripture', 'series', 'view_count', 'download_count',
      'created_at', 'updated_at'
    ],
    blog_posts: [
      'id', 'slug', 'title', 'excerpt', 'content', 'author', 'category', 'tags',
      'published_at', 'cover_image', 'views', 'featured', 'created_at', 'updated_at'
    ]
  };
  
  // Verificar cada tabla
  for (const [tableName, expectedColumns] of Object.entries(expectedSchema)) {
    try {
      // Verificar si la tabla existe
      const { data: tableExists, error: tableError } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error(`❌ Tabla '${tableName}' no encontrada o no accesible:`, tableError.message);
        continue;
      }
      
      console.log(`✅ Tabla '${tableName}' encontrada`);
      
      // Verificar columnas
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: tableName });
      
      if (columnsError) {
        console.error(`❌ No se pudieron verificar las columnas de '${tableName}':`, columnsError.message);
        console.log('   Nota: Es posible que necesites crear la función RPC "get_table_columns" en Supabase.');
        continue;
      }
      
      // Si se pudo obtener las columnas, verificar cada una
      if (columns) {
        const columnNames = columns.map(col => col.column_name);
        const missingColumns = expectedColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0) {
          console.error(`❌ Columnas faltantes en '${tableName}':`, missingColumns.join(', '));
        } else {
          console.log(`✅ Todas las columnas esperadas existen en '${tableName}'`);
        }
      }
    } catch (error) {
      console.error(`❌ Error al verificar la tabla '${tableName}':`, error.message);
    }
  }
  
  console.log('\nVerificación de esquema completada.');
  console.log('Si hay errores, asegúrate de que las tablas y columnas existan antes de ejecutar la migración.');
  console.log('Puedes crear las tablas ejecutando el script SQL proporcionado en schema.sql');
}

// Función RPC que debe crearse en Supabase
console.log(`
Nota: Para que este script funcione correctamente, debes crear la siguiente función RPC en Supabase:

CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (column_name text, data_type text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.column_name::text, c.data_type::text
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  AND c.table_name = table_name;
END;
$$;
`);

// Ejecutar la verificación
checkSupabaseSchema();