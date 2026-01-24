import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Explorar from './pages/Explorar'
import DetalleSkill from './pages/DetalleSkill'
import CrearSkill from './pages/CrearSkill'
import Favoritos from './pages/Favoritos'
import Carrito from './pages/Carrito'
import MiPerfil from './pages/MiPerfil'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      
      <main className="flex-grow-1">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/skill/:id" element={<DetalleSkill />} />
          
          {/* Rutas de autenticación */}
          <Route 
            path="/login" 
            element={
              <ProtectedRoute requireAuth={false} redirectTo="/">
                <Login />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <ProtectedRoute requireAuth={false} redirectTo="/">
                <Register />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas protegidas */}
          <Route 
            path="/crear-skill" 
            element={
              <ProtectedRoute>
                <CrearSkill />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/favoritos" 
            element={
              <ProtectedRoute>
                <Favoritos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/carrito" 
            element={
              <ProtectedRoute>
                <Carrito />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <MiPerfil />
              </ProtectedRoute>
            } 
          />
          
          {/* Ruta 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App