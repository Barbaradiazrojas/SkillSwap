import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

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

// Middlewares
app.use(cors(corsOptions))
app.use(express.json())

// Rutas
import authRoutes from './features/auth/auth.routes.js'
import skillsRoutes from './features/skills/skills.routes.js'
import usersRoutes from './features/users/users.routes.js'
import favoritesRoutes from './features/favorites/favorites.routes.js'
import cartRoutes from './features/cart/cart.routes.js'

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'SkillSwap API running',
    timestamp: new Date().toISOString()
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/cart', cartRoutes)

// Servidor - IMPORTANTE: Escuchar en 0.0.0.0 para Render
const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`)
  console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`)
})

export default app