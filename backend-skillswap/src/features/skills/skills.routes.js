import express from 'express'
import { body } from 'express-validator'
import skillsController from './skills.controller.js'
import { verifyToken, optionalAuth } from '../../middleware/auth.middleware.js'
import { searchLimiter, createLimiter } from '../../middleware/rateLimiter.js'

const router = express.Router()

/**
 * GET /api/skills
 * Obtener todas las skills con filtros opcionales
 * Rate limit: 30 búsquedas por minuto
 * Autenticación opcional para incluir datos personalizados
 */
router.get('/', searchLimiter, optionalAuth, skillsController.getAll)

/**
 * GET /api/skills/:id
 * Obtener una skill por ID
 * Autenticación opcional
 */
router.get('/:id', optionalAuth, skillsController.getById)

/**
 * POST /api/skills
 * Crear una nueva skill
 * Rate limit: 10 creaciones por 15 minutos
 * Requiere autenticación
 */
router.post('/',
  verifyToken,
  createLimiter,
  [
    body('titulo').trim().notEmpty().withMessage('El título es requerido'),
    body('descripcion').trim().notEmpty().withMessage('La descripción es requerida'),
    body('categoria').trim().notEmpty().withMessage('La categoría es requerida'),
    body('nivel').isIn(['Principiante', 'Intermedio', 'Avanzado']).withMessage('Nivel inválido'),
    body('modalidad').isIn(['Online', 'Presencial', 'Híbrido']).withMessage('Modalidad inválida'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo')
  ],
  skillsController.create
)

/**
 * PUT /api/skills/:id
 * Actualizar una skill existente
 * Requiere autenticación (solo el creador puede actualizar)
 */
router.put('/:id', verifyToken, skillsController.update)

/**
 * DELETE /api/skills/:id
 * Eliminar una skill (soft delete)
 * Requiere autenticación (solo el creador puede eliminar)
 */
router.delete('/:id', verifyToken, skillsController.delete)

export default router