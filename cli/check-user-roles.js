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

async function checkUserRoles() {
  console.log('🔍 === VERIFICANDO ROLES DE USUARIOS ===\n');

  try {
    // Obtener todos los usuarios con sus roles
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at');

    if (error) {
      console.error('❌ Error al consultar usuarios:', error);
      return;
    }

    console.log(`✅ Encontrados ${users.length} usuarios\n`);

    // Mostrar todos los usuarios
    console.log('📋 Lista de usuarios:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email}) - Rol: "${user.role}"`);
    });

    // Contar roles únicos
    const roleCount = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Distribución de roles:');
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`  - "${role}": ${count} usuario(s)`);
    });

    console.log('\n🔍 Roles únicos encontrados:', Object.keys(roleCount));

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar la verificación
checkUserRoles().then(() => {
  console.log('\n🏁 Verificación de roles completada');
}).catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});