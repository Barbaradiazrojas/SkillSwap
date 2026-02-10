import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generalLimiter } from './middleware/rateLimiter.js'

dotenv.config()

const app = express()

// CORS configurado para producción
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como Postman, apps móviles)
    if (!origin) return callback(null, true)
    
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      /\.vercel\.app$/  // Todos los subdominios de vercel.app
    ]
    
    // Verificar si el origin está permitido
    const isAllowed = allowedOrigins.some(allowed => 
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    )
    
    if (isAllowed) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

// Middlewares básicos (ORDEN IMPORTANTE)
app.use(cors(corsOptions))
app.use(express.json())

// Rate limiter general - protege todas las rutas /api/*
// IMPORTANTE: Debe ir ANTES de las rutas específicas
app.use('/api/', generalLimiter)

// Health check (sin rate limit para monitoreo)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'SkillSwap API running',
    timestamp: new Date().toISOString()
  })
})

// Rutas de la API (cada una puede tener sus propios rate limiters específicos)
import authRoutes from './features/auth/auth.routes.js'
import skillsRoutes from './features/skills/skills.routes.js'
import usersRoutes from './features/users/users.routes.js'
import favoritesRoutes from './features/favorites/favorites.routes.js'
import cartRoutes from './features/cart/cart.routes.js'

app.use('/api/auth', authRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/cart', cartRoutes)

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  })
})

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  
  // Error de CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origen no permitido por CORS'
    })
  }
  
  // Error de rate limit
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: err.message || 'Demasiadas peticiones'
    })
  }
  
  // Error genérico
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  })
})

// Servidor - IMPORTANTE: Escuchar en 0.0.0.0 para Render
const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`)
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🛡️  Rate limiting activado`)
})

export default app