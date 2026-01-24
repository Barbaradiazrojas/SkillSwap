import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, ListGroup, Form, Tab, Tabs } from 'react-bootstrap'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { skillsAPI, favoritesAPI, cartAPI, reviewsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import SkillCard from '../components/SkillCard'

function DetalleSkill() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [skill, setSkill] = useState(null)
  const [reviews, setReviews] = useState([])
  const [relatedSkills, setRelatedSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  
  // Estado para nueva reseña
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    puntuacion: 5,
    comentario: ''
  })

  useEffect(() => {
    loadSkillDetails()
    window.scrollTo(0, 0)
  }, [id])

  const loadSkillDetails = async () => {
    try {
      setLoading(true)
      
      // Cargar skill
      const skillResponse = await skillsAPI.getById(id)
      if (skillResponse.data.success) {
        setSkill(skillResponse.data.data)
      }

      // Cargar reseñas
      const reviewsResponse = await reviewsAPI.getBySkill(id)
      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data || [])
      }

      // Cargar skills relacionados
      const relatedResponse = await skillsAPI.getAll({ 
        categoria: skillResponse.data.data?.categoria,
        limit: 4 
      })
      if (relatedResponse.data.success) {
        setRelatedSkills(relatedResponse.data.data?.filter(s => s.id_skill !== parseInt(id)) || [])
      }

    } catch (error) {
      console.error('Error al cargar skill:', error)
      // Datos de ejemplo
      setSkill(getDemoSkill())
      setReviews(getDemoReviews())
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Debes iniciar sesión para agregar al carrito')
      navigate('/login')
      return
    }

    try {
      await cartAPI.addItem(skill.id_skill, 1)
      setIsInCart(true)
      toast.success('Agregado al carrito')
    } catch (error) {
      console.error('Error al agregar al carrito:', error)
      toast.error('Error al agregar al carrito')
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info('Debes iniciar sesión para agregar a favoritos')
      navigate('/login')
      return
    }

    try {
      if (isFavorite) {
        await favoritesAPI.remove(skill.id_skill)
        setIsFavorite(false)
        toast.success('Eliminado de favoritos')
      } else {
        await favoritesAPI.add(skill.id_skill)
        setIsFavorite(true)
        toast.success('Agregado a favoritos')
      }
    } catch (error) {
      console.error('Error al manejar favorito:', error)
      toast.error('Error al actualizar favoritos')
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.info('Debes iniciar sesión para dejar una reseña')
      navigate('/login')
      return
    }

    try {
      await reviewsAPI.create({
        id_skill: skill.id_skill,
        puntuacion: newReview.puntuacion,
        comentario: newReview.comentario
      })
      
      toast.success('Reseña publicada exitosamente')
      setShowReviewForm(false)
      setNewReview({ puntuacion: 5, comentario: '' })
      loadSkillDetails()
    } catch (error) {
      console.error('Error al publicar reseña:', error)
      toast.error('Error al publicar reseña')
    }
  }

  const getDemoSkill = () => ({
    id_skill: 1,
    titulo: 'Diseño UI/UX Profesional con Figma',
    descripcion: 'Aprende a crear interfaces de usuario modernas y funcionales utilizando Figma. Este curso te enseñará desde los conceptos básicos hasta técnicas avanzadas de prototipado y diseño de sistemas.',
    categoria: 'Diseño',
    nivel: 'Intermedio',
    modalidad: 'Online',
    duracion_horas: 12,
    precio: 45000,
    rating: 4.8,
    total_resenas: 2,
    imagen_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
    es_activo: true,
    user: {
      id_usuario: 1,
      nombre: 'Sofia',
      apellido: 'Ruiz',
      avatar_url: 'https://ui-avatars.com/api/?name=Sofia+Ruiz&background=0d6efd&color=fff',
      rating: 4.8,
      total_intercambios: 13
    },
    creado_en: '2024-01-15'
  })

  const getDemoReviews = () => ([
    {
      id_resena: 1,
      puntuacion: 5,
      comentario: 'Excelente curso, muy completo y bien explicado. Aprendí muchísimo.',
      usuario: { nombre: 'Juan', apellido: 'Pérez', avatar_url: null },
      creado_en: '2024-01-20'
    },
    {
      id_resena: 2,
      puntuacion: 4,
      comentario: 'Muy bueno, aunque me hubiera gustado más práctica.',
      usuario: { nombre: 'María', apellido: 'González', avatar_url: null },
      creado_en: '2024-01-18'
    }
  ])

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i 
        key={index}
        className={`bi bi-star${index < rating ? '-fill' : ''} text-warning`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando detalles del skill...</p>
        </div>
      </div>
    )
  }

  if (!skill) {
    return (
      <Container className="py-5 text-center">
        <i className="bi bi-exclamation-triangle text-muted mb-3" style={{ fontSize: '4rem' }}></i>
        <h3 className="mb-3">Skill no encontrado</h3>
        <Button variant="primary" onClick={() => navigate('/explorar')}>
          Volver a Explorar
        </Button>
      </Container>
    )
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Hero Section con Imagen */}
      <div 
        className="position-relative"
        style={{
          height: '400px',
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%), url(${skill.imagen_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Back Button */}
        <Button 
          variant="light" 
          className="position-absolute top-0 start-0 m-3 rounded-circle shadow"
          style={{ width: '48px', height: '48px' }}
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left fs-5"></i>
        </Button>

        {/* Favorite Button */}
        <Button 
          variant="light" 
          className="position-absolute top-0 end-0 m-3 rounded-circle shadow"
          style={{ width: '48px', height: '48px' }}
          onClick={handleToggleFavorite}
        >
          <i className={`bi bi-heart${isFavorite ? '-fill text-danger' : ''} fs-5`}></i>
        </Button>

        {/* Title Overlay */}
        <div className="position-absolute bottom-0 start-0 w-100 p-4 text-white">
          <Container>
            <Badge bg="primary" className="mb-2">{skill.categoria}</Badge>
            <h1 className="fw-bold mb-2">{skill.titulo}</h1>
            <div className="d-flex align-items-center gap-3">
              {skill.rating && (
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-star-fill text-warning"></i>
                  <span className="fw-bold">{skill.rating.toFixed(1)}</span>
                  <span className="opacity-75">({skill.total_resenas} reseñas)</span>
                </div>
              )}
              <Badge bg="light" text="dark">{skill.nivel}</Badge>
              <Badge bg="light" text="dark">{skill.modalidad}</Badge>
            </div>
          </Container>
        </div>
      </div>

      <Container className="py-4">
        <Row>
          {/* Columna Principal */}
          <Col lg={8} className="mb-4">
            {/* Tabs de Información */}
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <Tabs defaultActiveKey="descripcion" className="mb-3">
                  {/* Descripción */}
                  <Tab eventKey="descripcion" title="Descripción">
                    <div className="py-2">
                      <h5 className="fw-bold mb-3">Acerca de este skill</h5>
                      <p className="text-muted" style={{ lineHeight: '1.7' }}>
                        {skill.descripcion}
                      </p>
                      
                      <hr className="my-4" />
                      
                      <h5 className="fw-bold mb-3">Lo que aprenderás</h5>
                      <Row>
                        <Col md={6}>
                          <ul className="list-unstyled">
                            <li className="mb-2">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              Fundamentos del diseño UI/UX
                            </li>
                            <li className="mb-2">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              Uso profesional de Figma
                            </li>
                            <li className="mb-2">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              Creación de prototipos interactivos
                            </li>
                          </ul>
                        </Col>
                        <Col md={6}>
                          <ul className="list-unstyled">
                            <li className="mb-2">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              Sistemas de diseño
                            </li>
                            <li className="mb-2">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              Mejores prácticas de UX
                            </li>
                            <li className="mb-2">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              Portfolio profesional
                            </li>
                          </ul>
                        </Col>
                      </Row>
                    </div>
                  </Tab>

                  {/* Instructor */}
                  <Tab eventKey="instructor" title="Instructor">
                    <div className="py-2">
                      <div className="d-flex align-items-center gap-3 mb-4">
                        <div 
                          className="rounded-circle"
                          style={{
                            width: '80px',
                            height: '80px',
                            backgroundImage: `url(${skill.user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(skill.user.nombre + ' ' + skill.user.apellido)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                        <div>
                          <h5 className="fw-bold mb-1">
                            {skill.user.nombre} {skill.user.apellido}
                          </h5>
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <i className="bi bi-star-fill text-warning"></i>
                            <span>{skill.user.rating?.toFixed(1)} rating</span>
                            <span>•</span>
                            <span>{skill.user.total_intercambios} intercambios</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted">
                        Profesional con más de 5 años de experiencia en diseño UI/UX para empresas 
                        tecnológicas. Apasionado por crear experiencias de usuario excepcionales.
                      </p>
                      <Button variant="outline-primary" size="sm">
                        Ver perfil completo
                      </Button>
                    </div>
                  </Tab>

                  {/* Reseñas */}
                  <Tab eventKey="resenas" title={`Reseñas (${reviews.length})`}>
                    <div className="py-2">
                      {/* Botón para agregar reseña */}
                      {user && !showReviewForm && (
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="mb-4"
                          onClick={() => setShowReviewForm(true)}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Escribir una reseña
                        </Button>
                      )}

                      {/* Formulario de nueva reseña */}
                      {showReviewForm && (
                        <Card className="bg-light border-0 mb-4">
                          <Card.Body>
                            <h6 className="fw-bold mb-3">Nueva Reseña</h6>
                            <Form onSubmit={handleSubmitReview}>
                              <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small">Calificación</Form.Label>
                                <div className="d-flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                      key={star}
                                      className={`bi bi-star${star <= newReview.puntuacion ? '-fill' : ''} text-warning fs-4`}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => setNewReview({...newReview, puntuacion: star})}
                                    />
                                  ))}
                                </div>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold small">Comentario</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  value={newReview.comentario}
                                  onChange={(e) => setNewReview({...newReview, comentario: e.target.value})}
                                  placeholder="Comparte tu experiencia..."
                                  required
                                />
                              </Form.Group>

                              <div className="d-flex gap-2">
                                <Button variant="primary" type="submit" size="sm">
                                  Publicar
                                </Button>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  onClick={() => setShowReviewForm(false)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </Form>
                          </Card.Body>
                        </Card>
                      )}

                      {/* Lista de reseñas */}
                      {reviews.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                          <i className="bi bi-chat-quote mb-2" style={{ fontSize: '2rem' }}></i>
                          <p>Aún no hay reseñas para este skill</p>
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {reviews.map((review) => (
                            <Card key={review.id_resena} className="border-0 shadow-sm">
                              <Card.Body>
                                <div className="d-flex align-items-start gap-3">
                                  <div 
                                    className="rounded-circle bg-secondary"
                                    style={{
                                      width: '48px',
                                      height: '48px',
                                      backgroundImage: review.usuario.avatar_url ? `url(${review.usuario.avatar_url})` : 'none',
                                      backgroundSize: 'cover'
                                    }}
                                  />
                                  <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <div>
                                        <h6 className="fw-bold mb-1">
                                          {review.usuario.nombre} {review.usuario.apellido}
                                        </h6>
                                        <div className="d-flex gap-1">
                                          {renderStars(review.puntuacion)}
                                        </div>
                                      </div>
                                      <small className="text-muted">
                                        {new Date(review.creado_en).toLocaleDateString('es-CL')}
                                      </small>
                                    </div>
                                    <p className="text-muted mb-0">{review.comentario}</p>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Card de Compra */}
            <Card className="border-0 shadow-sm sticky-top mb-4" style={{ top: '20px', borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="h3 text-primary fw-bold mb-2">
                    ${skill.precio?.toLocaleString('es-CL')} CLP
                  </h2>
                  <p className="text-muted small mb-0">{skill.duracion_horas} horas de contenido</p>
                </div>

                <div className="d-grid gap-2 mb-3">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="fw-bold shadow"
                    onClick={handleAddToCart}
                    disabled={isInCart}
                  >
                    {isInCart ? (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        En el carrito
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cart-plus me-2"></i>
                        Agregar al carrito
                      </>
                    )}
                  </Button>
                  
                  {isInCart && (
                    <Button 
                      variant="outline-primary"
                      onClick={() => navigate('/carrito')}
                    >
                      Ir al carrito
                    </Button>
                  )}
                </div>

                <hr />

                <h6 className="fw-bold mb-3">Este skill incluye:</h6>
                <ListGroup variant="flush" className="border-0">
                  <ListGroup.Item className="border-0 px-0 py-2 d-flex align-items-center gap-2">
                    <i className="bi bi-clock text-primary"></i>
                    <span className="small">{skill.duracion_horas} horas totales</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0 px-0 py-2 d-flex align-items-center gap-2">
                    <i className="bi bi-laptop text-primary"></i>
                    <span className="small">Modalidad {skill.modalidad}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="border-0 px-0 py-2 d-flex align-items-center gap-2">
                    <i className="bi bi-trophy text-primary"></i>
                    <span className="small">Certificado de finalización</span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

          </Col>
        </Row>

        {/* Skills Relacionados */}
        {relatedSkills.length > 0 && (
          <div className="mt-5">
            <h4 className="fw-bold mb-4">Skills Relacionados</h4>
            <Row className="g-4">
              {relatedSkills.map((relatedSkill) => (
                <Col key={relatedSkill.id_skill} xs={12} sm={6} lg={3}>
                  <SkillCard skill={relatedSkill} />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </div>
  )
}

export default DetalleSkill