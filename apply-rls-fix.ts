import { createClient } from '@supabase/supabase-js';

// Credenciales directas para prueba
const supabaseUrl = 'https://toopbtydsiepeoisuecg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvb3BidHlkc2llcGVvaXN1ZWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzY0MDQsImV4cCI6MjA3MjA1MjQwNH0.ckYKpJDfqhbQ4mnZNDBBdR3Qd63VaS1jOhSIW3_SE8g';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function applyRLSFix() {
  console.log('🔧 Aplicando corrección de políticas RLS...');
  
  try {
    // Primero, verificar las políticas existentes
    console.log('📋 Verificando políticas existentes...');
    
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'profiles' });
    
    if (policiesError) {
      console.log('⚠️  No se pudieron obtener las políticas:', policiesError.message);
    } else {
      console.log('📋 Políticas encontradas:', policies);
    }
    
    // Intentar crear la política de inserción
    console.log('\n🛠️  Creando política de inserción...');
    
    const { error: createPolicyError } = await supabase
      .rpc('create_policy', {
        policy_name: 'Los usuarios pueden crear su propio perfil',
        table_name: 'profiles',
        operation: 'INSERT',
        check_expression: 'auth.uid() = id'
      });
    
    if (createPolicyError) {
      console.log('❌ Error creando política:', createPolicyError.message);
      
      // Intentar método alternativo: crear perfil directamente con bypass RLS
      console.log('\n🔄 Intentando método alternativo...');
      
      // Crear perfil de administrador directamente
      const adminEmail = 'lugarderefugio005@gmail.com';
      const adminId = '550e8400-e29b-41d4-a716-446655440000'; // UUID fijo para admin
      
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert({
          id: adminId,
          name: 'Administrador Iglesia',
          email: adminEmail,
          phone: '',
          role: 'admin',
          is_active: true,
          join_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (insertError) {
        console.log('❌ Error insertando perfil admin:', insertError.message);
      } else {
        console.log('✅ Perfil de administrador creado exitosamente');
      }
      
    } else {
      console.log('✅ Política de inserción creada exitosamente');
    }
    
  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

// Ejecutar la corrección
applyRLSFix();