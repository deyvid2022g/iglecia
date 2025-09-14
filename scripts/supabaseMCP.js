#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { configurarSupabase } from './configuraSupabaseCompleto.js';
import { corregirTrigger } from './corregirTriggerSupabase.js';

dotenv.config();

// Crear cliente de Supabase usando las variables de entorno
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Funciones principales
async function listarProyectos() {
  console.log('📋 Listando proyectos...');
  console.log(`URL: ${process.env.VITE_SUPABASE_URL}`);
  console.log('⚠️ Esta función requiere acceso al Dashboard de Supabase.');
  console.log('📌 Visita https://supabase.com/dashboard para ver tus proyectos.');
}

async function obtenerProyecto() {
  console.log('📋 Información del proyecto actual:');
  console.log(`URL: ${process.env.VITE_SUPABASE_URL}`);
  console.log(`Clave anónima: ${process.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10)}...`);
  
  try {
    // Verificar conexión con un método más simple
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.message.includes('relation "public.users" does not exist')) {
      console.log('⚠️ La tabla users no existe. Considera ejecutar el script de configuración completa.');
    } else if (error) {
      console.error('❌ Error de conexión:', error.message);
      return;
    } else {
      console.log('✅ Conexión exitosa a Supabase');
    }
    
    // Verificar tabla users
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error verificando tabla users:', usersError.message);
    } else {
      console.log('✅ Tabla users accesible');
    }
    
    // Verificar si hay usuarios admin
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Error verificando usuarios admin:', adminError.message);
    } else if (adminData && adminData.length === 0) {
      console.log('⚠️ No hay usuarios admin. Considera crear uno.');
    } else {
      console.log('✅ Existe al menos un usuario admin');
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function listarTablas() {
  console.log('📋 Listando tablas...');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('❌ Error listando tablas:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Tablas encontradas:');
      data.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log('No se encontraron tablas en el esquema public.');
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function listarExtensiones() {
  console.log('📋 Listando extensiones...');
  
  try {
    const { data, error } = await supabase
      .from('pg_extension')
      .select('extname');
    
    if (error) {
      console.error('❌ Error listando extensiones:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Extensiones instaladas:');
      data.forEach((ext, index) => {
        console.log(`${index + 1}. ${ext.extname}`);
      });
    } else {
      console.log('No se encontraron extensiones.');
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function ejecutarSQL(sql) {
  console.log('🔧 Ejecutando SQL...');
  
  if (!sql) {
    console.error('❌ Error: No se proporcionó SQL para ejecutar.');
    return;
  }
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error.message);
      console.log('⚠️ La función exec_sql puede no estar disponible. Ejecuta el SQL manualmente en el Dashboard de Supabase.');
      return;
    }
    
    console.log('✅ SQL ejecutado correctamente');
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function obtenerLogs() {
  console.log('📋 Obteniendo logs...');
  console.log('⚠️ Esta función requiere acceso al Dashboard de Supabase.');
  console.log('📌 Visita https://supabase.com/dashboard y ve a la sección de logs para ver los registros.');
}

async function verificarPoliticasRLS() {
  console.log('🔍 Verificando políticas RLS...');
  
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'users');
    
    if (error) {
      console.error('❌ Error verificando políticas RLS:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Políticas RLS encontradas para la tabla users:');
      data.forEach((policy, index) => {
        console.log(`${index + 1}. ${policy.policyname}`);
      });
    } else {
      console.log('⚠️ No se encontraron políticas RLS para la tabla users.');
      console.log('📌 Considera ejecutar el script de configuración completa.');
    }
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function generarTiposTypescript() {
  console.log('📋 Generando tipos TypeScript...');
  console.log('⚠️ Esta función requiere la CLI de Supabase instalada localmente.');
  console.log('📌 Ejecuta manualmente: npx supabase gen types typescript --project-id <project-id> --schema public > src/types/supabase.ts');
}

// Función principal para procesar comandos
async function main() {
  const args = process.argv.slice(2);
  const comando = args[0];
  
  console.log('🚀 Supabase MCP - Cliente de línea de comandos');
  
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('❌ Error: Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no configuradas.');
    console.log('📌 Asegúrate de tener un archivo .env con estas variables.');
    return;
  }
  
  if (!comando) {
    mostrarAyuda();
    return;
  }
  
  switch (comando) {
    case 'list_projects':
      await listarProyectos();
      break;
    case 'get_project':
      await obtenerProyecto();
      break;
    case 'list_tables':
      await listarTablas();
      break;
    case 'list_extensions':
      await listarExtensiones();
      break;
    case 'execute_sql':
      await ejecutarSQL(args[1]);
      break;
    case 'get_logs':
      await obtenerLogs();
      break;
    case 'configurar_todo':
      await configurarSupabase();
      break;
    case 'corregir_trigger':
      await corregirTrigger();
      break;
    case 'verificar_rls':
      await verificarPoliticasRLS();
      break;
    case 'generar_tipos':
      await generarTiposTypescript();
      break;
    case 'help':
      mostrarAyuda();
      break;
    default:
      console.error(`❌ Comando desconocido: ${comando}`);
      mostrarAyuda();
  }
}

function mostrarAyuda() {
  console.log(`
Uso: node supabaseMCP.js <comando> [argumentos]

Comandos disponibles:
  list_projects       - Lista los proyectos (requiere Dashboard)
  get_project         - Muestra información del proyecto actual
  list_tables         - Lista las tablas en el esquema public
  list_extensions     - Lista las extensiones instaladas
  execute_sql <sql>   - Ejecuta SQL personalizado
  get_logs            - Obtiene logs (requiere Dashboard)
  configurar_todo     - Configura completamente la base de datos
  corregir_trigger    - Corrige el trigger handle_new_user
  verificar_rls       - Verifica las políticas RLS
  generar_tipos       - Genera tipos TypeScript (requiere CLI)
  help                - Muestra esta ayuda
`);
}

// Ejecutar el programa
main().catch(console.error);