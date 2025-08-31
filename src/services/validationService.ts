// Servicio de validaciones para formularios y datos

// Validaciones de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validaciones de teléfono colombiano
export const validateColombianPhone = (phone: string): boolean => {
  // Acepta formatos: +57XXXXXXXXXX, 57XXXXXXXXXX, 3XXXXXXXXX, XXXXXXXXXX
  const phoneRegex = /^(\+?57)?[13][0-9]{9}$/;
  const cleanPhone = phone.replace(/[\s-()]/g, '');
  return phoneRegex.test(cleanPhone);
};

// Validación de contraseña segura
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validación de nombre completo
export const validateFullName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
  return nameRegex.test(name.trim()) && name.trim().split(' ').length >= 2;
};

// Validación de edad
export const validateAge = (birthDate: string): {
  isValid: boolean;
  age: number;
  error?: string;
} => {
  const birth = new Date(birthDate);
  const today = new Date();
  
  if (birth > today) {
    return {
      isValid: false,
      age: 0,
      error: 'La fecha de nacimiento no puede ser futura'
    };
  }
  
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return {
      isValid: age - 1 >= 0 && age - 1 <= 120,
      age: age - 1,
      error: age - 1 < 0 || age - 1 > 120 ? 'Edad inválida' : undefined
    };
  }
  
  return {
    isValid: age >= 0 && age <= 120,
    age,
    error: age < 0 || age > 120 ? 'Edad inválida' : undefined
  };
};

// Validación de URL
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validación de slug (para URLs amigables)
export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
};

// Validación de fechas de eventos
export const validateEventDates = (startDate: string, endDate?: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const start = new Date(startDate);
  const now = new Date();
  
  // Permitir eventos que empiecen desde hoy
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (start < today) {
    errors.push('La fecha de inicio no puede ser anterior a hoy');
  }
  
  if (endDate) {
    const end = new Date(endDate);
    if (end < start) {
      errors.push('La fecha de fin no puede ser anterior a la fecha de inicio');
    }
    
    // Validar que el evento no dure más de 30 días
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      errors.push('El evento no puede durar más de 30 días');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validación de horarios
export const validateTimeRange = (startTime: string, endTime: string): {
  isValid: boolean;
  error?: string;
} => {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  if (end <= start) {
    return {
      isValid: false,
      error: 'La hora de fin debe ser posterior a la hora de inicio'
    };
  }
  
  // Validar que no sea más de 12 horas
  const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  if (diffHours > 12) {
    return {
      isValid: false,
      error: 'El evento no puede durar más de 12 horas'
    };
  }
  
  return { isValid: true };
};

// Validación de capacidad de eventos
export const validateEventCapacity = (capacity: number): {
  isValid: boolean;
  error?: string;
} => {
  if (capacity < 1) {
    return {
      isValid: false,
      error: 'La capacidad debe ser al menos 1 persona'
    };
  }
  
  if (capacity > 10000) {
    return {
      isValid: false,
      error: 'La capacidad no puede exceder 10,000 personas'
    };
  }
  
  return { isValid: true };
};

// Validación de contenido de blog/sermón
export const validateContent = (content: string, minLength: number = 100): {
  isValid: boolean;
  wordCount: number;
  readTime: number;
  errors: string[];
} => {
  const errors: string[] = [];
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200); // 200 palabras por minuto
  
  if (content.trim().length < minLength) {
    errors.push(`El contenido debe tener al menos ${minLength} caracteres`);
  }
  
  if (wordCount < 50) {
    errors.push('El contenido debe tener al menos 50 palabras');
  }
  
  // Validar que no tenga demasiados enlaces
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 10) {
    errors.push('El contenido no puede tener más de 10 enlaces');
  }
  
  return {
    isValid: errors.length === 0,
    wordCount,
    readTime,
    errors
  };
};

// Validación de archivos
export const validateFile = (file: File, options: {
  maxSize?: number; // en MB
  allowedTypes?: string[];
  maxWidth?: number;
  maxHeight?: number;
}): Promise<{
  isValid: boolean;
  errors: string[];
}> => {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const maxSize = options.maxSize || 5; // 5MB por defecto
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    
    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      errors.push(`El archivo no puede ser mayor a ${maxSize}MB`);
    }
    
    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Tipo de archivo no permitido. Tipos válidos: ${allowedTypes.join(', ')}`);
    }
    
    // Validar dimensiones para imágenes
    if (file.type.startsWith('image/') && (options.maxWidth || options.maxHeight)) {
      const img = new Image();
      img.onload = () => {
        if (options.maxWidth && img.width > options.maxWidth) {
          errors.push(`El ancho de la imagen no puede ser mayor a ${options.maxWidth}px`);
        }
        
        if (options.maxHeight && img.height > options.maxHeight) {
          errors.push(`La altura de la imagen no puede ser mayor a ${options.maxHeight}px`);
        }
        
        resolve({
          isValid: errors.length === 0,
          errors
        });
      };
      
      img.onerror = () => {
        errors.push('No se pudo cargar la imagen');
        resolve({
          isValid: false,
          errors
        });
      };
      
      img.src = URL.createObjectURL(file);
    } else {
      resolve({
        isValid: errors.length === 0,
        errors
      });
    }
  });
};

// Función para limpiar y sanitizar texto
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
    .replace(/[<>"'&]/g, '') // Remover caracteres peligrosos
    .substring(0, 1000); // Limitar longitud
};

// Función para generar slug desde texto
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios por guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones por uno solo
    .substring(0, 100); // Limitar longitud
};

// Validación completa de formulario de registro de evento
export const validateEventRegistration = (data: {
  name: string;
  email: string;
  phone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  specialNeeds?: string;
  dietaryRestrictions?: string;
}): {
  isValid: boolean;
  errors: Record<string, string[]>;
} => {
  const errors: Record<string, string[]> = {};
  
  // Validar nombre
  if (!validateFullName(data.name)) {
    errors.name = ['Ingrese un nombre completo válido'];
  }
  
  // Validar email
  if (!validateEmail(data.email)) {
    errors.email = ['Ingrese un email válido'];
  }
  
  // Validar teléfono si se proporciona
  if (data.phone && !validateColombianPhone(data.phone)) {
    errors.phone = ['Ingrese un número de teléfono válido'];
  }
  
  // Validar contacto de emergencia si se proporciona
  if (data.emergencyContact && !validateFullName(data.emergencyContact)) {
    errors.emergencyContact = ['Ingrese un nombre de contacto de emergencia válido'];
  }
  
  // Validar teléfono de emergencia si se proporciona
  if (data.emergencyPhone && !validateColombianPhone(data.emergencyPhone)) {
    errors.emergencyPhone = ['Ingrese un número de teléfono de emergencia válido'];
  }
  
  // Validar longitud de campos opcionales
  if (data.specialNeeds && data.specialNeeds.length > 500) {
    errors.specialNeeds = ['Las necesidades especiales no pueden exceder 500 caracteres'];
  }
  
  if (data.dietaryRestrictions && data.dietaryRestrictions.length > 300) {
    errors.dietaryRestrictions = ['Las restricciones dietéticas no pueden exceder 300 caracteres'];
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};