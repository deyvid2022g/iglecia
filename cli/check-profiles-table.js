import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('🔍 Verificando existencia de tablas...\n');
  
  // Verificar tabla profiles
  console.log('📋 Verificando tabla "profiles"...');
  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Error al acceder a "profiles":', profilesError.message);
    } else {
      console.log('✅ Tabla "profiles" existe y es accesible');
      console.log('📊 Datos de ejemplo:', profilesData);
    }
  } catch (error) {
    console.log('❌ Error al verificar "profiles":', error.message);
  }
  
  console.log('\n📋 Verificando tabla "users"...');
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ Error al acceder a "users":', usersError.message);
    } else {
      console.log('✅ Tabla "users" existe y es accesible');
      console.log('📊 Datos de ejemplo:', usersData);
    }
  } catch (error) {
    console.log('❌ Error al verificar "users":', error.message);
  }
}

checkTables().catch(console.error);