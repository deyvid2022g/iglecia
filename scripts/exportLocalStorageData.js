/**
 * Script para exportar datos de localStorage a archivos JSON
 * 
 * Este script debe ser ejecutado en el navegador a través de la consola del desarrollador.
 * Exporta los datos de localStorage a archivos JSON que pueden ser utilizados por el script de migración.
 */

// Función para exportar datos de localStorage a archivos JSON
function exportLocalStorageData() {
  // Datos a exportar
  const data = {
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    events: JSON.parse(localStorage.getItem('events') || '[]'),
    sermons: JSON.parse(localStorage.getItem('sermons') || '[]'),
    blogPosts: JSON.parse(localStorage.getItem('blogPosts') || '[]')
  };

  // Mostrar resumen de los datos a exportar
  console.log('Resumen de datos a exportar:');
  Object.entries(data).forEach(([key, value]) => {
    console.log(`${key}: ${value.length} registros`);
  });

  // Descargar cada conjunto de datos como un archivo JSON
  Object.entries(data).forEach(([key, value]) => {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = key + '.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log(`Archivo ${key}.json descargado`);
  });

  console.log('Exportación completada. Por favor, mueve los archivos descargados a la carpeta "data" del proyecto.');
}

// Ejecutar la función
exportLocalStorageData();

// Instrucciones para el usuario
console.log(`
Instrucciones:
1. Crea una carpeta 'data' en la raíz del proyecto si no existe.
2. Mueve los archivos JSON descargados a la carpeta 'data'.
3. Ejecuta el script de migración con: node scripts/migrateToSupabaseImproved.js --migrate
`);