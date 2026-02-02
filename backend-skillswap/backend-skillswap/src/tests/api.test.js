import request from 'supertest'
import app from '../app.js'

describe('SkillSwap API Tests', () => {
  
  let authToken
  let testUserId
  let testSkillId
  
  // TEST 1: REGISTRO DE USUARIO (POST /api/auth/register)
  describe('POST /api/auth/register', () => {
    
    it('Debería registrar un nuevo usuario exitosamente - Código 201', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'Usuario',
          email: `test${Date.now()}@example.com`,
          password: 'password123'
        })
      
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data).toHaveProperty('user')
      
      // Guardar token para otros tests
      authToken = response.body.data.token
      testUserId = response.body.data.user.user_id
    })
    
    it('Debería fallar con email duplicado - Código 409', async () => {
      const email = `duplicate${Date.now()}@example.com`
      
      // Primer registro
      await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'Usuario',
          email: email,
          password: 'password123'
        })
      
      // Segundo registro con mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'Usuario',
          email: email,
          password: 'password123'
        })
      
      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
    })
    
    it('Debería fallar con datos inválidos - Código 400', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: '',
          email: 'invalid-email',
          password: '123' // muy corta
        })
      
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body).toHaveProperty('errors')
    })
  })
  
  // TEST 2: LOGIN (POST /api/auth/login)
  describe('POST /api/auth/login', () => {
    
    const testEmail = `login${Date.now()}@example.com`
    const testPassword = 'password123'
    
    beforeAll(async () => {
      // Crear usuario para login
      await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Login',
          apellido: 'Test',
          email: testEmail,
          password: testPassword
        })
    })
    
    it('Debería hacer login exitosamente - Código 200', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        })
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('token')
      expect(response.body.data.user.email).toBe(testEmail)
    })
    
    it('Debería fallar con credenciales incorrectas - Código 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword'
        })
      
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
    
    it('Debería fallar con usuario inexistente - Código 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'password123'
        })
      
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })
  
  // TEST 3: OBTENER SKILLS (GET /api/skills)
  describe('GET /api/skills', () => {
    
    it('Debería obtener lista de skills - Código 200', async () => {
      const response = await request(app)
        .get('/api/skills')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })
    
    it('Debería filtrar por categoría - Código 200', async () => {
      const response = await request(app)
        .get('/api/skills?categoria=Diseño')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
    
    it('Debería respetar el límite de resultados - Código 200', async () => {
      const limit = 5
      const response = await request(app)
        .get(`/api/skills?limit=${limit}`)
      
      expect(response.status).toBe(200)
      expect(response.body.data.length).toBeLessThanOrEqual(limit)
    })
  })
  
  // TEST 4: CREAR SKILL (POST /api/skills) - CON AUTENTICACIÓN
  describe('POST /api/skills', () => {
    
    it('Debería fallar sin token - Código 401', async () => {
      const response = await request(app)
        .post('/api/skills')
        .send({
          titulo: 'Test Skill',
          descripcion: 'Descripción de prueba',
          categoria: 'Programación',
          nivel: 'Intermedio',
          modalidad: 'Online',
          precio: 15000
        })
      
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
    
    it('Debería crear skill con token válido - Código 201', async () => {
      const response = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          titulo: 'JavaScript Avanzado',
          descripcion: 'Aprende JavaScript en profundidad',
          categoria: 'Programación',
          nivel: 'Avanzado',
          modalidad: 'Online',
          duracion_horas: 40,
          imagen_url: 'https://example.com/image.jpg',
          precio: 25000
        })
      
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('id_skill')
      
      testSkillId = response.body.data.id_skill
    })
    
    it('Debería fallar con datos inválidos - Código 400', async () => {
      const response = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          titulo: '',
          nivel: 'Inválido',
          precio: -100
        })
      
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })
  
  // TEST 5: VERIFICAR TOKEN (GET /api/auth/verify)
  describe('GET /api/auth/verify', () => {
    
    it('Debería verificar token válido - Código 200', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
    
    it('Debería rechazar token inválido - Código 401', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer token_invalido')
      
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })
  
  
  // TEST 6: OBTENER PERFIL (GET /api/users/profile)
  describe('GET /api/users/profile', () => {
    
    it('Debería obtener perfil del usuario autenticado - Código 200', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('email')
      expect(response.body.data).toHaveProperty('nombre')
    })
    
    it('Debería fallar sin autenticación - Código 401', async () => {
      const response = await request(app)
        .get('/api/users/profile')
      
      expect(response.status).toBe(401)
    })
  })
  
  // TEST 7: HEALTH CHECK (GET /)
  describe('GET /', () => {
    
    it('Debería responder con información de la API - Código 200', async () => {
      const response = await request(app).get('/')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('version')
    })
  })
  
  // TEST 8: RUTA NO ENCONTRADA
  describe('404 Not Found', () => {
    
    it('Debería retornar 404 para ruta inexistente', async () => {
      const response = await request(app).get('/api/ruta-inexistente')
      
      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })
  })
})