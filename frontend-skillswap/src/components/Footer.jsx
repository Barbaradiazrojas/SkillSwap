import { Container, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white mt-auto py-4">
      <Container>
        {/* Logo y nombre */}
        <div className="text-center mb-3">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <div 
              className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '36px', height: '36px' }}
            >
              <i className="bi bi-arrow-left-right text-white"></i>
            </div>
            <h5 className="fw-bold mb-0">SkillSwap</h5>
          </div>
          <p className="text-white-50 small mb-0">
            Intercambio de conocimientos
          </p>
        </div>

        {/* Links rápidos */}
        <div className="text-center mb-3">
          <Link to="/explorar" className="text-white-50 text-decoration-none small mx-2">
            Explorar
          </Link>
          <span className="text-white-50">•</span>
          <Link to="/crear-skill" className="text-white-50 text-decoration-none small mx-2">
            Crear Skill
          </Link>
          <span className="text-white-50">•</span>
          <Link to="/contact" className="text-white-50 text-decoration-none small mx-2">
            Contacto
          </Link>
        </div>

        {/* Divider */}
        <hr className="border-secondary my-3" />

        {/* Copyright y hecho en Chile */}
        <Row className="align-items-center small">
          <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
            <p className="mb-0 text-white-50">
              © {currentYear} SkillSwap. Todos los derechos reservados.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0 text-white-50">
              Hecho con <i className="bi bi-heart-fill text-danger"></i> en Chile
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer