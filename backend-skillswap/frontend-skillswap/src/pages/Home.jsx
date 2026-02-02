import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { skillsAPI } from '../services/api'
import SkillCard from '../components/SkillCard'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todo')

  const categories = ['Todo', 'Diseño', 'Música', 'Cocina', 'Programación', 'Fotografía', 'Idiomas', 'Marketing']

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const response = await skillsAPI.getAll({ limit: 8 })
      setSkills(response.data.data || [])
    } catch (error) {
      console.error('Error al cargar skills:', error)
      // Usar datos de ejemplo si falla
      setSkills([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Buscando:', searchTerm)
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Header Hero Section */}
      <section className="bg-white border-bottom">
        <Container className="py-4 py-md-5">
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="display-5 fw-bold mb-3">
                Hola, {user ? user.name.split(' ')[0] : 'Invitado'} 👋
              </h1>
              <p className="text-muted fs-5 mb-4">
                ¿Qué quieres aprender hoy?
              </p>
            </Col>
            <Col md={4} className="text-end d-none d-md-block">
              <i className="bi bi-mortarboard-fill text-primary" style={{ fontSize: '5rem' }}></i>
            </Col>
          </Row>

          {/* Search Bar */}
          <Form onSubmit={handleSearch} className="mt-4">
            <div className="position-relative">
              <Form.Control
                type="search"
                placeholder="Buscar habilidades, tutores..."
                className="ps-5 py-3 rounded-pill shadow-sm border-0"
                style={{ backgroundColor: '#f8f9fa' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-muted"></i>
            </div>
          </Form>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-4 bg-white border-bottom">
        <Container>
          <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline-secondary'}
                size="sm"
                className="rounded-pill px-4 flex-shrink-0"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured Skills Section */}
      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="h4 fw-bold mb-0">Habilidades Destacadas</h3>
            <Link to="/explorar" className="text-decoration-none fw-semibold">
              Ver todo <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <Row className="g-4">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <Col key={skill.id_skill} xs={6} lg={3}>
                    <SkillCard skill={skill} />
                  </Col>
                ))
              ) : (
                // Skills de ejemplo si no hay datos
                <>
                  <Col xs={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm hover-shadow">
                      <div style={{ paddingTop: '125%', position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="position-absolute top-0 end-0 m-2 rounded-circle"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                          >
                            <i className="bi bi-heart"></i>
                          </Button>
                        </div>
                      </div>
                      <Card.Body>
                        <Card.Title className="h6 mb-2">Clases de Guitarra</Card.Title>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-circle bg-secondary" 
                            style={{ width: '20px', height: '20px' }}
                          ></div>
                          <small className="text-muted">Pedro Gómez</small>
                        </div>
                        <p className="text-primary fw-bold mb-0">$15.000 CLP</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm hover-shadow">
                      <div style={{ paddingTop: '125%', position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'url(https://images.unsplash.com/photo-1561070791-2526d30994b5)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="position-absolute top-0 end-0 m-2 rounded-circle text-danger"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                          >
                            <i className="bi bi-heart-fill"></i>
                          </Button>
                        </div>
                      </div>
                      <Card.Body>
                        <Card.Title className="h6 mb-2">Diseño UI/UX</Card.Title>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-circle bg-secondary" 
                            style={{ width: '20px', height: '20px' }}
                          ></div>
                          <small className="text-muted">Ana María</small>
                        </div>
                        <p className="text-primary fw-bold mb-0">$25.000 CLP</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm hover-shadow">
                      <div style={{ paddingTop: '125%', position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'url(https://images.unsplash.com/photo-1556910103-1c02745aae4d)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="position-absolute top-0 end-0 m-2 rounded-circle"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                          >
                            <i className="bi bi-heart"></i>
                          </Button>
                        </div>
                      </div>
                      <Card.Body>
                        <Card.Title className="h6 mb-2">Cocina Chilena</Card.Title>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-circle bg-secondary" 
                            style={{ width: '20px', height: '20px' }}
                          ></div>
                          <small className="text-muted">Luis Soto</small>
                        </div>
                        <p className="text-primary fw-bold mb-0">$12.000 CLP</p>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm hover-shadow">
                      <div style={{ paddingTop: '125%', position: 'relative', overflow: 'hidden', borderRadius: '12px 12px 0 0' }}>
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'url(https://images.unsplash.com/photo-1452587925148-ce544e77e70d)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="position-absolute top-0 end-0 m-2 rounded-circle"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                          >
                            <i className="bi bi-heart"></i>
                          </Button>
                        </div>
                      </div>
                      <Card.Body>
                        <Card.Title className="h6 mb-2">Fotografía Digital</Card.Title>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div 
                            className="rounded-circle bg-secondary" 
                            style={{ width: '20px', height: '20px' }}
                          ></div>
                          <small className="text-muted">Carla Vera</small>
                        </div>
                        <p className="text-primary fw-bold mb-0">$20.000 CLP</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              )}
            </Row>
          )}
        </Container>
      </section>

      {/* CTA Banner */}
      <section className="py-5">
        <Container>
          <Card className="border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="p-4 p-md-5">
              <Row className="align-items-center">
                <Col md={8}>
                  <h4 className="text-white fw-bold mb-3">
                    <i className="bi bi-rocket-takeoff-fill me-2"></i>
                    Gana dinero enseñando
                  </h4>
                  <p className="text-white-50 mb-4">
                    Convierte tus habilidades en ingresos reales. Comparte tu conocimiento y ayuda a otros a aprender.
                  </p>
                  <Link to="/crear-skill">
                    <Button variant="light" size="lg" className="fw-semibold">
                      Empezar ahora
                    </Button>
                  </Link>
                </Col>
                <Col md={4} className="text-center d-none d-md-block">
                  <i className="bi bi-cash-coin text-white" style={{ fontSize: '6rem', opacity: 0.3 }}></i>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </section>
    </div>
  )
}

export default Home