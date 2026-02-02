import { query } from '../../config/database.js'

class UsersController {
  
  /**
   * GET /api/users/profile
   * Obtener perfil del usuario autenticado
   */
  async getMyProfile(req, res) {
    try {
      const result = await query(
        `SELECT 
          id_usuario,
          nombre,
          apellido,
          email,
          avatar_url,
          rating,
          total_intercambios,
          es_verificado,
          creado_en
        FROM usuarios 
        WHERE id_usuario = $1`,
        [req.userId]
      )
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        })
      }
      
      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: result.rows[0]
      })
      
    } catch (error) {
      console.error('Error en getMyProfile:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      })
    }
  }
  
  /**
   * GET /api/users/my-skills
   * Obtener skills del usuario autenticado
   */
  async getMySkills(req, res) {
    try {
      const result = await query(
        `SELECT 
          id_skill,
          titulo,
          descripcion,
          categoria,
          nivel,
          modalidad,
          duracion_horas,
          imagen_url,
          precio,
          rating,
          total_resenas,
          es_activo,
          creado_en,
          actualizado_en
        FROM skills 
        WHERE id_usuario = $1
        ORDER BY creado_en DESC`,
        [req.userId]
      )
      
      res.status(200).json({
        success: true,
        message: 'Skills obtenidos exitosamente',
        data: result.rows,
        count: result.rows.length
      })
      
    } catch (error) {
      console.error('Error en getMySkills:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener skills',
        error: error.message
      })
    }
  }
  
  /**
   * PUT /api/users/profile
   * Actualizar perfil del usuario
   */
  async updateProfile(req, res) {
    try {
      const { nombre, apellido, avatar_url } = req.body
      
      const result = await query(
        `UPDATE usuarios 
         SET nombre = COALESCE($1, nombre),
             apellido = COALESCE($2, apellido),
             avatar_url = COALESCE($3, avatar_url),
             actualizado_en = NOW()
         WHERE id_usuario = $4
         RETURNING id_usuario, nombre, apellido, email, avatar_url, rating, total_intercambios, es_verificado`,
        [nombre, apellido, avatar_url, req.userId]
      )
      
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: result.rows[0]
      })
      
    } catch (error) {
      console.error('Error en updateProfile:', error)
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      })
    }
  }
}

export default new UsersController()