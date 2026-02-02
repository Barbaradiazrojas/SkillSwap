/**
 * Funciones de validación reutilizables para formularios
 * Cada función retorna un string con el mensaje de error o '' si es válido
 */

/**
 * Valida que un campo no esté vacío
 */
export const required = (fieldName = 'Este campo') => (value) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} es requerido`;
  }
  return '';
};

/**
 * Valida longitud mínima
 */
export const minLength = (min, fieldName = 'Este campo') => (value) => {
  if (value && value.length < min) {
    return `${fieldName} debe tener al menos ${min} caracteres`;
  }
  return '';
};

/**
 * Valida longitud máxima
 */
export const maxLength = (max, fieldName = 'Este campo') => (value) => {
  if (value && value.length > max) {
    return `${fieldName} no puede exceder ${max} caracteres`;
  }
  return '';
};

/**
 * Valida formato de email
 */
export const isEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !emailRegex.test(value)) {
    return 'Ingresa un email válido';
  }
  return '';
};

/**
 * Valida que la contraseña cumpla con requisitos mínimos
 * - Al menos 6 caracteres
 * - Al menos una letra
 * - Al menos un número
 */
export const isStrongPassword = (value) => {
  if (!value) return '';

  if (value.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }

  const hasLetter = /[a-zA-Z]/.test(value);
  const hasNumber = /\d/.test(value);

  if (!hasLetter) {
    return 'La contraseña debe contener al menos una letra';
  }

  if (!hasNumber) {
    return 'La contraseña debe contener al menos un número';
  }

  return '';
};

/**
 * Valida que dos campos coincidan (para confirmación de contraseña)
 */
export const matchField = (fieldToMatch, fieldName = 'Las contraseñas') => (value, allValues) => {
  if (value !== allValues[fieldToMatch]) {
    return `${fieldName} no coinciden`;
  }
  return '';
};

/**
 * Valida que sea un número válido
 */
export const isNumber = (fieldName = 'Este campo') => (value) => {
  if (value && isNaN(Number(value))) {
    return `${fieldName} debe ser un número`;
  }
  return '';
};

/**
 * Valida que sea un número positivo
 */
export const isPositive = (fieldName = 'Este campo') => (value) => {
  if (value && Number(value) <= 0) {
    return `${fieldName} debe ser mayor a 0`;
  }
  return '';
};

/**
 * Valida rango numérico
 */
export const inRange = (min, max, fieldName = 'Este campo') => (value) => {
  const num = Number(value);
  if (value && (num < min || num > max)) {
    return `${fieldName} debe estar entre ${min} y ${max}`;
  }
  return '';
};

/**
 * Valida formato de URL
 */
export const isURL = (value) => {
  if (!value) return '';
  
  try {
    new URL(value);
    return '';
  } catch {
    return 'Ingresa una URL válida (ej: https://ejemplo.com)';
  }
};

/**
 * Valida formato de teléfono (chileno o internacional)
 */
export const isPhone = (value) => {
  if (!value) return '';
  
  // Acepta formatos: +56912345678, 912345678, +1234567890
  const phoneRegex = /^(\+?56)?[2-9]\d{8}$|^\+?\d{10,15}$/;
  
  if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
    return 'Ingresa un teléfono válido';
  }
  return '';
};

/**
 * Valida que sea una fecha válida
 */
export const isValidDate = (value) => {
  if (!value) return '';
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return 'Ingresa una fecha válida';
  }
  return '';
};

/**
 * Valida que la fecha sea futura
 */
export const isFutureDate = (value) => {
  if (!value) return '';
  
  const selectedDate = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return 'La fecha debe ser futura';
  }
  return '';
};

/**
 * Valida formato de archivo (extensión)
 */
export const isFileType = (allowedTypes = []) => (file) => {
  if (!file) return '';
  
  const fileName = file.name || '';
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  
  if (!allowedTypes.includes(fileExtension)) {
    return `Archivo debe ser: ${allowedTypes.join(', ')}`;
  }
  return '';
};

/**
 * Valida tamaño máximo de archivo (en MB)
 */
export const maxFileSize = (maxSizeMB) => (file) => {
  if (!file) return '';
  
  const fileSizeMB = file.size / (1024 * 1024);
  
  if (fileSizeMB > maxSizeMB) {
    return `El archivo no debe superar ${maxSizeMB}MB`;
  }
  return '';
};

/**
 * Validación personalizada con función
 */
export const custom = (validationFn, errorMessage) => (value, allValues) => {
  if (!validationFn(value, allValues)) {
    return errorMessage;
  }
  return '';
};

/**
 * Combina múltiples validadores en uno solo
 */
export const compose = (...validators) => (value, allValues) => {
  for (const validator of validators) {
    const error = validator(value, allValues);
    if (error) return error;
  }
  return '';
};

// Exportar todas las validaciones como objeto también
export default {
  required,
  minLength,
  maxLength,
  isEmail,
  isStrongPassword,
  matchField,
  isNumber,
  isPositive,
  inRange,
  isURL,
  isPhone,
  isValidDate,
  isFutureDate,
  isFileType,
  maxFileSize,
  custom,
  compose
};