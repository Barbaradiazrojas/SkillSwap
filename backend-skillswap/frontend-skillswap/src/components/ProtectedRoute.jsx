import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

function ProtectedRoute({ children, requireAuth = true, redirectTo = '/login' }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <Loading fullScreen message="Verificando sesión..." />
  }

  // Si requiere autenticación y no hay usuario
  if (requireAuth && !user) {
    // Guardar la ubicación desde donde vino para redirigir después del login
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Si NO requiere autenticación pero hay usuario (ej: login cuando ya está logueado)
  if (!requireAuth && user) {
    return <Navigate to="/" replace />
  }

  // Si todo está bien, renderizar el componente hijo
  return children
}

export default ProtectedRoute