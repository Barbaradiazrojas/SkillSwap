import express from 'express'
import usersController from './users.controller.js'
import { verifyToken } from '../../middleware/auth.middleware.js'

const router = express.Router()

// Todas las rutas de usuarios requieren autenticación
router.use(verifyToken)

router.get('/profile', usersController.getMyProfile)
router.get('/my-skills', usersController.getMySkills)
router.put('/profile', usersController.updateProfile)

export default router