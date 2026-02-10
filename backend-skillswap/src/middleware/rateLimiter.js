import rateLimit from 'express-rate-limit'

/**
 * Rate limiter general para rutas públicas
 * Permite 100 peticiones por ventana de 15 minutos
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter estricto para autenticación
 * Permite solo 5 intentos por ventana de 15 minutos
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  skipSuccessfulRequests: true, // No contar peticiones exitosas
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter para registro de usuarios
 * Permite 3 registros por ventana de 1 hora
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3,
  message: {
    success: false,
    message: 'Demasiados registros desde esta IP. Por favor intenta de nuevo en 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter para creación de recursos
 * Permite 10 creaciones por ventana de 15 minutos
 */
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: {
    success: false,
    message: 'Demasiadas creaciones en poco tiempo. Por favor espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * Rate limiter para búsquedas
 * Permite 30 búsquedas por ventana de 1 minuto
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30,
  message: {
    success: false,
    message: 'Demasiadas búsquedas. Por favor espera un momento.'
  },
  standardHeaders: true,
  legacyHeaders: false
})