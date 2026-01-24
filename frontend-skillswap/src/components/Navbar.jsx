import { useState } from 'react'
import { Container, Navbar as BSNavbar, Nav, NavDropdown, Badge, Form, Button } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada exitosamente')
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explorar?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <BSNavbar bg="white" expand="lg" className="shadow-sm sticky-top">
      <Container>
        {/* Brand/Logo */}
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <div 
            className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px' }}
          >
            <i className="bi bi-arrow-left-right text-white"></i>
          </div>
          <span className="fw-bold">SkillSwap</span>
        </BSNavbar.Brand>

        {/* Toggle para móvil */}
        <BSNavbar.Toggle aria-controls="navbar-nav" />

        <BSNavbar.Collapse id="navbar-nav">
          {/* Search Bar (Desktop) */}
          <Form onSubmit={handleSearch} className="mx-lg-4 my-3 my-lg-0 flex-grow-1 d-none d-lg-block" style={{ maxWidth: '400px' }}>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <Form.Control
                type="search"
                placeholder="Buscar skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-start-0"
              />
            </div>
          </Form>

          {/* Navigation Links */}
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`fw-semibold ${isActive('/') ? 'text-primary' : ''}`}
            >
              Inicio
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/explorar" 
              className={`fw-semibold ${isActive('/explorar') ? 'text-primary' : ''}`}
            >
              Explorar
            </Nav.Link>

            {user ? (
              <>
                {/* Favoritos */}
                <Nav.Link 
                  as={Link} 
                  to="/favoritos"
                  className={`position-relative ${isActive('/favoritos') ? 'text-primary' : ''}`}
                >
                  <i className="bi bi-heart fs-5"></i>
                </Nav.Link>

                {/* Carrito */}
                <Nav.Link 
                  as={Link} 
                  to="/carrito"
                  className={`position-relative ${isActive('/carrito') ? 'text-primary' : ''}`}
                >
                  <i className="bi bi-cart3 fs-5"></i>
                  <Badge 
                    bg="danger" 
                    pill 
                    className="position-absolute top-0 start-100 translate-middle"
                    style={{ fontSize: '0.6rem' }}
                  >
                    3
                  </Badge>
                </Nav.Link>

                {/* User Dropdown */}
                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-2">
                      <div 
                        className="rounded-circle bg-primary"
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundImage: user.avatar_url ? `url(${user.avatar_url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <span className="d-none d-lg-inline">{user.name}</span>
                    </span>
                  }
                  align="end"
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/perfil">
                    <i className="bi bi-person me-2"></i>
                    Mi Perfil
                  </NavDropdown.Item>
                  
                  <NavDropdown.Item as={Link} to="/mis-skills">
                    <i className="bi bi-lightbulb me-2"></i>
                    Mis Skills
                  </NavDropdown.Item>
                  
                  <NavDropdown.Item as={Link} to="/crear-skill">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Skill
                  </NavDropdown.Item>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item as={Link} to="/configuracion">
                    <i className="bi bi-gear me-2"></i>
                    Configuración
                  </NavDropdown.Item>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="fw-semibold">
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary" size="sm" className="rounded-pill px-3">
                    Registrarse
                  </Button>
                </Nav.Link>
              </>
            )}
          </Nav>

          {/* Search Bar (Mobile) */}
          <Form onSubmit={handleSearch} className="mt-3 d-lg-none">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>
              <Form.Control
                type="search"
                placeholder="Buscar skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Form>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar