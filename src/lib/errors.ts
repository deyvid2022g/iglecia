// Clase personalizada para manejo de errores de la aplicación
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos de la aplicación
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'No autorizado', context?: Record<string, unknown>) {
    super(message, 401, true, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Acceso denegado', context?: Record<string, unknown>) {
    super(message, 403, true, context);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso', context?: Record<string, unknown>) {
    super(`${resource} no encontrado`, 404, true, context);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, true, context);
    this.name = 'DatabaseError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Error de conexión', context?: Record<string, unknown>) {
    super(message, 503, true, context);
    this.name = 'NetworkError';
  }
}

// Función para manejar errores de Firebase
export function handleFirebaseError(error: unknown, context?: Record<string, unknown>): AppError {
  if (!error) {
    return new AppError('Error desconocido', 500, true, context);
  }

  // Verificar si el error tiene las propiedades esperadas
  const errorObj = error as { message?: string; code?: string };

  // Errores de autenticación
  if (errorObj.message?.includes('Invalid login credentials')) {
    return new AuthenticationError('Credenciales inválidas', context);
  }

  if (errorObj.message?.includes('Email not confirmed')) {
    return new AuthenticationError('Email no confirmado', context);
  }

  if (errorObj.message?.includes('User not found')) {
    return new NotFoundError('Usuario', context);
  }

  // Errores de base de datos
  if (errorObj.code === 'PGRST116') {
    return new NotFoundError('Registro', context);
  }

  if (errorObj.code === '23505') {
    return new ValidationError('El registro ya existe', context);
  }

  if (errorObj.code === '23503') {
    return new ValidationError('Referencia inválida', context);
  }

  // Error genérico
  return new DatabaseError(errorObj.message || 'Error de base de datos', context);
}

// Función para logging de errores
export function logError(error: Error, context?: Record<string, unknown>) {
  const errorInfo: {
    name: string;
    message: string;
    stack: string | undefined;
    timestamp: string;
    context: Record<string, unknown> | undefined;
    statusCode?: number;
    isOperational?: boolean;
  } = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context
  };

  if (error instanceof AppError) {
    errorInfo.statusCode = error.statusCode;
    errorInfo.isOperational = error.isOperational;
    errorInfo.context = { ...context, ...error.context };
  }

  console.error('Error logged:', errorInfo);

  // En producción, aquí se podría enviar a un servicio de logging
  // como Sentry, LogRocket, etc.
}

// Hook para manejo de errores en React
export function useErrorHandler() {
  return (error: unknown, context?: Record<string, unknown>) => {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(error.message, 500, true, context);
    } else {
      appError = new AppError('Error desconocido', 500, true, context);
    }

    logError(appError, context);
    return appError;
  };
}