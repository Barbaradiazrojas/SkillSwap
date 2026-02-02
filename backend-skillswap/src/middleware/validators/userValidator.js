const { body, param, validationResult } = require('express-validator');

/**
 * Validaciones para actualizar perfil de usuario
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Ingresa un email válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('El email es demasiado largo'),

  body('phone')
    .optional()
    .trim()
    .matches(/^(\+?56)?[2-9]\d{8}$|^\+?\d{10,15}$/)
    .withMessage('Ingresa un número de teléfono válido'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La biografía no puede exceder 1000 caracteres'),

  body('avatar_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('La URL del avatar no es válida'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La ubicación no puede exceder 200 caracteres'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('La URL del sitio web no es válida'),

  body('social_links')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('Los enlaces sociales deben ser un objeto');
      }
      if (value) {
        // Validar que cada enlace sea una URL válida
        const allowedKeys = ['facebook', 'twitter', 'instagram', 'linkedin', 'github'];
        for (const key in value) {
          if (!allowedKeys.includes(key)) {
            throw new Error(`Red social no permitida: ${key}`);
          }
          try {
            new URL(value[key]);
          } catch {
            throw new Error(`URL inválida para ${key}`);
          }
        }
      }
      return true;
    }),

  // Middleware para verificar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validaciones para agregar/quitar favoritos
 */
const validateFavorite = [
  param('skillId')
    .isInt({ min: 1 })
    .withMessage('ID de skill inválido'),

  // Middleware para verificar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validaciones para operaciones de carrito
 */
const validateCartItem = [
  body('skillId')
    .notEmpty()
    .withMessage('El ID de la skill es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de skill inválido'),

  body('quantity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('La cantidad debe ser entre 1 y 10'),

  // Middleware para verificar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validaciones para actualizar cantidad en carrito
 */
const validateUpdateCartQuantity = [
  param('skillId')
    .isInt({ min: 1 })
    .withMessage('ID de skill inválido'),

  body('quantity')
    .notEmpty()
    .withMessage('La cantidad es requerida')
    .isInt({ min: 1, max: 10 })
    .withMessage('La cantidad debe ser entre 1 y 10'),

  // Middleware para verificar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validaciones para eliminar item del carrito
 */
const validateRemoveFromCart = [
  param('skillId')
    .isInt({ min: 1 })
    .withMessage('ID de skill inválido'),

  // Middleware para verificar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validaciones para obtener perfil de otro usuario
 */
const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),

  // Middleware para verificar resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Errores de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateUpdateProfile,
  validateFavorite,
  validateCartItem,
  validateUpdateCartQuantity,
  validateRemoveFromCart,
  validateUserId
};