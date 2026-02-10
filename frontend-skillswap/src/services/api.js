import axios from 'axios'
import { URLBASE } from '../utils/constants.js'

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: URLBASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

// AUTH API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  verifyToken: () => api.get('/api/auth/verify')
}

// SKILLS API
export const skillsAPI = {
  getAll: (params = {}) => api.get('/api/skills', { params }),
  getById: (id) => api.get(`/api/skills/${id}`),
  create: (skillData) => api.post('/api/skills', skillData),
  update: (id, skillData) => api.put(`/api/skills/${id}`, skillData),
  delete: (id) => api.delete(`/api/skills/${id}`)
}

// FAVORITES API
export const favoritesAPI = {
  getMyFavorites: () => api.get('/api/favorites'),
  addFavorite: (skillId) => api.post(`/api/favorites/${skillId}`),
  removeFavorite: (skillId) => api.delete(`/api/favorites/${skillId}`),
  checkFavorite: (skillId) => api.get(`/api/favorites/check/${skillId}`)
}

// CART API
export const cartAPI = {
  getMyCart: () => api.get('/api/cart'),
  addItem: (itemData) => api.post('/api/cart/items', itemData),
  updateItem: (itemId, cantidad) => api.put(`/api/cart/items/${itemId}`, { cantidad }),
  removeItem: (itemId) => api.delete(`/api/cart/items/${itemId}`),
  clearCart: () => api.delete('/api/cart')
}

// USERS API
export const usersAPI = {
  getMyProfile: () => api.get('/api/users/profile'),
  getMySkills: () => api.get('/api/users/my-skills'),
  updateProfile: (profileData) => api.put('/api/users/profile', profileData)
}

// REVIEWS API
export const reviewsAPI = {
  getBySkill: (skillId) => api.get(`/api/skills/${skillId}/reviews`),
  create: (reviewData) => api.post('/api/reviews', reviewData),
  update: (reviewId, reviewData) => api.put(`/api/reviews/${reviewId}`, reviewData),
  delete: (reviewId) => api.delete(`/api/reviews/${reviewId}`)
}

export const handleAPIError = (error) => {
  if (!error.response) {
    // Error de red
    return {
      message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      type: 'network'
    }
  }

  const status = error.response.status
  const serverMessage = error.response.data?.message

  switch (status) {
    case 400:
      return {
        message: serverMessage || 'Los datos enviados son inválidos',
        type: 'validation'
      }
    case 401:
      return {
        message: 'Credenciales incorrectas o sesión expirada',
        type: 'auth'
      }
    case 404:
      return {
        message: serverMessage || 'El recurso solicitado no existe',
        type: 'notFound'
      }
    case 409:
      return {
        message: serverMessage || 'Ya existe un registro con estos datos',
        type: 'conflict'
      }
    case 500:
      return {
        message: 'Error del servidor. Por favor intenta más tarde.',
        type: 'server'
      }
    default:
      return {
        message: serverMessage || 'Ocurrió un error inesperado',
        type: 'unknown'
      }
  }
}

export default api