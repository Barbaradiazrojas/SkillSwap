import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// Configuración del pool de conexiones
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Verificar conexión
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL')
})

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err)
  process.exit(-1)
})

// Función auxiliar para queries
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

// Función para obtener un cliente del pool (transacciones)
export const getClient = async () => {
  const client = await pool.connect()
  const query = client.query.bind(client)
  const release = client.release.bind(client)
  
  // Timeout de liberación
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