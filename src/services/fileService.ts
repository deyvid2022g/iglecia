import { useState } from 'react';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll, 
  getMetadata 
} from 'firebase/storage';
import { storage } from '../lib/firebase';
import { resizeImage } from './utilsService';
import { validateFile } from './validationService';

// Tipos para el servicio de archivos
export interface UploadOptions {
  bucket: string;
  folder?: string;
  resize?: {
    maxWidth: number;
    maxHeight: number;
    quality?: number;
  };
  allowedTypes?: string[];
  maxSize?: number; // en MB
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// Configuraciones predefinidas para diferentes tipos de archivos
export const UPLOAD_CONFIGS = {
  avatar: {
    bucket: 'avatars',
    resize: { maxWidth: 200, maxHeight: 200, quality: 0.8 },
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 2 // 2MB
  },
  eventImage: {
    bucket: 'events',
    resize: { maxWidth: 1200, maxHeight: 800, quality: 0.85 },
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 // 5MB
  },
  sermonThumbnail: {
    bucket: 'sermons',
    folder: 'thumbnails',
    resize: { maxWidth: 800, maxHeight: 600, quality: 0.8 },
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 3 // 3MB
  },
  blogImage: {
    bucket: 'blog',
    resize: { maxWidth: 1200, maxHeight: 800, quality: 0.85 },
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 // 5MB
  },
  ministryImage: {
    bucket: 'ministries',
    resize: { maxWidth: 600, maxHeight: 400, quality: 0.8 },
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 3 // 3MB
  },
  churchLogo: {
    bucket: 'settings',
    folder: 'logos',
    resize: { maxWidth: 400, maxHeight: 400, quality: 0.9 },
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxSize: 2 // 2MB
  },
  document: {
    bucket: 'documents',
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 // 10MB
  },
  audio: {
    bucket: 'sermons',
    folder: 'audio',
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    maxSize: 100 // 100MB
  },
  video: {
    bucket: 'sermons',
    folder: 'video',
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxSize: 500 // 500MB
  }
};

// Función principal para subir archivos
export const uploadFile = async (
  file: File,
  options: UploadOptions,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  try {
    // Validar archivo
    const validation = await validateFile(file, {
      maxSize: options.maxSize,
      allowedTypes: options.allowedTypes,
      maxWidth: options.resize?.maxWidth,
      maxHeight: options.resize?.maxHeight
    });

    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    let fileToUpload: File | Blob = file;

    // Redimensionar imagen si es necesario
    if (options.resize && file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      onProgress?.(10);
      fileToUpload = await resizeImage(
        file,
        options.resize.maxWidth,
        options.resize.maxHeight,
        options.resize.quality
      );
      onProgress?.(30);
    }

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
    
    // Construir ruta del archivo
    const filePath = options.folder 
      ? `${options.folder}/${fileName}`
      : fileName;

    onProgress?.(50);

    // Crear referencia al archivo en Firebase Storage
    const fileRef = ref(storage, `${options.bucket}/${filePath}`);

    // Subir archivo a Firebase Storage con progreso
    if (onProgress) {
      const uploadTask = uploadBytesResumable(fileRef, fileToUpload);
      
      await new Promise<void>((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = 50 + (snapshot.bytesTransferred / snapshot.totalBytes) * 30;
            onProgress(progress);
          },
          (error) => reject(error),
          () => resolve()
        );
      });
    } else {
      await uploadBytes(fileRef, fileToUpload);
    }

    onProgress?.(80);

    // Obtener URL de descarga del archivo
    const downloadURL = await getDownloadURL(fileRef);

    onProgress?.(100);

    return {
      success: true,
      url: downloadURL,
      path: filePath
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al subir archivo'
    };
  }
};

// Función para subir múltiples archivos
export const uploadMultipleFiles = async (
  files: File[],
  options: UploadOptions,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(
      files[i],
      options,
      (progress) => onProgress?.(i, progress)
    );
    results.push(result);
  }

  return results;
};

