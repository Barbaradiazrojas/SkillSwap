import { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../services/api'

// Crear el contexto
const AuthContext = createContext()

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          
          // Verificar que el token sigue siendo válido
          try {
            const response = await authAPI.verifyToken()
            if (!response.data.success) {
              // Token inválido, limpiar
              logout()
            }
          } catch (error) {
            // Error al verificar token, limpiar
            console.error('Error al verificar token:', error)
            logout()
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Función de login
  const login = (userData, authToken) => {
    try {
      // Guardar en estado
      setUser(userData)
      setToken(authToken)

      // Persistir en localStorage
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return true
    } catch (error) {
      console.error('Error al guardar sesión:', error)
      return false
    }
  }

  // Función de logout
  const logout = () => {
    try {
      // Limpiar estado
      setUser(null)
      setToken(null)

      // Limpiar localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      return true
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      return false
    }
  }

  // Función de registro (guarda automáticamente la sesión)
  const register = async (userData, authToken) => {
    return login(userData, authToken)
  }

  // Función para actualizar datos del usuario
  const updateUser = (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return true
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return false
    }
  }

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!user && !!token
  }

  // Función para obtener el token (útil para peticiones API)
  const getToken = () => {
    return token
  }

  // Valor del contexto que se compartirá
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated,
    getToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext