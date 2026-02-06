import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Configuración usando variables individuales
const poolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
}

const pool = new Pool(poolConfig)

// Event listeners
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL')
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Modo: PRODUCCIÓN')
  } else {
    console.log('💻 Modo: DESARROLLO')
  }
})

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err)
  process.exit(-1)
})

// Verificar conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err)
  } else {
    console.log('✅ Base de datos conectada:', res.rows[0].now)
  }
})

// Funciones auxiliares
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('📊 Query ejecutada:', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('❌ Error en query:', error)
    throw error
  }
}

export const getClient = async () => {
  const client = await pool.connect()
  const query = client.query.bind(client)
  const release = client.release.bind(client)
  
  const timeout = setTimeout(() => {
    console.error('⚠️ Cliente no liberado después de 5 segundos')
  }, 5000)
  
  client.release = () => {
    clearTimeout(timeout)
    return release()
  }
  
  return client
}

export default pool
```

### Paso 2: Variables en Render

Ve a Render → Backend → **Entorno** y configura estas 5 variables:
```
DB_HOST      = dpg-d602nsu3jp1c73ck324g-a.oregon-postgres.render.com
DB_PORT      = 5432
DB_USER      = bdss_5mfa_user
DB_PASSWORD  = n5f7mlHFVCZgSdkfwoP6Hq8UEfRsX2AD
DB_NAME      = bdss_5mfa
JWT_SECRET   = Barbara
NODE_ENV     = production
FRONTEND_URL = https://skill-swap-tau-ochre.vercel.app