// Función para eliminar archivo
export const deleteFile = async (bucket: string, filePath: string): Promise<boolean> => {
  try {
    const fileRef = ref(storage, `${bucket}/${filePath}`);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

// Función para obtener URL de descarga (Firebase Storage no requiere URLs firmadas para archivos públicos)
export const getSignedUrl = async (
  bucket: string,
  filePath: string
): Promise<string | null> => {
  try {
    const fileRef = ref(storage, `${bucket}/${filePath}`);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  } catch (error) {
    console.error('Error al obtener URL de descarga:', error);
    return null;
  }
};

// Función para listar archivos en un bucket
export const listFiles = async (
  bucket: string,
  folder?: string,
  limit: number = 100
): Promise<{ name: string; id: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: Record<string, unknown> }[]> => {
  try {
    const folderPath = folder ? `${bucket}/${folder}` : bucket;
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    // Obtener metadatos para cada archivo
    const filesWithMetadata = await Promise.all(
      result.items.slice(0, limit).map(async (itemRef) => {
        try {
          const metadata = await getMetadata(itemRef);
          return {
            name: itemRef.name,
            id: itemRef.fullPath,
            updated_at: metadata.updated || new Date().toISOString(),
            created_at: metadata.timeCreated || new Date().toISOString(),
            last_accessed_at: metadata.updated || new Date().toISOString(),
            metadata: metadata.customMetadata || {}
          };
        } catch (error) {
          console.error('Error al obtener metadatos:', error);
          return {
            name: itemRef.name,
            id: itemRef.fullPath,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            metadata: {}
          };
        }
      })
    );
    
    // Ordenar por fecha de creación (más recientes primero)
    return filesWithMetadata.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error al listar archivos:', error);
    return [];
  }
};

// Función para obtener información de un archivo
export const getFileInfo = async (bucket: string, filePath: string) => {
  try {
    const fileRef = ref(storage, `${bucket}/${filePath}`);
    const metadata = await getMetadata(fileRef);
    
    return {
      name: fileRef.name,
      id: fileRef.fullPath,
      updated_at: metadata.updated || new Date().toISOString(),
      created_at: metadata.timeCreated || new Date().toISOString(),
      last_accessed_at: metadata.updated || new Date().toISOString(),
      metadata: metadata.customMetadata || {},
      size: metadata.size,
      contentType: metadata.contentType
    };
  } catch (error) {
    console.error('Error al obtener información del archivo:', error);
    return null;
  }
};

// Función para inicializar estructura de carpetas (Firebase Storage crea automáticamente las carpetas)
export const createBucketsIfNotExist = async () => {
  // En Firebase Storage, las carpetas se crean automáticamente cuando se sube el primer archivo
  // Esta función se mantiene para compatibilidad pero no es necesaria
  console.log('Firebase Storage: Las carpetas se crean automáticamente al subir archivos');
  return Promise.resolve();
};

// Hook para manejo de archivos con React
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, config: keyof typeof UPLOAD_CONFIGS): Promise<UploadResult> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await uploadFile(
        file,
        UPLOAD_CONFIGS[config],
        setProgress
      );

      if (!result.success) {
        setError(result.error || 'Error al subir archivo');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setUploading(false);
    }
  };

  const uploadMultiple = async (
    files: File[],
    config: keyof typeof UPLOAD_CONFIGS
  ): Promise<UploadResult[]> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const results = await uploadMultipleFiles(
        files,
        UPLOAD_CONFIGS[config],
        (fileIndex, fileProgress) => {
          const totalProgress = ((fileIndex * 100) + fileProgress) / files.length;
          setProgress(totalProgress);
        }
      );

      const hasErrors = results.some(result => !result.success);
      if (hasErrors) {
        const errors = results
          .filter(result => !result.success)
          .map(result => result.error)
          .join(', ');
        setError(errors);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const remove = async (bucket: string, filePath: string): Promise<boolean> => {
    return await deleteFile(bucket, filePath);
  };

  return {
    uploading,
    progress,
    error,
    upload,
    uploadMultiple,
    remove,
    clearError: () => setError(null)
  };
};

// Función para optimizar imágenes antes de subir
export const optimizeImage = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'webp';
  } = {}
): Promise<Blob> => {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calcular dimensiones optimizadas
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;

      // Aplicar filtros de optimización
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Dibujar imagen optimizada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob con formato y calidad especificados
      const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, mimeType, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};