import express from 'express'
import { body } from 'express-validator'
import authController from './auth.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

const router = express.Router()

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register',
  [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
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
 */
router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  authController.login
)

/**
 * GET /api/auth/verify
 * Verificar token
 */
router.get('/verify', verifyToken, authController.verifyToken)

export default router