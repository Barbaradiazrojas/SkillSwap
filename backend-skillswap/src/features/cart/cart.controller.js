import { query, getClient } from '../../config/database.js'

class CarritoController {
  
  /**
   * GET /api/cart
   * Obtener carrito del usuario autenticado
   */
  async getMyCart(req, res) {
    try {
      // Primero obtener o crear el carrito del usuario
      let carritoResult = await query(
        'SELECT id_carrito FROM carrito WHERE id_usuario = $1',
        [req.userId]
      )
      
      let carritoId
      
      if (carritoResult.rows.length === 0) {
        // Crear carrito si no existe
        const newCarrito = await query(
          'INSERT INTO carrito (id_usuario, creado_en) VALUES ($1, NOW()) RETURNING id_carrito',
          [req.userId]
        )
        carritoId = newCarrito.rows[0].id_carrito
      } else {
        carritoId = carritoResult.rows[0].id_carrito
      }
      
      // Obtener items del carrito
      const itemsResult = await query(
        `SELECT 
          ic.id_item,
          ic.cantidad,
          ic.precio_unitario,
          s.id_skill,
          s.titulo,
          s.descripcion,
          s.categoria,
          s.imagen_url,
          s.duracion_horas,
          u.nombre || ' ' || u.apellido as nombre_usuario,
          u.avatar_url as usuario_avatar
        FROM items_carrito ic
        INNER JOIN skills s ON ic.id_skill = s.id_skill
        INNER JOIN usuarios u ON s.id_usuario = u.id_usuario
        WHERE ic.id_carrito = $1 AND s.es_activo = true
        ORDER BY ic.creado_en DESC`,
        [carritoId]
      )
      
      // Calcular totales
      const items = itemsResult.rows
      const subtotal = items.reduce((sum, item) => 
        sum + (parseFloat(item.precio_unitario) * item.cantidad), 0
      )
      
      res.status(200).json({
        success: true,
        message: 'Carrito obtenido exitosamente',
        data: {
          carrito_id: carritoId,
          items: items,
          subtotal: subtotal,
          total: subtotal,
          items_count: items.length
        }
      })
      
    } catch (error) {
      console.error('Error en getMyCart:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener carrito',
        error: error.message
      })
    }
  }
  
  /**
   * POST /api/cart/items
   * Agregar item al carrito
   */
  async addItem(req, res) {
    try {
      const { skillId, cantidad = 1 } = req.body
      
      // Verificar que el skill existe y obtener su precio
      const skillResult = await query(
        'SELECT id_skill, precio, id_usuario FROM skills WHERE id_skill = $1 AND es_activo = true',
        [skillId]
      )
      
      if (skillResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Skill no encontrado'
        })
      }
      
      const skill = skillResult.rows[0]
      
      // No permitir agregar sus propios skills
      if (skill.id_usuario === req.userId) {
        return res.status(400).json({
          success: false,
          message: 'No puedes agregar tus propios skills al carrito'
        })
      }
      
      // Obtener o crear carrito
      let carritoResult = await query(
        'SELECT id_carrito FROM carrito WHERE id_usuario = $1',
        [req.userId]
      )
      
      let carritoId
      
      if (carritoResult.rows.length === 0) {
        const newCarrito = await query(
          'INSERT INTO carrito (id_usuario, creado_en) VALUES ($1, NOW()) RETURNING id_carrito',
          [req.userId]
        )
        carritoId = newCarrito.rows[0].id_carrito
      } else {
        carritoId = carritoResult.rows[0].id_carrito
      }
      
      // Verificar si el item ya está en el carrito
      const existingItem = await query(
        'SELECT id_item, cantidad FROM items_carrito WHERE id_carrito = $1 AND id_skill = $2',
        [carritoId, skillId]
      )
      
      let result
      
      if (existingItem.rows.length > 0) {
        // Actualizar cantidad si ya existe
        result = await query(
          `UPDATE items_carrito 
           SET cantidad = cantidad + $1 
           WHERE id_item = $2 
           RETURNING *`,
          [cantidad, existingItem.rows[0].id_item]
        )
      } else {
        // Insertar nuevo item
        result = await query(
          `INSERT INTO items_carrito (id_carrito, id_skill, cantidad, precio_unitario, creado_en)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING *`,
          [carritoId, skillId, cantidad, skill.precio]
        )
      }
      
      res.status(201).json({
        success: true,
        message: 'Item agregado al carrito',
        data: result.rows[0]
      })
      
    } catch (error) {
      console.error('Error en addItem:', error)
      res.status(500).json({
        success: false,
        message: 'Error al agregar item al carrito',
        error: error.message
      })
    }
  }
  
  /**
   * PUT /api/cart/items/:itemId
   * Actualizar cantidad de un item
   */
  async updateItem(req, res) {
    try {
      const { itemId } = req.params
      const { cantidad } = req.body
      
      if (cantidad < 1) {
        return res.status(400).json({
          success: false,
          message: 'La cantidad debe ser mayor a 0'
        })
      }
      
      // Verificar que el item pertenece al carrito del usuario
      const itemCheck = await query(
        `SELECT ic.id_item 
         FROM items_carrito ic
         INNER JOIN carrito c ON ic.id_carrito = c.id_carrito
         WHERE ic.id_item = $1 AND c.id_usuario = $2`,
        [itemId, req.userId]
      )
      
      if (itemCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item no encontrado en tu carrito'
        })
      }
      
      const result = await query(
        'UPDATE items_carrito SET cantidad = $1 WHERE id_item = $2 RETURNING *',
        [cantidad, itemId]
      )
      
      res.status(200).json({
        success: true,
        message: 'Item actualizado',
        data: result.rows[0]
      })
      
    } catch (error) {
      console.error('Error en updateItem:', error)
      res.status(500).json({
        success: false,
        message: 'Error al actualizar item',
        error: error.message
      })
    }
  }
  
  /**
   * DELETE /api/cart/items/:itemId
   * Eliminar item del carrito
   */
  async removeItem(req, res) {
    try {
      const { itemId } = req.params
      
      // Verificar que el item pertenece al carrito del usuario
      const itemCheck = await query(
        `SELECT ic.id_item 
         FROM items_carrito ic
         INNER JOIN carrito c ON ic.id_carrito = c.id_carrito
         WHERE ic.id_item = $1 AND c.id_usuario = $2`,
        [itemId, req.userId]
      )
      
      if (itemCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item no encontrado en tu carrito'
        })
      }
      
      await query('DELETE FROM items_carrito WHERE id_item = $1', [itemId])
      
      res.status(200).json({
        success: true,
        message: 'Item eliminado del carrito'
      })
      
    } catch (error) {
      console.error('Error en removeItem:', error)
      res.status(500).json({
        success: false,
        message: 'Error al eliminar item',
        error: error.message
      })
    }
  }
  
  /**
   * DELETE /api/cart
   * Vaciar carrito completo
   */
  async clearCart(req, res) {
    try {
      const carritoResult = await query(
        'SELECT id_carrito FROM carrito WHERE id_usuario = $1',
        [req.userId]
      )
      
      if (carritoResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No tienes un carrito'
        })
      }
      
      await query(
        'DELETE FROM items_carrito WHERE id_carrito = $1',
        [carritoResult.rows[0].id_carrito]
      )
      
      res.status(200).json({
        success: true,
        message: 'Carrito vaciado exitosamente'
      })
      
    } catch (error) {
      console.error('Error en clearCart:', error)
      res.status(500).json({
        success: false,
        message: 'Error al vaciar carrito',
        error: error.message
      })
    }
  }
}

export default new CarritoController()