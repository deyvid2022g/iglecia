// Servicio de utilidades generales para la aplicación

// Formateo de fechas
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string => {
  const d = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Bogota'
  };
  
  switch (format) {
    case 'short':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      break;
    case 'long':
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'datetime':
      options.year = 'numeric';
      options.month = 'short';
      options.day = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
  }
  
  return d.toLocaleDateString('es-CO', options);
};

// Formateo de tiempo relativo (hace X tiempo)
export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
};

// Formateo de duración
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

// Formateo de números
export const formatNumber = (num: number, type: 'compact' | 'currency' | 'percentage' = 'compact'): string => {
  switch (type) {
    case 'compact':
      return new Intl.NumberFormat('es-CO', {
        notation: 'compact',
        compactDisplay: 'short'
      }).format(num);
    case 'currency':
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(num);
    case 'percentage':
      return new Intl.NumberFormat('es-CO', {
        style: 'percent',
        minimumFractionDigits: 0
      }).format(num / 100);
    default:
      return num.toString();
  }
};

// Truncar texto
export const truncateText = (text: string, maxLength: number, addEllipsis: boolean = true): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.substring(0, maxLength);
  return addEllipsis ? `${truncated}...` : truncated;
};

// Extraer extracto de contenido HTML
export const extractExcerpt = (htmlContent: string, maxLength: number = 150): string => {
  // Remover tags HTML
  const textContent = htmlContent.replace(/<[^>]*>/g, '');
  
  // Decodificar entidades HTML básicas
  const decoded = textContent
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  return truncateText(decoded.trim(), maxLength);
};

// Calcular tiempo de lectura estimado
export const calculateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, '');
  const wordCount = textContent.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Generar colores aleatorios para avatares
export const generateAvatarColor = (name: string): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Generar iniciales para avatares
export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Formatear número de teléfono colombiano
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Si empieza con 57, removerlo
  const withoutCountryCode = cleaned.startsWith('57') ? cleaned.substring(2) : cleaned;
  
  // Formatear como XXX XXX XXXX
  if (withoutCountryCode.length === 10) {
    return withoutCountryCode.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  
  return phone; // Retornar original si no se puede formatear
};

// Validar y formatear URL
export const formatUrl = (url: string): string => {
  if (!url) return '';
  
  // Agregar protocolo si no lo tiene
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
};

// Generar ID único
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Copiar texto al portapapeles
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (_) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Descargar archivo
export const downloadFile = (content: string, filename: string, contentType: string = 'text/plain'): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Convertir archivo a base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Redimensionar imagen
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Obtener información del dispositivo
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  
  return {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isTablet: /iPad|Android(?!.*Mobile)/i.test(userAgent),
    isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    browser: (() => {
      if (userAgent.includes('Chrome')) return 'Chrome';
      if (userAgent.includes('Firefox')) return 'Firefox';
      if (userAgent.includes('Safari')) return 'Safari';
      if (userAgent.includes('Edge')) return 'Edge';
      return 'Unknown';
    })()
  };
};

// Scroll suave a elemento
export const scrollToElement = (elementId: string, offset: number = 0): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// Obtener parámetros de URL
export const getUrlParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

// Actualizar parámetros de URL sin recargar página
export const updateUrlParams = (params: Record<string, string | null>): void => {
  const url = new URL(window.location.href);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  
  window.history.replaceState({}, '', url.toString());
};

// Formatear días de la semana
export const formatDayOfWeek = (dayNumber: number): string => {
  const days = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
  ];
  return days[dayNumber] || 'Día inválido';
};

// Obtener rango de fechas para filtros
export const getDateRanges = () => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  return {
    today: new Date().toISOString().split('T')[0],
    thisWeek: startOfWeek.toISOString().split('T')[0],
    thisMonth: startOfMonth.toISOString().split('T')[0],
    thisYear: startOfYear.toISOString().split('T')[0]
  };
};

// Generar colores de tema
export const generateThemeColors = (primaryColor: string) => {
  // Esta función podría expandirse para generar una paleta completa
  // basada en el color primario de la iglesia
  return {
    primary: primaryColor,
    primaryLight: primaryColor + '20', // Con transparencia
    primaryDark: primaryColor.replace(/\d+/g, (match) => 
      Math.max(0, parseInt(match) - 20).toString()
    )
  };
};