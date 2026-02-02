/**
 * Middleware centralizado de manejo de errores
 * Este middleware captura todos los errores de la aplicación y los formatea
 */

/**
 * Clase personalizada para errores de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Distingue errores operacionales de bugs
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // Error de validación de express-validator
  if (err.array && typeof err.array === 'function') {
    const validationErrors = err.array();
    return res.status(400).json({
      success: false,
      error: 'Errores de validación',
      errors: validationErrors
    });
  }

  // Error de PostgreSQL - Violación de constraint único
  if (err.code === '23505') {
    const field = extractFieldFromPgError(err);
    error.message = `El ${field} ya está registrado`;
    error.statusCode = 400;
  }

  // Error de PostgreSQL - Violación de foreign key
  if (err.code === '23503') {
    error.message = 'Referencia a un recurso que no existe';
    error.statusCode = 400;
  }

  // Error de PostgreSQL - Violación de not null
  if (err.code === '23502') {
    const field = err.column || 'campo requerido';
    error.message = `El campo ${field} es requerido`;
    error.statusCode = 400;
  }

  // Error de JWT inválido
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token inválido';
    error.statusCode = 401;
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    error.message = 'Tu sesión ha expirado';
    error.statusCode = 401;
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.message = 'JSON inválido en el cuerpo de la solicitud';
    error.statusCode = 400;
  }

  // Respuesta de error
  const response = {
    success: false,
    error: error.message || 'Error del servidor'
  };

  // Incluir errores de validación si existen
  if (error.errors) {
    response.errors = error.errors;
  }

  // Incluir stack trace solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

/**
 * Extrae el nombre del campo de un error de PostgreSQL
 */
const extractFieldFromPgError = (err) => {
  if (err.detail) {
    const match = err.detail.match(/Key \((\w+)\)=/);
    if (match) {
      return match[1];
    }
  }
  return 'valor';
};

/**
 * Middleware para rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.originalUrl}`,
    404
  );
  next(error);
};

/**
 * Wrapper para funciones async en rutas
 * Captura errores automáticamente sin necesidad de try-catch
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Helper para crear errores personalizados
 */
const createError = (message, statusCode = 500, errors = null) => {
  return new AppError(message, statusCode, errors);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError,
  AppError
};