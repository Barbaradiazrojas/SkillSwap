
import { toast } from 'react-toastify';

/**
 * Tipos de errores HTTP
 */
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Mensajes de error por defecto
 */
const defaultMessages = {
  [ErrorTypes.NETWORK_ERROR]: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
  [ErrorTypes.UNAUTHORIZED]: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  [ErrorTypes.FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
  [ErrorTypes.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ErrorTypes.VALIDATION_ERROR]: 'Los datos enviados no son válidos.',
  [ErrorTypes.SERVER_ERROR]: 'Ocurrió un error en el servidor. Intenta nuevamente más tarde.',
  [ErrorTypes.TIMEOUT]: 'La solicitud tardó demasiado tiempo. Intenta nuevamente.',
  [ErrorTypes.UNKNOWN]: 'Ocurrió un error inesperado. Intenta nuevamente.'
};

/**
 * Determina el tipo de error basado en el error de Axios
 */
const getErrorType = (error) => {
  if (!error.response) {
    // Error de red o timeout
    if (error.code === 'ECONNABORTED') {
      return ErrorTypes.TIMEOUT;
    }
    return ErrorTypes.NETWORK_ERROR;
  }

  const status = error.response.status;

  switch (status) {
    case 400:
      return ErrorTypes.VALIDATION_ERROR;
    case 401:
      return ErrorTypes.UNAUTHORIZED;
    case 403:
      return ErrorTypes.FORBIDDEN;
    case 404:
      return ErrorTypes.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorTypes.SERVER_ERROR;
    default:
      return ErrorTypes.UNKNOWN;
  }
};

/**
 * Extrae el mensaje de error del response
 */
const extractErrorMessage = (error) => {
  if (error.response?.data) {
    // Intentar obtener mensaje del backend
    const data = error.response.data;
    
    if (data.message) {
      return data.message;
    }
    
    if (data.error) {
      return typeof data.error === 'string' ? data.error : data.error.message;
    }
    
    if (data.errors && Array.isArray(data.errors)) {
      // Errores de validación múltiples
      return data.errors.map(err => err.msg || err.message).join(', ');
    }
  }
  
  return null;
};

/**
 * Maneja errores de API de forma centralizada
 * @param {Error} error - Error de Axios
 * @param {Object} options - Opciones de manejo
 * @returns {Object} - Objeto con información del error
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    customMessages = {},
    onUnauthorized = null,
    onForbidden = null,
    onNotFound = null,
    logError = true
  } = options;

  const errorType = getErrorType(error);
  const customMessage = extractErrorMessage(error);
  const defaultMessage = customMessages[errorType] || defaultMessages[errorType];
  const finalMessage = customMessage || defaultMessage;

  // Log del error en desarrollo
  if (logError && process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      type: errorType,
      message: finalMessage,
      status: error.response?.status,
      data: error.response?.data,
      originalError: error
    });
  }

  // Mostrar toast si está habilitado
  if (showToast) {
    toast.error(finalMessage);
  }

  // Callbacks específicos por tipo de error
  switch (errorType) {
    case ErrorTypes.UNAUTHORIZED:
      if (onUnauthorized) {
        onUnauthorized();
      }
      break;
    case ErrorTypes.FORBIDDEN:
      if (onForbidden) {
        onForbidden();
      }
      break;
    case ErrorTypes.NOT_FOUND:
      if (onNotFound) {
        onNotFound();
      }
      break;
  }

  return {
    type: errorType,
    message: finalMessage,
    status: error.response?.status,
    data: error.response?.data,
    originalError: error
  };
};

/**
 * Manejador específico para errores de autenticación
 */
export const handleAuthError = (error, logout) => {
  return handleApiError(error, {
    showToast: true,
    onUnauthorized: () => {
      // Ejecutar logout si hay un error 401
      if (logout) {
        logout();
        // Opcionalmente redirigir al login
        window.location.href = '/login';
      }
    }
  });
};

/**
 * Manejador para errores de validación de formularios
 */
export const handleValidationError = (error) => {
  const errorInfo = handleApiError(error, { showToast: false });
  
  if (errorInfo.type === ErrorTypes.VALIDATION_ERROR && error.response?.data?.errors) {
    // Convertir errores de validación a formato de objeto para formularios
    const validationErrors = {};
    
    if (Array.isArray(error.response.data.errors)) {
      error.response.data.errors.forEach(err => {
        if (err.path || err.param) {
          const fieldName = err.path || err.param;
          validationErrors[fieldName] = err.msg || err.message;
        }
      });
    }
    
    return {
      ...errorInfo,
      validationErrors
    };
  }
  
  return errorInfo;
};

/**
 * Wrapper para llamadas API con manejo de errores
 */
export const withErrorHandling = async (apiCall, options = {}) => {
  try {
    const response = await apiCall();
    return { success: true, data: response.data };
  } catch (error) {
    const errorInfo = handleApiError(error, options);
    return { success: false, error: errorInfo };
  }
};

/**
 * Verifica si un error es de un tipo específico
 */
export const isErrorType = (error, type) => {
  return getErrorType(error) === type;
};

/**
 * Configuración para Axios interceptors (opcional)
 * Usar en tu configuración de Axios
 */
export const createErrorInterceptor = (logout) => {
  return (error) => {
    const errorType = getErrorType(error);
    
    // Manejo automático de sesión expirada
    if (errorType === ErrorTypes.UNAUTHORIZED && logout) {
      handleAuthError(error, logout);
    }
    
    return Promise.reject(error);
  };
};

export default {
  handleApiError,
  handleAuthError,
  handleValidationError,
  withErrorHandling,
  isErrorType,
  createErrorInterceptor,
  ErrorTypes
};