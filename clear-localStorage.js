// Script para limpiar localStorage de datos mock de sermones
// Ejecutar en la consola del navegador

console.log('Limpiando localStorage de datos mock...');

// Limpiar datos de sermones
localStorage.removeItem('sermons');
localStorage.removeItem('sermon_likes');
localStorage.removeItem('sermon_categories');

// Verificar que se eliminaron
console.log('Sermones en localStorage:', localStorage.getItem('sermons'));
console.log('Likes de sermones en localStorage:', localStorage.getItem('sermon_likes'));
console.log('Categorías de sermones en localStorage:', localStorage.getItem('sermon_categories'));

console.log('localStorage limpiado exitosamente. Recarga la página para ver los cambios.');