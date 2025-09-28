#!/usr/bin/env node

// Cargar variables de entorno
import dotenv from 'dotenv';
dotenv.config({ path: './cli/.env' });

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  console.log('Asegúrate de que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para autenticación personalizada (igual que en authService.ts)
async function customSignIn(email, password) {
  try {
    console.log(`🔐 Intentando autenticación personalizada para: ${email}`);
    
    // Buscar usuario por email en la tabla users personalizada
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error || !user) {
      throw new Error('Credenciales inválidas - Usuario no encontrado');
    }
    
    console.log(`✅ Usuario encontrado: ${user.full_name} (${user.role})`);
    
    // Verificar contraseña usando bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      throw new Error('Credenciales inválidas - Contraseña incorrecta');
    }
    
    console.log('✅ Contraseña verificada correctamente');
    
    // Crear sesión personalizada
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días
    
    const accessToken = `token_${user.id}_${Date.now()}`;
    
    // Guardar la sesión en la tabla sessions
    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: user.id,
          access_token: accessToken,
          expires_at: expiresAt.toISOString()
        }
      ]);
      
    if (sessionError) {
      console.warn('⚠️ Error al guardar la sesión:', sessionError.message);
    } else {
      console.log('✅ Sesión creada correctamente');
    }
    
    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      session: {
        access_token: accessToken,
        expires_at: expiresAt.getTime(),
        user_id: user.id
      }
    };
  } catch (error) {
    console.error('❌ Error en autenticación personalizada:', error.message);
    throw error;
  }
}

async function testCustomAuth() {
  try {
    console.log('🧪 PRUEBA CON AUTENTICACIÓN PERSONALIZADA');
    console.log('==================================================');
    
    // Verificar conexión
    console.log('🔗 Verificando conexión...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return;
    }
    console.log('✅ Conexión exitosa!');

    // Autenticación personalizada
    const authResult = await customSignIn('admin@lugarderefugio.com', 'admin123');
    const user = authResult.user;
    console.log('✅ Autenticación exitosa!');
    console.log(`👤 Usuario: ${user.full_name} (${user.role})`);
    
    // Verificar el contexto de autenticación actual
    console.log('\n🔍 Verificando contexto de autenticación...');
    try {
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      console.log('📋 Usuario actual en Supabase Auth:', currentUser?.user?.email || 'No autenticado');
      
      // Verificar si podemos acceder a información del usuario actual
      const { data: sessionInfo, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (sessionInfo) {
        console.log('✅ Sesión encontrada en la base de datos');
      } else {
        console.log('❌ No se encontró sesión en la base de datos:', sessionError?.message);
      }
    } catch (error) {
      console.log('❌ Error verificando contexto:', error.message);
    }

    // Probar acceso a categorías de sermones
    console.log('\n📚 Probando acceso a categorías de sermones...');
    const { data: categories, error: categoriesError } = await supabase
      .from('sermon_categories')
      .select('*')
      .eq('is_active', true);
    
    if (categoriesError) {
      console.error('❌ Error al obtener categorías:', categoriesError);
    } else {
      console.log(`✅ Categorías encontradas: ${categories.length}`);
      categories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug})`);
      });
    }

    // Probar acceso a sermones
    console.log('\n🎤 Probando acceso a sermones...');
    const { data: sermons, error: sermonsError } = await supabase
      .from('sermons')
      .select('*')
      .limit(5);
    
    if (sermonsError) {
      console.error('❌ Error al obtener sermones:', sermonsError);
    } else {
      console.log(`✅ Sermones encontrados: ${sermons.length}`);
      if (sermons.length > 0) {
        sermons.forEach(sermon => {
          console.log(`  - ${sermon.title} por ${sermon.speaker}`);
        });
      } else {
        console.log('  (No hay sermones en la base de datos)');
      }
    }

    // Probar inserción de una categoría de prueba
    console.log('\n➕ Probando inserción de categoría de prueba...');
     try {
       // Intentar insertar con el contexto de usuario actual
       const { data: newCategory, error: insertError } = await supabase
         .from('sermon_categories')
         .insert([
           {
             name: 'Categoría de Prueba CLI',
             slug: 'categoria-prueba-cli',
             description: 'Esta es una categoría de prueba creada por el CLI',
             color: '#3B82F6',
             icon: 'test',
             display_order: 999,
             is_active: true
           }
         ])
         .select();

      if (insertError) {
        console.log('❌ Error al insertar categoría:', insertError.message);
        console.log('📋 Detalles del error:', insertError);
        
        // Intentar con autenticación de Supabase
        console.log('\n🔄 Intentando con autenticación nativa de Supabase...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: 'admin@lugarderefugio.com',
          password: 'admin123'
        });
        
        if (authError) {
          console.log('❌ Error en autenticación nativa:', authError.message);
        } else {
          console.log('✅ Autenticación nativa exitosa');
          
          // Intentar insertar nuevamente
           const { data: newCategory2, error: insertError2 } = await supabase
             .from('sermon_categories')
             .insert([
               {
                 name: 'Categoría de Prueba Auth Nativa',
                 slug: 'categoria-prueba-auth-nativa',
                 description: 'Esta es una categoría de prueba con auth nativa',
                 color: '#10B981',
                 icon: 'auth',
                 display_order: 998,
                 is_active: true
               }
             ])
             .select();
            
          if (insertError2) {
            console.log('❌ Error con auth nativa:', insertError2.message);
          } else {
            console.log('✅ Inserción exitosa con auth nativa:', newCategory2);
          }
        }
      } else {
        console.log('✅ Categoría insertada exitosamente:', newCategory);
      }
    } catch (error) {
      console.log('❌ Error inesperado:', error.message);
    }

    console.log('\n🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testCustomAuth();