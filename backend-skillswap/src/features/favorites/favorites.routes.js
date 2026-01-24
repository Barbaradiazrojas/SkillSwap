import express from 'express'
import favoritosController from './favorites.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

const router = express.Router()

// Todas las rutas de favoritos requieren autenticación
router.use(verifyToken)

router.get('/', favoritosController.getMyFavorites)
router.post('/:skillId', favoritosController.addFavorite)
router.delete('/:skillId', favoritosController.removeFavorite)
router.get('/check/:skillId', favoritosController.checkFavorite)

export default router