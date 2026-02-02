const { body, param, query, validationResult } = require('express-validator');

/**
 * Validaciones para crear una skill
 */
const validateCreateSkill = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 3, max: 200 })
    .withMessage('El título debe tener entre 3 y 200 caracteres'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 5000 })
    .withMessage('La descripción debe tener entre 10 y 5000 caracteres'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es requerida')
    .isLength({ min: 2, max: 100 })
    .withMessage('La categoría debe tener entre 2 y 100 caracteres'),

  body('price')
    .notEmpty()
    .withMessage('El precio es requerido')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo')
    .custom((value) => {
      if (value > 1000000) {
        throw new Error('El precio no puede exceder $1,000,000');
      }
      return true;
    }),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La duración debe ser un número entero positivo'),

  body('level')
    .optional()
    .trim()
    .isIn(['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'])
    .withMessage('El nivel debe ser: Principiante, Intermedio, Avanzado o Todos los niveles'),

  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('La URL de la imagen no es válida'),

  body('tags')
    .optional()
    .custom((value) => {
      if (value && !Array.isArray(value)) {
        throw new Error('Los tags deben ser un array');
      }
      if (value && value.length > 10) {
        throw new Error('No puedes agregar más de 10 tags');
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
 * Validaciones para actualizar una skill
 */
const validateUpdateSkill = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de skill inválido'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('El título debe tener entre 3 y 200 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('La descripción debe tener entre 10 y 5000 caracteres'),

  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La categoría debe tener entre 2 y 100 caracteres'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo')
    .custom((value) => {
      if (value > 1000000) {
        throw new Error('El precio no puede exceder $1,000,000');
      }
      return true;
    }),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La duración debe ser un número entero positivo'),

  body('level')
    .optional()
    .trim()
    .isIn(['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'])
    .withMessage('El nivel debe ser: Principiante, Intermedio, Avanzado o Todos los niveles'),

  body('image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('La URL de la imagen no es válida'),

  body('tags')
    .optional()
    .custom((value) => {
      if (value && !Array.isArray(value)) {
        throw new Error('Los tags deben ser un array');
      }
      if (value && value.length > 10) {
        throw new Error('No puedes agregar más de 10 tags');
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
 * Validaciones para parámetros de ID
 */
const validateSkillId = [
  param('id')
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
 * Validaciones para filtros de búsqueda de skills
 */
const validateSkillFilters = [
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La categoría no es válida'),

  query('level')
    .optional()
    .trim()
    .isIn(['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'])
    .withMessage('El nivel no es válido'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio mínimo debe ser un número positivo'),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El precio máximo debe ser un número positivo')
    .custom((value, { req }) => {
      if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
        throw new Error('El precio máximo debe ser mayor al precio mínimo');
      }
      return true;
    }),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('El término de búsqueda no es válido'),

  query('sortBy')
    .optional()
    .isIn(['price_asc', 'price_desc', 'date_asc', 'date_desc', 'title_asc', 'title_desc'])
    .withMessage('El criterio de ordenamiento no es válido'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser entre 1 y 100'),

  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El offset debe ser un número positivo'),

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
  validateCreateSkill,
  validateUpdateSkill,
  validateSkillId,
  validateSkillFilters
};