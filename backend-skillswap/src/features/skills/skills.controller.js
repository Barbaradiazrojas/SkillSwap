import { query } from '../../config/database.js'
import { validationResult } from 'express-validator'

class SkillsController {
  
  /**
   * GET /api/skills
   * Obtener todos los skills con filtros opcionales
   */
  async getAll(req, res) {
    try {
      const { 
        categoria, 
        nivel, 
        modalidad, 
        minPrecio, 
        maxPrecio,
        limit = 50,
        offset = 0 
      } = req.query
      
      let queryText = `
        SELECT 
          s.id_skill,
          s.titulo,
          s.descripcion,
          s.categoria,
          s.nivel,
          s.modalidad,
          s.duracion_horas,
          s.imagen_url,
          s.precio,
          s.rating,
          s.total_resenas,
          s.es_activo,
          s.creado_en,
          u.id_usuario,
          u.nombre || ' ' || u.apellido as nombre_usuario,
          u.avatar_url as usuario_avatar
        FROM skills s
        INNER JOIN usuarios u ON s.id_usuario = u.id_usuario
        WHERE s.es_activo = true
      `
      
      const params = []
      let paramCount = 1
      
      // Filtros dinámicos
      if (categoria) {
        queryText += ` AND s.categoria = $${paramCount}`
        params.push(categoria)
        paramCount++
      }
      
      if (nivel) {
        queryText += ` AND s.nivel = $${paramCount}`
        params.push(nivel)
        paramCount++
      }
      
      if (modalidad) {
        queryText += ` AND s.modalidad = $${paramCount}`
        params.push(modalidad)
        paramCount++
      }
      
      if (minPrecio) {
        queryText += ` AND s.precio >= $${paramCount}`
        params.push(minPrecio)
        paramCount++
      }
      
      if (maxPrecio) {
        queryText += ` AND s.precio <= $${paramCount}`
        params.push(maxPrecio)
        paramCount++
      }
      
      queryText += ` ORDER BY s.creado_en DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
      params.push(limit, offset)
      
      const result = await query(queryText, params)
      
      res.status(200).json({
        success: true,
        message: 'Skills obtenidos exitosamente',
        data: result.rows,
        count: result.rows.length
      })
      
    } catch (error) {
      console.error('Error en getAll skills:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener skills',
        error: error.message
      })
    }
  }
  
  /**
   * GET /api/skills/:id
   * Obtener un skill por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params
      
      const result = await query(
        `SELECT 
          s.*,
          u.id_usuario,
          u.nombre || ' ' || u.apellido as nombre_usuario,
          u.avatar_url as usuario_avatar,
          u.rating as usuario_rating
        FROM skills s
        INNER JOIN usuarios u ON s.id_usuario = u.id_usuario
        WHERE s.id_skill = $1 AND s.es_activo = true`,
        [id]
      )
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Skill no encontrado'
        })
      }
      
      res.status(200).json({
        success: true,
        message: 'Skill obtenido exitosamente',
        data: result.rows[0]
      })
      
    } catch (error) {
      console.error('Error en getById skill:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener skill',
        error: error.message
      })
    }
  }
  
  /**
   * POST /api/skills
   * Crear nuevo skill (requiere autenticación)
   */
  async create(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        })
      }
      
      const {
        titulo,
        descripcion,
        categoria,
        nivel,
        modalidad,
        duracion_horas,
        imagen_url,
        precio
      } = req.body
      
      const result = await query(
        `INSERT INTO skills 
        (id_usuario, titulo, descripcion, categoria, nivel, modalidad, duracion_horas, imagen_url, precio, es_activo, creado_en, actualizado_en)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
        RETURNING *`,
        [req.userId, titulo, descripcion, categoria, nivel, modalidad, duracion_horas, imagen_url, precio]
      )
      
      res.status(201).json({
        success: true,
        message: 'Skill creado exitosamente',
        data: result.rows[0]
      })
      
    } catch (error) {
      console.error('Error en create skill:', error)
      res.status(500).json({
        success: false,
        message: 'Error al crear skill',
        error: error.message
      })
    }
  }
  
  /**
   * PUT /api/skills/:id
   * Actualizar skill (solo el dueño)
   */
  async update(req, res) {
    try {
      const { id } = req.params
      
      // Verificar que el skill pertenece al usuario
      const skillCheck = await query(
        'SELECT id_usuario FROM skills WHERE id_skill = $1',
        [id]
      )
      
      if (skillCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Skill no encontrado'
        })
      }
      
      if (skillCheck.rows[0].id_usuario !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar este skill'
        })
      }
      
      const {
        titulo,
        descripcion,
        categoria,
        nivel,
        modalidad,
        duracion_horas,
        imagen_url,
        precio
      } = req.body
      
      const result = await query(
        `UPDATE skills 
        SET titulo = $1, descripcion = $2, categoria = $3, nivel = $4, 
            modalidad = $5, duracion_horas = $6, imagen_url = $7, precio = $8,
            actualizado_en = NOW()
        WHERE id_skill = $9
        RETURNING *`,
        [titulo, descripcion, categoria, nivel, modalidad, duracion_horas, imagen_url, precio, id]
      )
      
      res.status(200).json({
        success: true,
        message: 'Skill actualizado exitosamente',
        data: result.rows[0]
      })
      
    } catch (error) {
      console.error('Error en update skill:', error)
      res.status(500).json({
        success: false,
        message: 'Error al actualizar skill',
        error: error.message
      })
    }
  }
  
  /**
   * DELETE /api/skills/:id
   * Eliminar skill (soft delete)
   */
  async delete(req, res) {
    try {
      const { id } = req.params
      
      // Verificar que el skill pertenece al usuario
      const skillCheck = await query(
        'SELECT id_usuario FROM skills WHERE id_skill = $1',
        [id]
      )
      
      if (skillCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Skill no encontrado'
        })
      }
      
      if (skillCheck.rows[0].id_usuario !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar este skill'
        })
      }
      
      // Soft delete
      await query(
        'UPDATE skills SET es_activo = false, actualizado_en = NOW() WHERE id_skill = $1',
        [id]
      )
      
      res.status(200).json({
        success: true,
        message: 'Skill eliminado exitosamente'
      })
      
    } catch (error) {
      console.error('Error en delete skill:', error)
      res.status(500).json({
        success: false,
        message: 'Error al eliminar skill',
        error: error.message
      })
    }
  }
}

export default new SkillsController()