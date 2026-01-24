import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, ListGroup, Modal, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { usersAPI, skillsAPI } from '../services/api'

function MiPerfil() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const [userStats, setUserStats] = useState({
    total_intercambios: 0,
    total_skills: 0,
    total_logros: 0
  })
  const [mySkills, setMySkills] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || ''
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      // Cargar datos del usuario
      const userResponse = await usersAPI.getMe()
      if (userResponse.data.success) {
        const userData = userResponse.data.data
        setUserStats({
          total_intercambios: userData.total_intercambios || 0,
          total_skills: userData.total_skills || 0,
          total_logros: userData.total_logros || 0
        })
      }

      // Cargar skills del usuario
      const skillsResponse = await skillsAPI.getMySkills()
      if (skillsResponse.data.success) {
        setMySkills(skillsResponse.data.data || [])
      }

    } catch (error) {
      console.error('Error al cargar perfil:', error)
      // Datos de ejemplo
      setUserStats({ total_intercambios: 3, total_skills: 15, total_logros: 8 })
      setMySkills(getDemoSkills())
      setRecentActivity(getDemoActivity())
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      logout()
      toast.success('Sesión cerrada exitosamente')
      navigate('/login')
    }
  }

  const handleEditProfile = async (e) => {
    e.preventDefault()
    
    try {
      const response = await usersAPI.updateMe(editFormData)
      
      if (response.data.success) {
        toast.success('Perfil actualizado exitosamente')
        setShowEditModal(false)
        loadProfileData()
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast.error('Error al actualizar el perfil')
    }
  }

  const getDemoSkills = () => {
    return [
      { id_skill: 1, titulo: 'React Avanzado', categoria: 'Programación', es_activo: true },
      { id_skill: 2, titulo: 'Diseño UI/UX', categoria: 'Diseño', es_activo: true },
      { id_skill: 3, titulo: 'Marketing Digital', categoria: 'Marketing', es_activo: false }
    ]
  }

  const getDemoActivity = () => {
    return [
      {
        id: 1,
        tipo: 'intercambio',
        titulo: 'Intercambio de Python',
        descripcion: 'Completado con Marcos',
        fecha: 'Hace 2 días',
        icono: 'code'
      },
      {
        id: 2,
        tipo: 'enseñanza',
        titulo: 'Sesión de Prototipado',
        descripcion: 'Enseñaste a Elena',
        fecha: 'Hace 4 días',
        icono: 'brush'
      },
      {
        id: 3,
        tipo: 'aprendizaje',
        titulo: 'Práctica de Inglés B2',
        descripcion: 'Intercambio con David',
        fecha: 'Hace 1 semana',
        icono: 'translate'
      }
    ]
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Header */}
      <section className="bg-white border-bottom">
        <Container className="py-3">
          <Row className="align-items-center">
            <Col xs="auto">
              <Button 
                variant="link" 
                className="text-dark p-2 rounded-circle" 
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left fs-5"></i>
              </Button>
            </Col>
            <Col className="text-center">
              <h1 className="h5 fw-bold mb-0">Mi Perfil</h1>
            </Col>
            <Col xs="auto">
              <Button 
                variant="link" 
                className="text-dark p-2 rounded-circle"
                onClick={() => navigate('/configuracion')}
              >
                <i className="bi bi-gear fs-5"></i>
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando perfil...</p>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '20px' }}>
              <Card.Body className="text-center p-4">
                {/* Avatar */}
                <div className="position-relative d-inline-block mb-3">
                  <div 
                    className="rounded-circle border border-4 border-primary shadow-lg mx-auto"
                    style={{
                      width: '120px',
                      height: '120px',
                      backgroundImage: user?.avatar_url 
                        ? `url(${user.avatar_url})` 
                        : 'url(https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'Usuario') + '&size=120&background=0d6efd&color=fff)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  {user?.is_verified && (
                    <div 
                      className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1 border border-3 border-white"
                      style={{ width: '36px', height: '36px' }}
                    >
                      <i className="bi bi-patch-check-fill text-white fs-5"></i>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <h2 className="h4 fw-bold mb-1">{user?.name || 'Usuario'}</h2>
                <p className="text-muted mb-2">{user?.email}</p>
                
                {/* Rating */}
                {user?.rating && (
                  <div className="d-flex align-items-center justify-content-center gap-1 mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <span className="fw-bold">{user.rating.toFixed(1)}</span>
                    <span className="text-muted">({user.total_exchanges || 0} reseñas)</span>
                  </div>
                )}

                {/* Action Buttons */}
                <Row className="g-2 mt-3">
                  <Col xs={12} sm={6}>
                    <Button 
                      variant="primary" 
                      className="w-100 py-2 fw-semibold shadow"
                      style={{ borderRadius: '12px' }}
                      onClick={() => setShowEditModal(true)}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Editar Perfil
                    </Button>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Button 
                      variant="outline-secondary" 
                      className="w-100 py-2 fw-semibold"
                      style={{ borderRadius: '12px' }}
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Statistics */}
            <Row className="g-3 mb-4">
              <Col xs={4}>
                <Card className="border-0 shadow-sm text-center h-100" style={{ borderRadius: '16px' }}>
                  <Card.Body className="p-3">
                    <h3 className="h3 fw-bold text-primary mb-1">{userStats.total_intercambios}</h3>
                    <p className="text-muted small text-uppercase fw-semibold mb-0" style={{ fontSize: '0.7rem' }}>
                      Intercambios
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={4}>
                <Card className="border-0 shadow-sm text-center h-100" style={{ borderRadius: '16px' }}>
                  <Card.Body className="p-3">
                    <h3 className="h3 fw-bold text-primary mb-1">{userStats.total_skills}</h3>
                    <p className="text-muted small text-uppercase fw-semibold mb-0" style={{ fontSize: '0.7rem' }}>
                      Habilidades
                    </p>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={4}>
                <Card className="border-0 shadow-sm text-center h-100" style={{ borderRadius: '16px' }}>
                  <Card.Body className="p-3">
                    <h3 className="h3 fw-bold text-primary mb-1">{userStats.total_logros}</h3>
                    <p className="text-muted small text-uppercase fw-semibold mb-0" style={{ fontSize: '0.7rem' }}>
                      Logros
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* My Skills */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h5 fw-bold mb-0">Mis Habilidades</h3>
                <Button 
                  variant="link" 
                  className="text-primary text-decoration-none fw-semibold p-0"
                  onClick={() => navigate('/crear-skill')}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Agregar
                </Button>
              </div>

              {mySkills.length === 0 ? (
                <Card className="border-0 shadow-sm text-center py-4" style={{ borderRadius: '16px' }}>
                  <Card.Body>
                    <i className="bi bi-lightbulb text-muted mb-2" style={{ fontSize: '2.5rem' }}></i>
                    <p className="text-muted mb-3">Aún no has publicado skills</p>
                    <Button variant="primary" onClick={() => navigate('/crear-skill')}>
                      Publicar mi primer skill
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <ListGroup variant="flush">
                  {mySkills.slice(0, 3).map((skill) => (
                    <ListGroup.Item 
                      key={skill.id_skill}
                      className="border-0 bg-white shadow-sm mb-2 p-3"
                      style={{ borderRadius: '12px', cursor: 'pointer' }}
                      onClick={() => navigate(`/skill/${skill.id_skill}`)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '48px', height: '48px' }}
                          >
                            <i className="bi bi-lightbulb fs-5"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">{skill.titulo}</h6>
                            <div className="d-flex gap-2 align-items-center">
                              <Badge bg="light" text="dark" className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                                {skill.categoria}
                              </Badge>
                              <Badge bg={skill.es_activo ? 'success' : 'secondary'} style={{ fontSize: '0.7rem' }}>
                                {skill.es_activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <i className="bi bi-chevron-right text-muted"></i>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h5 fw-bold mb-0">Actividad Reciente</h3>
                <Button variant="link" className="text-primary text-decoration-none fw-semibold p-0 small">
                  Ver todo
                </Button>
              </div>

              <ListGroup variant="flush">
                {getDemoActivity().map((activity) => (
                  <ListGroup.Item 
                    key={activity.id}
                    className="border-0 bg-white shadow-sm mb-2 p-3"
                    style={{ borderRadius: '12px' }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <div 
                          className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '48px', height: '48px' }}
                        >
                          <i className={`bi bi-${activity.icono === 'code' ? 'code-slash' : activity.icono === 'brush' ? 'brush' : 'translate'} fs-5`}></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">{activity.titulo}</h6>
                          <p className="text-muted small mb-0">
                            {activity.descripcion} • {activity.fecha}
                          </p>
                        </div>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </>
        )}
      </Container>

      {/* Modal Editar Perfil */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Editar Perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditProfile}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Nombre</Form.Label>
              <Form.Control
                type="text"
                value={editFormData.nombre}
                onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Apellido</Form.Label>
              <Form.Control
                type="text"
                value={editFormData.apellido}
                onChange={(e) => setEditFormData({...editFormData, apellido: e.target.value})}
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Email</Form.Label>
              <Form.Control
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                className="py-2"
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" size="lg">
                Guardar Cambios
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default MiPerfil