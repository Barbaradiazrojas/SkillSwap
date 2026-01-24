import express from 'express'
import { body } from 'express-validator'
import skillsController from './skills.controller.js'
import { verifyToken, optionalAuth } from '../../middleware/auth.middleware.js'

const router = express.Router()

// Rutas públicas
router.get('/', optionalAuth, skillsController.getAll)
router.get('/:id', optionalAuth, skillsController.getById)

// Rutas protegidas (requieren autenticación)
router.post('/',
  verifyToken,
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

router.put('/:id', verifyToken, skillsController.update)
router.delete('/:id', verifyToken, skillsController.delete)

export default router