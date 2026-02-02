import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div 
      className="min-vh-100 d-flex align-items-center"
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="border-0 shadow" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-5 text-center">
                {/* Número 404 */}
                <h1 
                  className="display-1 fw-bold mb-4"
                  style={{ 
                    fontSize: 'clamp(4rem, 15vw, 8rem)',
                    background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1
                  }}
                >
                  404
                </h1>

                {/* Mensaje */}
                <h2 className="h3 fw-bold mb-3">
                  ¡Oops! Página no encontrada
                </h2>
                
                <p className="text-muted mb-4">
                  La página que buscas no existe o ha sido movida.
                </p>

                {/* Botones */}
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <Link to="/" className="text-decoration-none">
                    <Button 
                      variant="primary"
                      className="px-4"
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="bi bi-house me-2"></i>
                      Ir al inicio
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline-secondary"
                    onClick={() => navigate(-1)}
                    className="px-4"
                    style={{ borderRadius: '8px' }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Volver atrás
                  </Button>
                </div>

                
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default NotFound