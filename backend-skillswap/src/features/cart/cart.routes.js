import express from 'express'
import { body } from 'express-validator'
import carritoController from './cart.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'
import { createLimiter } from '../../middleware/rateLimiter.js'

const router = express.Router()

// Todas las rutas de carrito requieren autenticación
router.use(verifyToken)

/**
 * GET /api/cart
 * Obtener carrito del usuario autenticado
 */
router.get('/', carritoController.getMyCart)

/**
 * POST /api/cart/items
 * Agregar item al carrito
 * Rate limit: 10 items por 15 minutos
 */
router.post('/items',
  createLimiter,
  [
    body('skillId').isInt().withMessage('ID de skill inválido'),
    body('cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad inválida')
  ],
  carritoController.addItem
)

/**
 * PUT /api/cart/items/:itemId
 * Actualizar cantidad de un item
 */
router.put('/items/:itemId', carritoController.updateItem)

/**
 * DELETE /api/cart/items/:itemId
 * Eliminar un item del carrito
 */
router.delete('/items/:itemId', carritoController.removeItem)

/**
 * DELETE /api/cart
 * Vaciar todo el carrito
 */
router.delete('/', carritoController.clearCart)

export default router