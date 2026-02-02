import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Configuración que funciona TANTO en desarrollo LOCAL como en RENDER
const poolConfig = process.env.DATABASE_URL 
  ? {
      // PRODUCCIÓN (Render) - Usa DATABASE_URL
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Requerido por Render
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      // DESARROLLO LOCAL - Usa variables individuales
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'skillswap',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
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