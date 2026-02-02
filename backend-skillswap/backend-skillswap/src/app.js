import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Importar rutas
import authRoutes from './features/auth/auth.routes.js'
import skillsRoutes from './features/skills/skills.routes.js'
import favoritosRoutes from './features/favorites/favorites.routes.js'
import carritoRoutes from './features/cart/cart.routes.js'
import usersRoutes from './features/users/users.routes.js'

// Cargar variables de entorno
dotenv.config()

// Crear aplicación Express
const app = express()

// MIDDLEWARES GLOBALES


// CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Parse JSON
app.use(express.json())

// Parse URL-encoded
app.use(express.urlencoded({ extended: true }))

// Logger simple
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`)
  next()
})


// RUTAS

// Ruta de health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SkillSwap API funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/favorites', favoritosRoutes)
app.use('/api/cart', carritoRoutes)
app.use('/api/users', usersRoutes)


// MANEJO DE ERRORES

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  })
})

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// INICIAR SERVIDOR

const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('🚀 ========================================')
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
    console.log(`🚀 Entorno: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🚀 URL: http://localhost:${PORT}`)
    console.log('🚀 ========================================')
  })
}

export default app