import { useState } from 'react'
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI, handleAPIError } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import useForm from '../hooks/useForm'
import { required, isEmail, minLength, maxLength, matchField } from '../utils/validations'

function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState('')

  // Configurar validaciones (nota: matchField necesita acceso a values)
  const registerValidations = () => ({
    nombre: [
      required('El nombre'),
      minLength(2, 'El nombre'),
      maxLength(50, 'El nombre')
    ],
    email: [
      required('El email'),
      isEmail
    ],
    password: [
      required('La contraseña'),
      minLength(6, 'La contraseña')
    ],
    confirmar_password: [
      required('Confirmar contraseña'),
      matchField('password', 'Las contraseñas')
    ]
  })

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(
    { nombre: '', email: '', password: '', confirmar_password: '' },
    registerValidations
  )

  const onSubmit = async (formData) => {
    setServerError('')

    try {
      // No enviar confirmar_password al backend
      const { confirmar_password, ...dataToSend } = formData
      
      const response = await authAPI.register(dataToSend)
      
      if (response.data.success) {
        registerUser(response.data.data.user, response.data.data.token)
        toast.success('¡Cuenta creada exitosamente!')
        navigate('/')
      }
    } catch (error) {
      console.error('Error en registro:', error)
      const errorInfo = handleAPIError(error)
      setServerError(errorInfo.message)
      toast.error(errorInfo.message)
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-sm border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Crear Cuenta</h2>
                  <p className="text-muted">Únete a SkillSwap</p>
                </div>

                {serverError && (
                  <Alert variant="danger" dismissible onClose={() => setServerError('')}>
                    {serverError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre completo</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      placeholder="Tu nombre"
                      value={values.nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.nombre && !!errors.nombre}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.nombre}
                    </Form.Control.Feedback>
                  </Form.Group>

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

                  <Form.Group className="mb-3">
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

                  <Form.Group className="mb-4">
                    <Form.Label>Confirmar contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmar_password"
                      placeholder="••••••••"
                      value={values.confirmar_password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.confirmar_password && !!errors.confirmar_password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmar_password}
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
                        Creando cuenta...
                      </>
                    ) : (
                      'Crear Cuenta'
                    )}
                  </Button>
                </Form>

                <div className="text-center">
                  <span className="text-muted">¿Ya tienes cuenta? </span>
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Inicia sesión aquí
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

export default Register