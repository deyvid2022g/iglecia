#!/usr/bin/env node

// Cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config({ path: './cli/.env' });

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  console.log('Asegúrate de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithAuth() {
  try {
    console.log('🧪 PRUEBA CON AUTENTICACIÓN');
    console.log('==================================================');
    
    // Verificar conexión
    console.log('🔗 Verificando conexión...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('sermon_categories')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return;
    }
    console.log('✅ Conexión exitosa!');

    // Intentar autenticación
    console.log('\n👤 Intentando autenticación...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@lugarderefugio.com',
      password: 'admin123'
    });

    if (authError) {
      console.log('⚠️ Error de autenticación:', authError.message);
      console.log('Intentando con credenciales de prueba...');
      
      // Intentar con credenciales de prueba
      const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'admin123'
      });

      if (authError2) {
        console.log('⚠️ No se pudo autenticar, continuando sin autenticación...');
      } else {
        console.log('✅ Autenticación exitosa con credenciales de prueba');
      }
    } else {
      console.log('✅ Autenticación exitosa como administrador');
      console.log(`   Usuario: ${authData.user.email}`);
    }

    // Ahora intentar obtener categorías
    console.log('\n📂 Obteniendo categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('sermon_categories')
      .select('*')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Error al obtener categorías:', categoriesError);
    } else {
      console.log('✅ Categorías encontradas:', categories.length);
      if (categories.length > 0) {
        console.log('📋 Estructura de la primera categoría:');
        console.log(JSON.stringify(categories[0], null, 2));
      }
    }

    // Intentar obtener prédicas existentes
    console.log('\n📖 Obteniendo prédicas existentes...');
    const { data: sermons, error: sermonsError } = await supabase
      .from('sermons')
      .select('*')
      .limit(3);

    if (sermonsError) {
      console.error('❌ Error al obtener prédicas:', sermonsError);
    } else {
      console.log('✅ Prédicas encontradas:', sermons.length);
      if (sermons.length > 0) {
        console.log('📋 Estructura de la primera prédica:');
        console.log(JSON.stringify(sermons[0], null, 2));
      }
    }

    // Intentar obtener usuarios (comentado porque la tabla profiles no existe)
    // console.log('\n👥 Obteniendo usuarios...');
    // const { data: profiles, error: profilesError } = await supabase
    //   .from('profiles')
    //   .select('id, email, role')
    //   .limit(5);

    // if (profilesError) {
    //   console.error('❌ Error al obtener usuarios:', profilesError);
    // } else {
    //   console.log('✅ Usuarios encontrados:', profiles.length);
    //   profiles.forEach(profile => {
    //     console.log(`   - ${profile.email} (Rol: ${profile.role})`);
    //   });
    // }

    console.log('\n🎉 Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error.message);
  }
}

// Ejecutar la prueba
testWithAuth();