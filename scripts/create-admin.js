#!/usr/bin/env node

// Script para crear un usuario administrador
// Uso: node scripts/create-admin.js <email> <password> [displayName]

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Leer el archivo de configuración del service account
const serviceAccountPath = path.join(__dirname, '..', 'onyx-parser-457801-t6-firebase-adminsdk-fbsvc-78f2b2d495.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Inicializar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: 'onyx-parser-457801-t6'
  });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

async function createAdminUser(email, password, displayName = '') {
  try {
    console.log('Creando usuario administrador...');
    
    // Crear usuario
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: true
    });

    console.log(`Usuario creado con UID: ${userRecord.uid}`);

    // Asignar claims de administrador
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_users']
    });

    console.log('Claims de administrador asignados');

    // Crear perfil en Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || '',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'manage_users'],
      createdAt: new Date(),
      isActive: true
    });

    console.log('Perfil de usuario creado en Firestore');
    console.log('\n✅ Usuario administrador creado exitosamente!');
    console.log(`📧 Email: ${email}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`👤 Nombre: ${displayName || 'No especificado'}`);
    
    return userRecord;
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error.message);
    throw error;
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Uso: node scripts/create-admin.js <email> <password> [displayName]');
    console.log('Ejemplo: node scripts/create-admin.js admin@iglesia.com miPassword123 "Administrador Principal"');
    process.exit(1);
  }

  const [email, password, displayName] = args;

  if (password.length < 6) {
    console.error('❌ La contraseña debe tener al menos 6 caracteres');
    process.exit(1);
  }

  try {
    await createAdminUser(email, password, displayName);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { createAdminUser };