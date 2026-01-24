import express from 'express'
import { body } from 'express-validator'
import carritoController from './cart.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

const router = express.Router()

// Todas las rutas de carrito requieren autenticación
router.use(verifyToken)

router.get('/', carritoController.getMyCart)
router.post('/items',
  [
    body('skillId').isInt().withMessage('ID de skill inválido'),
    body('cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad inválida')
  ],
  carritoController.addItem
)
router.put('/items/:itemId', carritoController.updateItem)
router.delete('/items/:itemId', carritoController.removeItem)
router.delete('/', carritoController.clearCart)

export default router