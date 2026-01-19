import { useState } from 'react'
import { Container, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido'
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password
      })

      if (response.data.success) {
        const { token, user } = response.data.data
        login(user, token)
        toast.success('¡Registro exitoso! Bienvenido a SkillSwap')
        navigate('/')
      }
    } catch (error) {
      console.error('Error al registrarse:', error)
      const errorMessage = error.response?.data?.message || 'Error al registrarse. Intenta nuevamente.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <Container>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-6">
            {/* Back Button - Solo móvil */}
            <div className="d-md-none mb-3">
              <Button 
                variant="link" 
                className="text-dark p-0" 
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left fs-4"></i>
              </Button>
            </div>

            <Card className="border-0 shadow-lg" style={{ borderRadius: '24px' }}>
              <Card.Body className="p-4 p-md-5">
                {/* Header */}
                <div className="text-center text-md-start mb-4">
                  <h1 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>
                    Crear cuenta
                  </h1>
                  <p className="text-muted fs-6">
                    Únete a la comunidad de intercambio de habilidades.
                  </p>
                </div>

                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Nombre Completo - 2 columnas en desktop */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-6">
                      <Form.Group>
                        <Form.Label className="fw-semibold">Nombre</Form.Label>
                        <Form.Control
                          type="text"
                          name="nombre"
                          placeholder="Tu nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          isInvalid={!!errors.nombre}
                          className="py-3 rounded-3"
                          style={{ fontSize: '1rem' }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.nombre}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>

                    <div className="col-12 col-md-6">
                      <Form.Group>
                        <Form.Label className="fw-semibold">Apellido</Form.Label>
                        <Form.Control
                          type="text"
                          name="apellido"
                          placeholder="Tu apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                          isInvalid={!!errors.apellido}
                          className="py-3 rounded-3"
                          style={{ fontSize: '1rem' }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.apellido}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </div>
                  </div>

                  {/* Email */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Correo Electrónico</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="ejemplo@correo.com"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                      className="py-3 rounded-3"
                      style={{ fontSize: '1rem' }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Contraseña */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Crea una contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        isInvalid={!!errors.password}
                        className="py-3 rounded-3 border-end-0"
                        style={{ fontSize: '1rem' }}
                      />
                      <InputGroup.Text 
                        className="bg-white border-start-0 rounded-3 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Confirmar Contraseña */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Confirmar Contraseña</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!errors.confirmPassword}
                        className="py-3 rounded-3 border-end-0"
                        style={{ fontSize: '1rem' }}
                      />
                      <InputGroup.Text 
                        className="bg-white border-start-0 rounded-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                      </InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Términos y Condiciones */}
                  <p className="text-center text-muted small mb-4">
                    Al registrarte, aceptas nuestros{' '}
                    <Link to="/terminos" className="text-primary fw-semibold text-decoration-none">
                      Términos de Servicio
                    </Link>{' '}
                    y{' '}
                    <Link to="/privacidad" className="text-primary fw-semibold text-decoration-none">
                      Política de Privacidad
                    </Link>
                    .
                  </p>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 py-3 fw-bold rounded-3 shadow-sm"
                    disabled={loading}
                    style={{ fontSize: '1.1rem' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registrando...
                      </>
                    ) : (
                      <>
                        Registrarse
                        <i className="bi bi-arrow-right ms-2"></i>
                      </>
                    )}
                  </Button>
                </Form>

                {/* Footer Link */}
                <div className="text-center mt-4">
                  <p className="mb-0">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Back to Home - Solo desktop */}
            <div className="text-center mt-4 d-none d-md-block">
              <Link to="/" className="text-muted text-decoration-none">
                <i className="bi bi-arrow-left me-2"></i>
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Register