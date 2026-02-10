import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { favoritesAPI, handleAPIError } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Favoritos() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [favorites, setFavorites] = useState([])
  const [filteredFavorites, setFilteredFavorites] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = favorites.filter(fav =>
        fav.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFavorites(filtered)
    } else {
      setFilteredFavorites(favorites)
    }
  }, [searchTerm, favorites])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const response = await favoritesAPI.getMyFavorites()
      
      if (response.data.success) {
        setFavorites(response.data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error)
      const errorInfo = handleAPIError(error)
      toast.error(errorInfo.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (skillId, skillTitle) => {
    const result = await Swal.fire({
      title: '¿Eliminar de favoritos?',
      text: `¿Estás seguro de eliminar "${skillTitle}" de tus favoritos?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await favoritesAPI.removeFavorite(skillId)
        setFavorites(prev => prev.filter(fav => fav.id_skill !== skillId))
        toast.success('Eliminado de favoritos')
      } catch (error) {
        console.error('Error al eliminar favorito:', error)
        const errorInfo = handleAPIError(error)
        toast.error(errorInfo.message)
      }
    }
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Header */}
      <section className="bg-white border-bottom sticky-top" style={{ top: 0, zIndex: 10 }}>
        <Container className="py-3">
          <Row className="align-items-center">
            <Col xs="auto">
              <Button 
                variant="link" 
                className="text-dark p-0" 
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left fs-4"></i>
              </Button>
            </Col>
            <Col>
              <h1 className="h4 fw-bold mb-0">Mis Favoritos</h1>
              <p className="text-muted small mb-0">
                {filteredFavorites.length} {filteredFavorites.length === 1 ? 'skill guardado' : 'skills guardados'}
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-4">
        {/* Barra de búsqueda */}
        <div className="mb-4">
          <InputGroup className="shadow-sm">
            <InputGroup.Text className="bg-white border-end-0 rounded-start-pill">
              <i className="bi bi-search text-muted"></i>
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="Buscar entre tus favoritos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-start-0 rounded-end-pill py-2"
              style={{ fontSize: '0.95rem' }}
            />
          </InputGroup>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando tus favoritos...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <i className="bi bi-heart text-muted mb-3" style={{ fontSize: '4rem' }}></i>
              <h4 className="mb-2">
                {searchTerm ? 'No se encontraron resultados' : 'Aún no tienes favoritos'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm 
                  ? 'Intenta buscar con otras palabras' 
                  : 'Empieza a guardar skills que te interesen'
                }
              </p>
              {!searchTerm && (
                <Link to="/explorar">
                  <Button variant="primary">
                    Explorar Skills
                  </Button>
                </Link>
              )}
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-3 g-md-4">
            {filteredFavorites.map((favorite) => (
              <Col key={favorite.id_favorito} xs={6} lg={4} xl={3}>
                <Card 
                  className="h-100 border-0 shadow-sm position-relative overflow-hidden"
                  style={{ borderRadius: '16px' }}
                >
                  {/* Imagen */}
                  <div 
                    className="position-relative"
                    style={{ paddingTop: '125%', cursor: 'pointer' }}
                    onClick={() => navigate(`/skill/${favorite.id_skill}`)}
                  >
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%), url(${favorite.imagen_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {/* Botón Favorito */}
                      <Button
                        variant="light"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2 rounded-circle shadow"
                        style={{ width: '36px', height: '36px', padding: 0 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFavorite(favorite.id_skill, favorite.titulo)
                        }}
                      >
                        <i className="bi bi-heart-fill text-danger"></i>
                      </Button>

                      {/* Rating Badge */}
                      {favorite.rating && (
                        <Badge 
                          bg="dark" 
                          className="position-absolute bottom-0 start-0 m-2 d-flex align-items-center gap-1"
                          style={{ fontSize: '0.7rem', opacity: 0.9 }}
                        >
                          <i className="bi bi-star-fill text-warning"></i>
                          {parseFloat(favorite.rating).toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Contenido */}
                  <Card.Body className="p-3">
                    <Link 
                      to={`/skill/${favorite.id_skill}`}
                      className="text-decoration-none text-dark"
                    >
                      <Card.Title 
                        className="h6 mb-2 text-truncate" 
                        style={{ fontSize: '0.9rem' }}
                      >
                        {favorite.titulo}
                      </Card.Title>
                    </Link>
                    
                    <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>
                      por {favorite.nombre_usuario}
                    </p>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                        ${Math.round(favorite.precio).toLocaleString('es-CL')}
                      </span>
                      <Badge bg="light" text="dark" className="text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {favorite.categoria}
                      </Badge>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Botón Explorar más */}
        {!loading && filteredFavorites.length > 0 && (
          <div className="text-center mt-5">
            <p className="text-muted mb-3">¿Buscas más skills?</p>
            <Link to="/explorar">
              <Button variant="outline-primary" size="lg">
                Explorar más skills
                <i className="bi bi-arrow-right ms-2"></i>
              </Button>
            </Link>
          </div>
        )}
      </Container>
    </div>
  )
}

export default Favoritos