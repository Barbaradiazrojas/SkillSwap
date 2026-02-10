import { useState } from 'react'
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, handleAPIError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import useForm from '../hooks/useForm'
import { required, isEmail, minLength } from '../utils/validations'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [serverError, setServerError] = useState('')

  // Configurar validaciones para el formulario de login
  const loginValidations = () => ({
    email: [
      required('El email'),
      isEmail
    ],
    password: [
      required('La contraseña'),
      minLength(6, 'La contraseña')
    ]
  })

  // Usar el hook personalizado useForm
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(
    { email: '', password: '' },  // Valores iniciales
    loginValidations               // Reglas de validación
  )

  // Función que se ejecuta cuando el formulario es válido
  const onSubmit = async (formData) => {
    setServerError('')

    try {
      const response = await authAPI.login(formData)
      
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token)
        toast.success('¡Bienvenido de vuelta!')
        navigate('/')
      }
    } catch (error) {
      console.error('Error en login:', error)
      const errorInfo = handleAPIError(error)
      setServerError(errorInfo.message)
      toast.error(errorInfo.message)
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Iniciar Sesión</h2>
                  <p className="text-muted">Accede a tu cuenta de SkillSwap</p>
                </div>

                {serverError && (
                  <Alert variant="danger" dismissible onClose={() => setServerError('')}>
                    {serverError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="tu@email.com"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.email && !!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.password && !!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 mb-3"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Iniciando sesión...
                      </>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <span className="text-muted">¿No tienes cuenta? </span>
                  <Link to="/register" className="text-decoration-none fw-semibold">
                    Regístrate aquí
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login