import { useState } from 'react'
import { Container, Form, Button, Card, Row, Col, InputGroup } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { skillsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, LEVELS, MODALITIES } from '../utils/constants'

function CrearSkill() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    nivel: 'Principiante',
    modalidad: 'Online',
    duracion_horas: '',
    precio: '',
    imagen_url: ''
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen válido')
        return
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }

      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
        setFormData(prev => ({
          ...prev,
          imagen_url: reader.result // En producción, subirías a un servidor
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido'
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    } else if (formData.descripcion.length < 20) {
      newErrors.descripcion = 'La descripción debe tener al menos 20 caracteres'
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría'
    }

    if (!formData.duracion_horas || formData.duracion_horas <= 0) {
      newErrors.duracion_horas = 'La duración debe ser mayor a 0'
    }

    if (!formData.precio || formData.precio < 0) {
      newErrors.precio = 'El precio debe ser mayor o igual a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor completa todos los campos correctamente')
      return
    }

    setLoading(true)

    try {
      const skillData = {
        ...formData,
        duracion_horas: parseInt(formData.duracion_horas),
        precio: parseFloat(formData.precio),
        imagen_url: formData.imagen_url || 'https://via.placeholder.com/400x300'
      }

      const response = await skillsAPI.create(skillData)

      if (response.data.success) {
        toast.success('¡Skill publicado exitosamente!')
        navigate('/perfil')
      }
    } catch (error) {
      console.error('Error al crear skill:', error)
      const errorMessage = error.response?.data?.message || 'Error al publicar el skill. Intenta nuevamente.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            {/* Header */}
            <div className="mb-4">
              <Button 
                variant="link" 
                className="text-dark p-0 mb-3" 
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left fs-5 me-2"></i>
                Volver
              </Button>
              <h1 className="fw-bold mb-2">Detalles de tu Skill</h1>
              <p className="text-muted">
                Comparte tu talento con la comunidad de SkillSwap.
              </p>
            </div>

            <Card className="border-0 shadow-sm" style={{ borderRadius: '20px' }}>
              <Card.Body className="p-4 p-md-5">
                <Form onSubmit={handleSubmit}>
                  {/* Título */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Título de tu Skill</Form.Label>
                    <Form.Control
                      type="text"
                      name="titulo"
                      placeholder="Ej: Clases de Guitarra Clásica"
                      value={formData.titulo}
                      onChange={handleChange}
                      isInvalid={!!errors.titulo}
                      className="py-3 rounded-pill"
                      style={{ fontSize: '1rem' }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.titulo}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Categoría y Nivel */}
                  <Row className="mb-4">
                    <Col md={6} className="mb-3 mb-md-0">
                      <Form.Group>
                        <Form.Label className="fw-semibold">Categoría</Form.Label>
                        <Form.Select
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleChange}
                          isInvalid={!!errors.categoria}
                          className="py-3 rounded-pill"
                        >
                          <option value="">Selecciona una categoría</option>
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.categoria}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Nivel</Form.Label>
                        <Form.Select
                          name="nivel"
                          value={formData.nivel}
                          onChange={handleChange}
                          className="py-3 rounded-pill"
                        >
                          {LEVELS.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Precio y Duración */}
                  <Row className="mb-4">
                    <Col md={6} className="mb-3 mb-md-0">
                      <Form.Group>
                        <Form.Label className="fw-semibold">Precio (CLP)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-white rounded-start-pill">
                            <i className="bi bi-currency-dollar"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="precio"
                            placeholder="0"
                            value={formData.precio}
                            onChange={handleChange}
                            isInvalid={!!errors.precio}
                            className="py-3 border-start-0"
                            style={{ borderRadius: '0 50rem 50rem 0' }}
                            min="0"
                            step="1000"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.precio}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold">Duración (horas)</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-white rounded-start-pill">
                            <i className="bi bi-clock"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="duracion_horas"
                            placeholder="0"
                            value={formData.duracion_horas}
                            onChange={handleChange}
                            isInvalid={!!errors.duracion_horas}
                            className="py-3 border-start-0"
                            style={{ borderRadius: '0 50rem 50rem 0' }}
                            min="1"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.duracion_horas}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Modalidad */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Modalidad</Form.Label>
                    <div className="d-flex gap-3">
                      {MODALITIES.map(mod => (
                        <Button
                          key={mod}
                          variant={formData.modalidad === mod ? 'primary' : 'outline-secondary'}
                          className="flex-fill py-3 rounded-pill"
                          onClick={() => setFormData(prev => ({ ...prev, modalidad: mod }))}
                          type="button"
                        >
                          <i className={`bi bi-${mod === 'Online' ? 'laptop' : mod === 'Presencial' ? 'geo-alt' : 'diagram-3'} me-2`}></i>
                          {mod}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>

                  {/* Descripción */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Descripción</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="descripcion"
                      placeholder="Cuéntanos más sobre lo que ofreces..."
                      value={formData.descripcion}
                      onChange={handleChange}
                      isInvalid={!!errors.descripcion}
                      className="p-3"
                      style={{ borderRadius: '20px', resize: 'none' }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.descripcion}
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      {formData.descripcion.length} caracteres (mínimo 20)
                    </Form.Text>
                  </Form.Group>

                  {/* Imagen de Portada */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Imagen de Portada</Form.Label>
                    <div className="position-relative">
                      {imagePreview ? (
                        <div className="position-relative" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-100"
                            style={{ 
                              height: '300px', 
                              objectFit: 'cover'
                            }}
                          />
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="position-absolute top-0 end-0 m-3 rounded-circle"
                            onClick={() => {
                              setImagePreview(null)
                              setFormData(prev => ({ ...prev, imagen_url: '' }))
                            }}
                            style={{ width: '40px', height: '40px' }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      ) : (
                        <label 
                          className="w-100 d-flex flex-column align-items-center justify-content-center bg-light border-2 border-dashed rounded-4 cursor-pointer"
                          style={{ 
                            height: '200px',
                            borderColor: '#dee2e6',
                            cursor: 'pointer'
                          }}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <i className="bi bi-camera text-muted" style={{ fontSize: '3rem' }}></i>
                          <p className="text-muted mt-3 mb-0">
                            Haz clic o arrastra una imagen aquí
                          </p>
                          <small className="text-muted">JPG, PNG o GIF (máx 5MB)</small>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="d-none"
                          />
                        </label>
                      )}
                    </div>
                  </Form.Group>

                  {/* Botón Submit */}
                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="py-3 fw-bold rounded-pill shadow"
                      disabled={loading}
                      style={{ fontSize: '1.1rem' }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Publicando...
                        </>
                      ) : (
                        <>
                          Publicar Skill
                          <i className="bi bi-send ms-2"></i>
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 bg-primary bg-opacity-10 mt-4" style={{ borderRadius: '20px' }}>
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-lightbulb text-primary me-2"></i>
                  Consejos para tu publicación
                </h6>
                <ul className="small text-muted mb-0 ps-3">
                  <li className="mb-2">Usa un título claro y descriptivo</li>
                  <li className="mb-2">Describe detalladamente qué aprenderán los estudiantes</li>
                  <li className="mb-2">Sube una imagen atractiva y profesional</li>
                  <li className="mb-0">Define un precio justo según tu experiencia</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default CrearSkill