import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Configuración del Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "onyx-parser-457801-t6",
  private_key_id: "78f2b2d4955eac179bc0dc7386859103466bc5fc",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCuoyJpVSN9eNHC\nxkJdT01ONDe3RnYw04OTwVhmOnrXAkrAUSlMn6Ka4P6uB8wgNRz2N/b6s28kxUpe\nox9oat04q+Z15pjqlYzmZ8C+f0IFZk45Dxk8Y5y9SjwUohSVRHm56Wkj0ONh/osd\nuNb8R51L4dVTbI3S4hr1HXpXTVuno7Utz88kRsE535FWbPhKvhhXHNBNkc55p3Qz\nMDCQjq2GCcs6r4aBl9f/MQ/Zb6zlb5T5IuGwYUSqikm4ojKjHQ7cege60aBUlKuF\nRB2gvZWEPTHYOae1Ib/p7dvndYDhI1Eu/4EyZAhxZVIo/GjWmbp9CMPSS9jQsmmv\nU57ixnSVAgMBAAECggEACA2tW1KqC5H8CGGos1FiJQJa9Gh7MFa8uV5f83zsZ8hr\nBpHnl+k/sClCjWd+JhkU8BTWHqsSK82uV41puCC/eWrR+qtq71x8ri5oMNDBDGsy\nncaAuSx10LPg7+mmjdilzWlCaDysk7sPkswQm/s4eYSdWBbINoqnSBj3KJoAaUtb\nibDuEPZEBwqNh/H8As/8tdnO8N+dBwd3G9lMsJGJDa4X1C6fAVF63Q54mcxPI9nP\nPgutlsUaPznd+4ykzX0eVErrDBZJQCVuziPqA2bvH16vxO7X+zBDx05Oi3h2/evO\nRmVwfFYDXHhX2xhNoUj1aOQcZ84HxpBnttt+L1koQQKBgQDpVMM+cVGMP7lM+T8I\nl986Ch2wTIc8L/DlHlIpS+pyKKLnUIQe/UUbMmhtiu3sfQ9qearlldXQccE+ArYn\nv776WgsziMYnp9Vc7pMs6To5SuPSg6W01IO2UPHSvRN6uXS9QPCeSwZoGDDYKwbB\nrWIdDm2YxuahZEIPSMoKyQ8xQQKBgQC/mpTwmCm0LZ9IiS6zzuh6/20h2ig0l47H\nNuJYV5NCZfdE9qWIg8CwxMsI53MU6J+aLDXXAduwgQd0qtYNi45gn+OsBg3744PI\n2rDXs7oeuTpGGWxK985CN4uUzLLATdvWC9svEpuXtb/J8A3xvIMMrws1N1zdwVcm\npQhAXJqaVQKBgQCZUhFZnqyvM9BXPBCnXORaBvurNR5H9lictWfXqwLLMNialtW6\nZ0JZtK3aDUh59VOD657YbbSp25XXYYDAbcbYSwLBQkazGB2ji0E6aabQrt01Hzxr\nrpk928KLb6K1KdgD5AA4g6QaEotGAD/YVE38OdbaZRh3RKID2RiqLaPGAQKBgDHS\n7rwJtX6HBo6ELcLQISAq36QX6LCUYKppGT7DtyVjAoPKZ40yRZ8x7WIpXYGoZChh\nKrb4YrppMxkhe3wWODXkHf4TrPs9VH2ccLQGpnVq0T59Se3MtrP9YayV9j2PgYUN\nnDeHbTJsLq1CYT3lOWbI9e8msF1x80m3TIgADKvpAoGAD7PLwycNVKITZM6WJCXb\nqwHLwlTpBnIw79183JHAT7tV7KtiB04KFSjuf8L+5Q1rnqI1hsV/PWiOtr8N8GS7\n5rUGKCOpNmmdkH9z+mRPPCVEQPqD3vYqiOyHQzwI9BIj5Cd99N8DhUts8BCXBNCY\n8EBIVh4a67O3o39zBU5Tzh4=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@onyx-parser-457801-t6.iam.gserviceaccount.com",
  client_id: "101412567171646459805",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40onyx-parser-457801-t6.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Inicializar Firebase Admin (solo si no está ya inicializado)
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
    projectId: 'onyx-parser-457801-t6'
  });
}

// Exportar servicios de Admin
export const adminAuth = getAuth();
export const adminDb = getFirestore();

// Funciones de utilidad para administradores
export const adminUtils = {
  // Crear un usuario administrador
  async createAdminUser(email: string, password: string, displayName?: string) {
    try {
      const userRecord = await adminAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: true
      });

      // Asignar claims de administrador
      await adminAuth.setCustomUserClaims(userRecord.uid, {
        admin: true,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users']
      });

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

      return userRecord;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  },

  // Asignar rol de administrador a un usuario existente
  async setAdminRole(uid: string) {
    try {
      await adminAuth.setCustomUserClaims(uid, {
        admin: true,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users']
      });

      // Actualizar perfil en Firestore
      await adminDb.collection('users').doc(uid).update({
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users'],
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error setting admin role:', error);
      throw error;
    }
  },

  // Verificar si un usuario es administrador
  async isAdmin(uid: string): Promise<boolean> {
    try {
      const userRecord = await adminAuth.getUser(uid);
      return userRecord.customClaims?.admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Listar todos los usuarios
  async listUsers(maxResults: number = 1000) {
    try {
      const listUsersResult = await adminAuth.listUsers(maxResults);
      return listUsersResult.users;
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  },

  // Eliminar un usuario
  async deleteUser(uid: string) {
    try {
      await adminAuth.deleteUser(uid);
      await adminDb.collection('users').doc(uid).delete();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};