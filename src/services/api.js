import axios from 'axios'

// URL base del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos
})

// Interceptor para agregar token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido, limpiar localStorage
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Opcionalmente redirigir al login
      // window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// AUTH API
export const authAPI = {
  // Registrar usuario
  register: (userData) => api.post('/api/auth/register', userData),
  
  // Login
  login: (credentials) => api.post('/api/auth/login', credentials),
  
  // Verificar token
  verifyToken: () => api.get('/api/auth/verify')
}

// SKILLS API
export const skillsAPI = {
  // Obtener todos los skills (con filtros opcionales)
  getAll: (params = {}) => api.get('/api/skills', { params }),
  
  // Obtener un skill por ID
  getById: (id) => api.get(`/api/skills/${id}`),
  
  // Crear nuevo skill (requiere autenticación)
  create: (skillData) => api.post('/api/skills', skillData),
  
  // Actualizar skill (requiere autenticación)
  update: (id, skillData) => api.put(`/api/skills/${id}`, skillData),
  
  // Eliminar skill (requiere autenticación)
  delete: (id) => api.delete(`/api/skills/${id}`)
}

// FAVORITES API
export const favoritesAPI = {
  // Obtener favoritos del usuario (requiere autenticación)
  getMyFavorites: () => api.get('/api/favorites'),
  
  // Agregar a favoritos (requiere autenticación)
  addFavorite: (skillId) => api.post(`/api/favorites/${skillId}`),
  
  // Eliminar de favoritos (requiere autenticación)
  removeFavorite: (skillId) => api.delete(`/api/favorites/${skillId}`),
  
  // Verificar si un skill está en favoritos (requiere autenticación)
  checkFavorite: (skillId) => api.get(`/api/favorites/check/${skillId}`)
}

// CART API
export const cartAPI = {
  // Obtener carrito del usuario (requiere autenticación)
  getMyCart: () => api.get('/api/cart'),
  
  // Agregar item al carrito (requiere autenticación)
  addItem: (itemData) => api.post('/api/cart/items', itemData),
  
  // Actualizar cantidad de un item (requiere autenticación)
  updateItem: (itemId, cantidad) => api.put(`/api/cart/items/${itemId}`, { cantidad }),
  
  // Eliminar item del carrito (requiere autenticación)
  removeItem: (itemId) => api.delete(`/api/cart/items/${itemId}`),
  
  // Vaciar carrito (requiere autenticación)
  clearCart: () => api.delete('/api/cart')
}

// USERS API
export const usersAPI = {
  // Obtener perfil del usuario autenticado (requiere autenticación)
  getMyProfile: () => api.get('/api/users/profile'),
  
  // Obtener mis skills (requiere autenticación)
  getMySkills: () => api.get('/api/users/my-skills'),
  
  // Actualizar perfil (requiere autenticación)
  updateProfile: (profileData) => api.put('/api/users/profile', profileData)
}

// REVIEWS API
export const reviewsAPI = {
  // Obtener reseñas de un skill
  getBySkill: (skillId) => api.get(`/api/skills/${skillId}/reviews`),
  
  // Crear una reseña (requiere autenticación)
  create: (reviewData) => api.post('/api/reviews', reviewData),
  
  // Actualizar reseña (requiere autenticación)
  update: (reviewId, reviewData) => api.put(`/api/reviews/${reviewId}`, reviewData),
  
  // Eliminar reseña (requiere autenticación)
  delete: (reviewId) => api.delete(`/api/reviews/${reviewId}`)
}

export default api