import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
dotenv.config({ path: 'cli/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
  try {
    console.log('🌱 AGREGANDO DATOS DE PRUEBA');
    console.log('==================================================');

    // Intentar autenticación con credenciales de administrador
    console.log('👤 Intentando autenticación...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@lugarderefugio.com',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Error de autenticación:', authError.message);
      console.log('⚠️ No se puede continuar sin autenticación válida');
      return;
    } else {
      console.log('✅ Autenticación exitosa como administrador');
      console.log(`   Usuario: ${authData.user.email}`);
    }

    // Agregar categorías de prueba
    console.log('\n📂 Agregando categorías...');
    const categories = [
      { name: 'Doctrina', description: 'Enseñanzas doctrinales', is_active: true },
      { name: 'Evangelismo', description: 'Mensajes evangelísticos', is_active: true },
      { name: 'Vida Cristiana', description: 'Crecimiento espiritual', is_active: true },
      { name: 'Familia', description: 'Valores familiares', is_active: true },
      { name: 'Juventud', description: 'Mensajes para jóvenes', is_active: true }
    ];

    for (const category of categories) {
      const { data, error } = await supabase
        .from('sermon_categories')
        .insert([category])
        .select();

      if (error) {
        console.error(`❌ Error al agregar categoría "${category.name}":`, error.message);
      } else {
        console.log(`✅ Categoría "${category.name}" agregada con ID: ${data[0].id}`);
      }
    }

    // Verificar categorías agregadas
    console.log('\n📋 Verificando categorías agregadas...');
    const { data: allCategories, error: categoriesError } = await supabase
      .from('sermon_categories')
      .select('*')
      .eq('is_active', true);

    if (categoriesError) {
      console.error('❌ Error al verificar categorías:', categoriesError);
    } else {
      console.log(`✅ Total de categorías activas: ${allCategories.length}`);
      allCategories.forEach(cat => {
        console.log(`   - ${cat.name} (ID: ${cat.id})`);
      });
    }

    console.log('\n🎉 Datos de prueba agregados exitosamente!');
    console.log('\n💡 Ahora puedes usar el CLI para agregar prédicas a estas categorías.');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

seedData();