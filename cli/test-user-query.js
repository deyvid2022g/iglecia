#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserQuery() {
  console.log('🔍 === PROBANDO CONSULTA DE USUARIOS ===\n');

  try {
    // Probar la consulta exacta que usa useUserManagement
    console.log('📊 Probando consulta con select específico...');
    const { data: usersData, error } = await supabase
      .from('users')
      .select('id,email,full_name,role,created_at,updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error en la consulta:', error);
      return;
    }

    console.log(`✅ Consulta exitosa: ${usersData.length} usuarios encontrados\n`);

    // Mostrar los datos
    console.log('📋 Datos obtenidos:');
    usersData.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email}) - Rol: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Creado: ${user.created_at}`);
      console.log(`   Actualizado: ${user.updated_at}\n`);
    });

    // Calcular estadísticas como lo hace useUserManagement
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: usersData.length,
      admins: usersData.filter(user => user.role === 'admin').length,
      users: usersData.filter(user => user.role === 'user').length,
      members: usersData.filter(user => user.role === 'member').length,
      newThisMonth: usersData.filter(user => 
        new Date(user.created_at) >= firstDayOfMonth
      ).length
    };

    console.log('📊 Estadísticas calculadas:');
    console.log(`  - Total: ${stats.total}`);
    console.log(`  - Admins: ${stats.admins}`);
    console.log(`  - Users: ${stats.users}`);
    console.log(`  - Members: ${stats.members}`);
    console.log(`  - Nuevos este mes: ${stats.newThisMonth}`);

    // Probar también con PostgREST directo (simulando el fetch)
    console.log('\n🌐 Probando con fetch directo...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/users?select=id,email,full_name,role,created_at,updated_at&order=created_at.desc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Respuesta:', errorText);
      } else {
        const fetchData = await response.json();
        console.log(`✅ Fetch directo exitoso: ${fetchData.length} usuarios`);
      }
    } catch (fetchError) {
      console.error('❌ Error en fetch directo:', fetchError);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la prueba
testUserQuery().then(() => {
  console.log('\n🏁 Prueba de consulta completada');
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});