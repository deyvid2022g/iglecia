import { supabase } from './lib/supabase';

// Función para probar la creación de prédicas
export async function testSermonCreation() {
  console.log('🔄 Probando creación de prédicas...');
  
  try {
    // 1. Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError.message);
      return false;
    }
    
    if (!user) {
      console.log('❌ Usuario no autenticado');
      console.log('💡 Necesitas iniciar sesión para crear prédicas');
      return false;
    }
    
    console.log('✅ Usuario autenticado:', user.email);
    
    // 2. Verificar perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message);
      return false;
    }
    
    console.log('✅ Perfil del usuario:', {
      name: profile.full_name,
      email: profile.email,
      role: profile.role
    });
    
    // 3. Probar inserción de prédica de prueba
    const testSermon = {
      slug: 'test-sermon-' + Date.now(),
      title: 'Prédica de Prueba',
      description: 'Esta es una prédica de prueba para verificar permisos',
      speaker: 'Pastor de Prueba',
      sermon_date: new Date().toISOString().split('T')[0],
      duration: '30:00',
      video_url: 'https://youtube.com/watch?v=test',
      thumbnail_url: 'https://example.com/thumbnail.jpg',
      tags: ['prueba', 'test'],
      has_transcript: false,
      is_published: true,
      featured: false,
      created_by: user.id,
      view_count: 0,
      like_count: 0,
      comment_count: 0
    };
    
    console.log('🔄 Intentando crear prédica de prueba...');
    
    const { data: sermon, error: insertError } = await supabase
      .from('sermons')
      .insert(testSermon)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Error creando prédica:', insertError.message);
      console.error('Detalles del error:', insertError);
      
      // Verificar si es un problema de RLS
      if (insertError.message.includes('RLS') || insertError.message.includes('policy')) {
        console.log('💡 Problema detectado: Políticas RLS (Row Level Security)');
        console.log('💡 Solución: Necesitas configurar las políticas RLS en Supabase');
      }
      
      return false;
    }
    
    console.log('✅ Prédica creada exitosamente:', sermon.id);
    
    // 4. Limpiar datos de prueba
    const { error: deleteError } = await supabase
      .from('sermons')
      .delete()
      .eq('id', sermon.id);
      
    if (deleteError) {
      console.log('⚠️ No se pudo eliminar la prédica de prueba:', deleteError.message);
    } else {
      console.log('🧹 Prédica de prueba eliminada correctamente');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
}

// Función para verificar políticas RLS
export async function checkRLSPolicies() {
  console.log('\n🔄 Verificando políticas RLS...');
  
  try {
    // Intentar leer la tabla sermons
    const { data, error } = await supabase
      .from('sermons')
      .select('id, title, created_by')
      .limit(1);
      
    if (error) {
      console.error('❌ Error leyendo tabla sermons:', error.message);
      return false;
    }
    
    console.log('✅ Lectura de tabla sermons exitosa');
    console.log(`📊 Registros encontrados: ${data?.length || 0}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verificando RLS:', error);
    return false;
  }
}

// Ejecutar pruebas si se ejecuta directamente
if (import.meta.env.DEV) {
  console.log('🚀 Iniciando pruebas de creación de prédicas...');
  
  checkRLSPolicies().then(() => {
    testSermonCreation().then((success) => {
      if (success) {
        console.log('\n🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.');
      } else {
        console.log('\n❌ Las pruebas fallaron. Revisa los errores anteriores.');
      }
    });
  });
}