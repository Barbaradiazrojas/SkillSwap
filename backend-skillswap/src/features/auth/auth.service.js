import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../../config/database.js'

const SALT_ROUNDS = 10

/**
 * Servicio de autenticación
 */
class AuthService {
  
  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    const { nombre, apellido, email, password } = userData
    
    try {
      // Verificar si el email ya existe
      const existingUser = await query(
        'SELECT id_usuario FROM usuarios WHERE email = $1',
        [email]
      )
      
      if (existingUser.rows.length > 0) {
        throw new Error('El email ya está registrado')
      }
      
      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
      
      // Insertar usuario
      const result = await query(
        `INSERT INTO usuarios (nombre, apellido, email, password, avatar_url, es_verificado, creado_en, actualizado_en)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id_usuario, nombre, apellido, email, avatar_url, rating, total_intercambios, es_verificado, creado_en`,
        [
          nombre,
          apellido,
          email,
          hashedPassword,
          `https://ui-avatars.com/api/?name=${nombre}+${apellido}&background=random`,
          false
        ]
      )
      
      const user = result.rows[0]
      
      // Generar token
      const token = this.generateToken(user.id_usuario, user.email)
      
      return {
        token,
        user: this.formatUser(user)
      }
      
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Login de usuario
   */
  async login(email, password) {
    try {
      // Buscar usuario por email
      const result = await query(
        `SELECT id_usuario, nombre, apellido, email, password, avatar_url, 
                rating, total_intercambios, es_verificado, creado_en
         FROM usuarios 
         WHERE email = $1`,
        [email]
      )
      
      if (result.rows.length === 0) {
        throw new Error('Credenciales inválidas')
      }
      
      const user = result.rows[0]
      
      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password)
      
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas')
      }
      
      // Generar token
      const token = this.generateToken(user.id_usuario, user.email)
      
      return {
        token,
        user: this.formatUser(user)
      }
      
    } catch (error) {
      throw error
    }
  }
  
  /**
   * Verificar token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      throw new Error('Token inválido')
    }
  }
  
  /**
   * Generar token JWT
   */
  generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
  }
  
  /**
   * Formatear usuario (remover password)
   */
  formatUser(user) {
    const { password, ...userWithoutPassword } = user
    return {
      user_id: userWithoutPassword.id_usuario,
      email: userWithoutPassword.email,
      name: `${userWithoutPassword.nombre} ${userWithoutPassword.apellido}`,
      nombre: userWithoutPassword.nombre,
      apellido: userWithoutPassword.apellido,
      avatar_url: userWithoutPassword.avatar_url,
      rating: parseFloat(userWithoutPassword.rating) || 0,
      total_exchanges: userWithoutPassword.total_intercambios || 0,
      is_verified: userWithoutPassword.es_verificado || false,
      created_at: userWithoutPassword.creado_en
    }
  }
}

export default new AuthService()