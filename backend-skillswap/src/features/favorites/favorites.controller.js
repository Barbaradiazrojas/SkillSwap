import { query } from '../../config/database.js'

class FavoritosController {
  
  /**
   * GET /api/favorites
   * Obtener favoritos del usuario autenticado
   */
  async getMyFavorites(req, res) {
    try {
      const result = await query(
        `SELECT 
          f.id_favorito,
          f.creado_en,
          s.id_skill,
          s.titulo,
          s.descripcion,
          s.categoria,
          s.nivel,
          s.modalidad,
          s.precio,
          s.imagen_url,
          s.rating,
          s.total_resenas,
          u.nombre || ' ' || u.apellido as nombre_usuario,
          u.avatar_url as usuario_avatar
        FROM favoritos f
        INNER JOIN skills s ON f.id_skill = s.id_skill
        INNER JOIN usuarios u ON s.id_usuario = u.id_usuario
        WHERE f.id_usuario = $1 AND s.es_activo = true
        ORDER BY f.creado_en DESC`,
        [req.userId]
      )
      
      res.status(200).json({
        success: true,
        message: 'Favoritos obtenidos exitosamente',
        data: result.rows,
        count: result.rows.length
      })
      
    } catch (error) {
      console.error('Error en getMyFavorites:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener favoritos',
        error: error.message
      })
    }
  }
  
  /**
   * POST /api/favorites/:skillId
   * Agregar skill a favoritos
   */
  async addFavorite(req, res) {
    try {
      const { skillId } = req.params
      
      // Verificar que el skill existe
      const skillExists = await query(
        'SELECT id_skill FROM skills WHERE id_skill = $1 AND es_activo = true',
        [skillId]
      )
      
      if (skillExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Skill no encontrado'
        })
      }
      
      // Verificar si ya está en favoritos
      const alreadyFavorite = await query(
        'SELECT id_favorito FROM favoritos WHERE id_usuario = $1 AND id_skill = $2',
        [req.userId, skillId]
      )
      
      if (alreadyFavorite.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'El skill ya está en favoritos'
        })
      }
      
      // Agregar a favoritos
      const result = await query(
        `INSERT INTO favoritos (id_usuario, id_skill, creado_en)
         VALUES ($1, $2, NOW())
         RETURNING id_favorito, id_skill, creado_en`,
        [req.userId, skillId]
      )
      
      res.status(201).json({
        success: true,
        message: 'Skill agregado a favoritos',
        data: result.rows[0]
      })
      
    } catch (error) {
      console.error('Error en addFavorite:', error)
      res.status(500).json({
        success: false,
        message: 'Error al agregar favorito',
        error: error.message
      })
    }
  }
  
  /**
   * DELETE /api/favorites/:skillId
   * Eliminar skill de favoritos
   */
  async removeFavorite(req, res) {
    try {
      const { skillId } = req.params
      
      const result = await query(
        'DELETE FROM favoritos WHERE id_usuario = $1 AND id_skill = $2 RETURNING id_favorito',
        [req.userId, skillId]
      )
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Favorito no encontrado'
        })
      }
      
      res.status(200).json({
        success: true,
        message: 'Skill eliminado de favoritos'
      })
      
    } catch (error) {
      console.error('Error en removeFavorite:', error)
      res.status(500).json({
        success: false,
        message: 'Error al eliminar favorito',
        error: error.message
      })
    }
  }
  
  /**
   * GET /api/favorites/check/:skillId
   * Verificar si un skill está en favoritos
   */
  async checkFavorite(req, res) {
    try {
      const { skillId } = req.params
      
      const result = await query(
        'SELECT id_favorito FROM favoritos WHERE id_usuario = $1 AND id_skill = $2',
        [req.userId, skillId]
      )
      
      res.status(200).json({
        success: true,
        data: {
          isFavorite: result.rows.length > 0
        }
      })
      
    } catch (error) {
      console.error('Error en checkFavorite:', error)
      res.status(500).json({
        success: false,
        message: 'Error al verificar favorito',
        error: error.message
      })
    }
  }
}

export default new FavoritosController()