import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const app = express()

// CORS configurado para producción
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Middlewares
app.use(cors(corsOptions))
app.use(express.json())

// Rutas - Según tu estructura de features
import authRoutes from './features/auth/auth.routes.js'
import skillsRoutes from './features/skills/skills.routes.js'
import usersRoutes from './features/users/users.routes.js'
import favoritesRoutes from './features/favorites/favorites.routes.js'
import cartRoutes from './features/cart/cart.routes.js'

// Health check endpoint (para monitoreo de Render)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'SkillSwap API funcionando',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/cart', cartRoutes)

// Middleware para rutas no encontradas (404)
// IMPORTANTE: Solo si tienes errorHandler creado
// Si no lo tienes, comenta estas dos líneas por ahora
// import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
// app.use(notFoundHandler)
// app.use(errorHandler)

// Servidor
const PORT = process.env.PORT || 3000

// IMPORTANTE: Escuchar en 0.0.0.0 para Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`)
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`)
  if (process.env.FRONTEND_URL) {
    console.log(`🔗 CORS habilitado para: ${process.env.FRONTEND_URL}`)
  }
})

export default app