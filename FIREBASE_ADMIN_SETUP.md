# Configuración del Sistema de Administración Firebase

Este documento explica cómo configurar y usar el sistema de administración Firebase implementado en la aplicación.

## Configuración Inicial

### 1. Configuración de Firebase Admin SDK

El proyecto ya incluye la configuración necesaria para Firebase Admin SDK:

- **Archivo de credenciales**: `onyx-parser-457801-t6-firebase-adminsdk-fbsvc-78f2b2d495.json`
- **Configuración Admin**: `src/lib/firebase-admin.ts`
- **Script de creación**: `scripts/create-admin.js`

### 2. Instalación de Dependencias

Asegúrate de que `firebase-admin` esté instalado:

```bash
npm install firebase-admin
```

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
FIREBASE_ADMIN_SDK_PATH=./onyx-parser-457801-t6-firebase-adminsdk-fbsvc-78f2b2d495.json
```

## Creación de Administradores

### Método 1: Script de Línea de Comandos

Usa el script incluido para crear un administrador:

```bash
node scripts/create-admin.js
```

El script te pedirá:
- Email del administrador
- Contraseña
- Nombre para mostrar

### Método 2: Configuración Manual

1. **Crear usuario en Firebase Console**:
   - Ve a Firebase Console > Authentication > Users
   - Agrega un nuevo usuario
   - Copia el UID del usuario

2. **Asignar rol de administrador**:
   ```javascript
   // En Node.js o Firebase Functions
   import { getAuth } from 'firebase-admin/auth';
   import { getFirestore } from 'firebase-admin/firestore';
   
   const auth = getAuth();
   const db = getFirestore();
   
   // Asignar Custom Claims
   await auth.setCustomUserClaims(uid, {
     admin: true,
     role: 'admin',
     permissions: ['read', 'write', 'delete', 'manage_users']
   });
   
   // Crear perfil en Firestore
   await db.collection('users').doc(uid).set({
     email: 'admin@example.com',
     displayName: 'Administrador',
     role: 'admin',
     permissions: ['read', 'write', 'delete', 'manage_users'],
     isActive: true,
     createdAt: new Date()
   });
   ```

## Configuración de Firestore

### Reglas de Seguridad

Configura las reglas de Firestore para permitir acceso administrativo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Reglas específicas para administradores
    match /users/{userId} {
      // Los usuarios pueden leer su propio perfil
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Solo administradores pueden escribir perfiles de usuario
      allow write: if request.auth != null && 
        (request.auth.token.admin == true || 
         request.auth.token.role == 'admin');
    }
    
    // Colección de administración solo para admins
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        (request.auth.token.admin == true || 
         request.auth.token.role == 'admin');
    }
  }
}
```

### Estructura de Datos

La aplicación utiliza la siguiente estructura en Firestore:

```
users/
  {uid}/
    email: string
    displayName: string
    role: 'user' | 'admin'
    permissions: string[]
    isActive: boolean
    createdAt: timestamp
    updatedAt: timestamp
```

## Uso del Panel de Administración

### Acceso al Panel

1. Inicia sesión con una cuenta de administrador
2. Navega a `/admin` en la aplicación
3. El panel verificará automáticamente los permisos

### Funcionalidades Disponibles

- **Gestión de Usuarios**:
  - Ver lista de todos los usuarios
  - Editar roles y permisos
  - Activar/desactivar usuarios
  - Eliminar usuarios

- **Estadísticas del Sistema**:
  - Número total de usuarios
  - Usuarios activos
  - Número de administradores

- **Estado del Sistema**:
  - Conexión a Firebase
  - Estado de autenticación
  - Estado de la base de datos

## Componentes Implementados

### Hooks

- **`useAdmin`**: Hook principal para funcionalidades administrativas
  - Verificación de permisos
  - Gestión de usuarios
  - Operaciones CRUD

### Componentes

- **`AdminPanel`**: Panel principal de administración
  - Tabla de usuarios
  - Modal de edición
  - Acciones de usuario

- **`AdminPage`**: Página completa de administración
  - Layout responsivo
  - Estadísticas del sistema
  - Acciones rápidas

### Servicios

- **`firebase-admin.ts`**: Configuración del Admin SDK
  - Inicialización del SDK
  - Funciones de gestión de usuarios
  - Operaciones de Custom Claims

## Seguridad

### Mejores Prácticas

1. **Protección de Credenciales**:
   - Nunca commits el archivo de credenciales al repositorio
   - Usa variables de entorno en producción
   - Rota las claves regularmente

2. **Validación de Permisos**:
   - Verifica permisos tanto en frontend como backend
   - Usa Custom Claims para roles críticos
   - Implementa logging de acciones administrativas

3. **Reglas de Firestore**:
   - Implementa reglas restrictivas
   - Valida datos en el servidor
   - Usa índices compuestos para consultas complejas

### Configuración de Producción

Para producción, considera:

1. **Variables de Entorno**:
   ```env
   FIREBASE_ADMIN_SDK_PATH=/path/to/service-account.json
   FIREBASE_PROJECT_ID=your-project-id
   ```

2. **Reglas de Firestore más Restrictivas**:
   ```javascript
   // Solo permitir operaciones específicas
   match /users/{userId} {
     allow read: if request.auth != null && 
       (request.auth.uid == userId || 
        request.auth.token.admin == true);
     
     allow write: if request.auth != null && 
       request.auth.token.admin == true &&
       validateUserData(request.resource.data);
   }
   ```

3. **Logging y Monitoreo**:
   - Implementa logs de acciones administrativas
   - Configura alertas para acciones críticas
   - Monitorea el uso de la API

## Solución de Problemas

### Errores Comunes

1. **"Permission denied"**:
   - Verifica que el usuario tenga Custom Claims
   - Revisa las reglas de Firestore
   - Confirma que el usuario esté autenticado

2. **"Admin SDK not initialized"**:
   - Verifica la ruta del archivo de credenciales
   - Confirma que el archivo JSON sea válido
   - Revisa las variables de entorno

3. **"User not found"**:
   - Confirma que el usuario exista en Authentication
   - Verifica que el UID sea correcto
   - Revisa la sincronización entre Auth y Firestore

### Debugging

Para debuggear problemas:

```javascript
// Verificar Custom Claims
const user = await getAuth().getUser(uid);
console.log('Custom Claims:', user.customClaims);

// Verificar documento en Firestore
const userDoc = await getFirestore().collection('users').doc(uid).get();
console.log('User Document:', userDoc.data());
```

## Próximos Pasos

1. **Implementar Logging**: Agregar logs de acciones administrativas
2. **Notificaciones**: Sistema de notificaciones para cambios importantes
3. **Backup**: Implementar backup automático de datos críticos
4. **Analytics**: Dashboard con métricas de uso
5. **Roles Granulares**: Sistema de permisos más detallado

## Soporte

Para más información sobre Firebase Admin SDK:
- [Documentación Oficial](https://firebase.google.com/docs/admin/setup)
- [Guía de Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Reglas de Seguridad](https://firebase.google.com/docs/firestore/security/get-started)