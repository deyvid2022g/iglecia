const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestBlogPost() {
  try {
    console.log('🔍 Creando post de prueba...');
    
    // Primero crear una categoría de prueba
    const { data: category, error: categoryError } = await supabase
      .from('blog_categories')
      .insert({
        name: 'Categoría de Prueba',
        slug: 'categoria-prueba',
        description: 'Una categoría de prueba',
        color: '#3B82F6',
        is_active: true,
        display_order: 1
      })
      .select()
      .single();
    
    if (categoryError) {
      console.error('❌ Error creando categoría:', categoryError);
      return;
    }
    
    console.log('✅ Categoría creada:', category);
    
    // Ahora crear un post de prueba
    const { data: post, error: postError } = await supabase
      .from('blog_posts')
      .insert({
        title: 'Post de Prueba',
        slug: 'post-prueba',
        excerpt: 'Este es un post de prueba para verificar la funcionalidad del blog',
        content: 'Contenido completo del post de prueba. Este post se creó para verificar que la funcionalidad del blog esté funcionando correctamente.',
        category_id: category.id,
        is_published: true,
        is_featured: false,
        published_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (postError) {
      console.error('❌ Error creando post:', postError);
    } else {
      console.log('✅ Post creado:', post);
    }
  } catch (err) {
    console.error('❌ Error general:', err.message);
  }
}

createTestBlogPost();