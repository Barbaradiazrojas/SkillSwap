import express from 'express'
import { body } from 'express-validator'
import authController from './auth.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'
import { authLimiter, registerLimiter } from '../../middleware/rateLimiter.js'

const router = express.Router()

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 * Rate limit: 3 registros por hora desde la misma IP
 */
router.post('/register',
  registerLimiter,
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  authController.register
)

/**
 * POST /api/auth/login
 * Iniciar sesión
 * Rate limit: 5 intentos por 15 minutos
 */
router.post('/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  authController.login
)

/**
 * GET /api/auth/verify
 * Verificar token de autenticación
 * Requiere autenticación
 */
router.get('/verify', verifyToken, authController.verifyToken)

export default router