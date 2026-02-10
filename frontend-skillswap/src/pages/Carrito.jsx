import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { cartAPI, handleAPIError } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Carrito() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  const COMMISSION_RATE = 0.05 // 5% de comisión

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      setLoading(true)
      const response = await cartAPI.getMyCart()
      
      if (response.data.success) {
        setCartItems(response.data.data?.items || [])
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error)
      const errorInfo = handleAPIError(error)
      toast.error(errorInfo.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId, skillTitle) => {
    const result = await Swal.fire({
      title: '¿Eliminar del carrito?',
      text: `¿Estás seguro de eliminar "${skillTitle}" del carrito?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await cartAPI.removeItem(itemId)
        setCartItems(prev => prev.filter(item => item.id_item !== itemId))
        toast.success('Eliminado del carrito')
      } catch (error) {
        console.error('Error al eliminar item:', error)
        const errorInfo = handleAPIError(error)
        toast.error(errorInfo.message)
      }
    }
  }

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: '¿Vaciar carrito?',
      text: '¿Estás seguro de eliminar todos los items del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      try {
        await cartAPI.clearCart()
        setCartItems([])
        toast.success('Carrito vaciado')
      } catch (error) {
        console.error('Error al vaciar carrito:', error)
        const errorInfo = handleAPIError(error)
        toast.error(errorInfo.message)
      }
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => 
      total + (parseFloat(item.precio_unitario) * item.cantidad), 0
    )
  }

  const calculateCommission = () => {
    return calculateSubtotal() * COMMISSION_RATE
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateCommission()
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning('Tu carrito está vacío')
      return
    }
    
    // Aquí integrarías con tu sistema de pagos
    toast.info('Funcionalidad de pago en desarrollo')
    // navigate('/checkout')
  }

  return (
    <div className="bg-light min-vh-100" style={{ paddingBottom: '200px' }}>
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
                <i className="bi bi-chevron-left fs-4"></i>
              </Button>
            </Col>
            <Col>
              <h1 className="h4 fw-bold mb-0">Mi Carrito</h1>
            </Col>
            <Col xs="auto">
              <Badge bg="primary" className="rounded-pill px-3 py-2">
                {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
              </Badge>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-4">
        {/* Título de sección */}
        <div className="mb-3">
          <h3 className="h5 fw-bold">Habilidades seleccionadas</h3>
          <p className="text-muted small mb-0">Revisa tus mentorías antes de pagar</p>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando tu carrito...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <Card.Body>
              <i className="bi bi-cart-x text-muted mb-3" style={{ fontSize: '4rem' }}></i>
              <h4 className="mb-2">Tu carrito está vacío</h4>
              <p className="text-muted mb-4">
                Agrega skills para comenzar tu aprendizaje
              </p>
              <Link to="/explorar">
                <Button variant="primary" size="lg">
                  Explorar Skills
                </Button>
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <>
            {/* Lista de items */}
            <div className="mb-3">
              {cartItems.map((item) => (
                <Card 
                  key={item.id_item} 
                  className="mb-3 border-0 shadow-sm"
                  style={{ borderRadius: '16px' }}
                >
                  <Card.Body className="p-3">
                    <Row className="g-3 align-items-center">
                      {/* Imagen */}
                      <Col xs={3} sm={2}>
                        <div 
                          className="rounded"
                          style={{
                            paddingTop: '100%',
                            backgroundImage: `url(${item.imagen_url || 'https://via.placeholder.com/150'})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      </Col>

                      {/* Información */}
                      <Col xs={7} sm={8}>
                        <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>
                          {item.titulo}
                        </h6>
                        <p className="text-primary fw-bold mb-1" style={{ fontSize: '0.9rem' }}>
                          ${Math.round(item.precio_unitario).toLocaleString('es-CL')} CLP
                        </p>
                        <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-person me-1"></i>
                          {item.nombre_usuario}
                          {item.duracion_horas && (
                            <>
                              {' • '}
                              <i className="bi bi-clock me-1"></i>
                              {item.duracion_horas} hrs
                            </>
                          )}
                        </p>
                      </Col>

                      {/* Botón eliminar */}
                      <Col xs={2} className="text-end">
                        <Button
                          variant="link"
                          className="text-muted p-0"
                          onClick={() => handleRemoveItem(item.id_item, item.titulo)}
                          style={{ fontSize: '1.3rem' }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>

            {/* Botón agregar más */}
            <Link to="/explorar" className="text-decoration-none">
              <Card 
                className="border-2 border-dashed text-center py-4 hover-shadow"
                style={{ 
                  borderColor: '#dee2e6',
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}
              >
                <Card.Body className="p-2">
                  <i className="bi bi-plus-circle text-primary fs-3"></i>
                  <p className="text-muted mb-0 mt-2 fw-semibold">
                    Agregar más habilidades
                  </p>
                </Card.Body>
              </Card>
            </Link>

            {/* Botón vaciar carrito */}
            {cartItems.length > 0 && (
              <div className="text-center mt-3">
                <Button 
                  variant="link" 
                  className="text-danger text-decoration-none"
                  onClick={handleClearCart}
                >
                  <i className="bi bi-trash me-2"></i>
                  Vaciar carrito
                </Button>
              </div>
            )}
          </>
        )}
      </Container>

      {/* Resumen sticky inferior */}
      {!loading && cartItems.length > 0 && (
        <div 
          className="fixed-bottom bg-white border-top shadow-lg"
          style={{ 
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Container className="py-3">
            {/* Resumen de precios */}
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Subtotal</span>
                <span className="fw-semibold">${Math.round(calculateSubtotal()).toLocaleString('es-CL')} CLP</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">
                  Comisión de servicio ({(COMMISSION_RATE * 100).toFixed(0)}%)
                </span>
                <span className="fw-semibold">${Math.round(calculateCommission()).toLocaleString('es-CL')} CLP</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="h5 fw-bold mb-0">Total</span>
                <span className="h4 text-primary fw-bold mb-0">
                  ${Math.round(calculateTotal()).toLocaleString('es-CL')} CLP
                </span>
              </div>
            </div>

            {/* Botón de pago */}
            <Button
              variant="primary"
              size="lg"
              className="w-100 py-3 fw-bold shadow"
              style={{ borderRadius: '12px' }}
              onClick={handleCheckout}
            >
              Proceder al Pago
              <i className="bi bi-credit-card ms-2"></i>
            </Button>
          </Container>
        </div>
      )}
    </div>
  )
}

export default Carrito