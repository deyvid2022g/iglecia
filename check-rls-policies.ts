import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  console.log('🔍 Verificando políticas RLS en la tabla profiles...');
  
  try {
    // Verificar políticas existentes usando una consulta SQL directa
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'profiles');
    
    if (policiesError) {
      console.log('❌ Error obteniendo políticas:', policiesError.message);
      
      // Intentar una consulta alternativa
      const { data: altData, error: altError } = await supabase.rpc('sql', {
        query: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies 
          WHERE tablename = 'profiles';
        `
      });
      
      if (altError) {
        console.log('❌ Error con consulta alternativa:', altError.message);
      } else {
        console.log('📋 Políticas encontradas (alternativa):', altData);
      }
    } else {
      console.log('📋 Políticas RLS encontradas:', policies);
    }
    
    // Verificar si RLS está habilitado
    const { data: tableInfo, error: tableError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('tablename', 'profiles');
    
    if (tableError) {
      console.log('❌ Error obteniendo información de tabla:', tableError.message);
    } else {
      console.log('📊 Información de tabla profiles:', tableInfo);
    }
    
    // Intentar verificar el estado de RLS directamente
    console.log('\n🔧 Intentando verificar estado de RLS...');
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity
        FROM pg_tables 
        WHERE tablename = 'profiles';
      `
    });
    
    if (rlsError) {
      console.log('❌ Error verificando RLS:', rlsError.message);
    } else {
      console.log('🔒 Estado de RLS:', rlsStatus);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkRLSPolicies();