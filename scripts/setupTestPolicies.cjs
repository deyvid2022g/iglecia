// Script para configurar políticas de prueba en Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar cliente de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupTestPolicies() {
  console.log('🔧 Configurando políticas de prueba...');
  
  const policies = [
    {
      name: 'Allow test user insertion',
      sql: `CREATE POLICY "Allow test user insertion" ON public.users FOR INSERT WITH CHECK (email LIKE '%test%' OR email LIKE '%integration%');`
    },
    {
      name: 'Allow test user read', 
      sql: `CREATE POLICY "Allow test user read" ON public.users FOR SELECT USING (email LIKE '%test%' OR email LIKE '%integration%');`
    },
    {
      name: 'Allow test user update',
      sql: `CREATE POLICY "Allow test user update" ON public.users FOR UPDATE USING (email LIKE '%test%' OR email LIKE '%integration%');`
    },
    {
      name: 'Allow test user delete',
      sql: `CREATE POLICY "Allow test user delete" ON public.users FOR DELETE USING (email LIKE '%test%' OR email LIKE '%integration%');`
    }
  ];
  
  try {
    for (const policy of policies) {
      console.log(`📝 Creando política: ${policy.name}`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: policy.sql
      });
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Política ya existe: ${policy.name}`);
        } else {
          console.error(`❌ Error creando política ${policy.name}:`, error);
        }
      } else {
        console.log(`✅ Política creada: ${policy.name}`);
      }
    }
    
    console.log('\n🎉 Configuración de políticas completada');
    
  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

setupTestPolicies();