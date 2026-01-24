import authService from './auth.service.js'
import { validationResult } from 'express-validator'

class AuthController {
  
  /**
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      // Validar errores
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        })
      }
      
      const result = await authService.register(req.body)
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      })
      
    } catch (error) {
      console.error('Error en register:', error)
      
      if (error.message === 'El email ya está registrado') {
        return res.status(409).json({
          success: false,
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      })
    }
  }
  
  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        })
      }
      
      const { email, password } = req.body
      const result = await authService.login(email, password)
      
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      })
      
    } catch (error) {
      console.error('Error en login:', error)
      
      if (error.message === 'Credenciales inválidas') {
        return res.status(401).json({
          success: false,
          message: error.message
        })
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      })
    }
  }
  
  /**
   * GET /api/auth/verify
   */
  async verifyToken(req, res) {
    try {
      // El middleware ya verificó el token y agregó userId
      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          userId: req.userId,
          email: req.userEmail
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al verificar token',
        error: error.message
      })
    }
  }
}

export default new AuthController()