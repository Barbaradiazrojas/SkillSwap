import { useState, useEffect } from 'react'
import { Container, Row, Col, Form, Button, Card, Badge, InputGroup, Dropdown } from 'react-bootstrap'
import { skillsAPI, handleAPIError } from '../services/api'
import SkillCard from '../components/SkillCard'
import { CATEGORIES, LEVELS, MODALITIES } from '../utils/constants'
import { toast } from 'react-toastify'

function Explorar() {
  const [skills, setSkills] = useState([])
  const [filteredSkills, setFilteredSkills] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [selectedLevel, setSelectedLevel] = useState('Todos')
  const [selectedModality, setSelectedModality] = useState('Todas')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [sortBy, setSortBy] = useState('recientes')

  useEffect(() => {
    loadSkills()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, selectedCategory, selectedLevel, selectedModality, priceRange, sortBy, skills])

  const loadSkills = async () => {
    try {
      setLoading(true)
      const response = await skillsAPI.getAll()
      
      if (response.data.success) {
        setSkills(response.data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar skills:', error)
      const errorInfo = handleAPIError(error)
      toast.error(errorInfo.message)
      setSkills([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...skills]

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por categoría
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(skill => skill.categoria === selectedCategory)
    }

    // Filtro por nivel
    if (selectedLevel !== 'Todos') {
      filtered = filtered.filter(skill => skill.nivel === selectedLevel)
    }

    // Filtro por modalidad
    if (selectedModality !== 'Todas') {
      filtered = filtered.filter(skill => skill.modalidad === selectedModality)
    }

    // Filtro por rango de precio
    filtered = filtered.filter(skill => 
      skill.precio >= priceRange.min && skill.precio <= priceRange.max
    )

    // Ordenamiento
    switch (sortBy) {
      case 'precio-asc':
        filtered.sort((a, b) => a.precio - b.precio)
        break
      case 'precio-desc':
        filtered.sort((a, b) => b.precio - a.precio)
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'populares':
        filtered.sort((a, b) => (b.total_resenas || 0) - (a.total_resenas || 0))
        break
      default: // recientes
        filtered.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en))
    }

    setFilteredSkills(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('Todas')
    setSelectedLevel('Todos')
    setSelectedModality('Todas')
    setPriceRange({ min: 0, max: 100000 })
    setSortBy('recientes')
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <section className="bg-white border-bottom py-4">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h1 className="h3 fw-bold mb-0">Explorar Skills</h1>
              <p className="text-muted mb-0 small">
                {filteredSkills.length} {filteredSkills.length === 1 ? 'curso disponible' : 'cursos disponibles'}
              </p>
            </Col>
            <Col xs="auto">
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  <i className="bi bi-sort-down me-2"></i>
                  Ordenar
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => setSortBy('recientes')} active={sortBy === 'recientes'}>
                    Más recientes
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('populares')} active={sortBy === 'populares'}>
                    Más populares
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('rating')} active={sortBy === 'rating'}>
                    Mejor valorados
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('precio-asc')} active={sortBy === 'precio-asc'}>
                    Precio: Menor a Mayor
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('precio-desc')} active={sortBy === 'precio-desc'}>
                    Precio: Mayor a Menor
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-4">
        <Row>
          {/* Sidebar - Filtros */}
          <Col lg={3} className="mb-4">
            <Card className="border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Filtros</h5>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-decoration-none p-0"
                    onClick={clearFilters}
                  >
                    Limpiar
                  </Button>
                </div>

                {/* Búsqueda */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small">Buscar</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-white">
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="search"
                      placeholder="Buscar skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                {/* Categoría */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small">Categoría</Form.Label>
                  <Form.Select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="Todas">Todas las categorías</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Nivel */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small">Nivel</Form.Label>
                  <div className="d-flex flex-column gap-2">
                    <Form.Check
                      type="radio"
                      id="nivel-todos"
                      label="Todos"
                      checked={selectedLevel === 'Todos'}
                      onChange={() => setSelectedLevel('Todos')}
                    />
                    {LEVELS.map(level => (
                      <Form.Check
                        key={level}
                        type="radio"
                        id={`nivel-${level}`}
                        label={level}
                        checked={selectedLevel === level}
                        onChange={() => setSelectedLevel(level)}
                      />
                    ))}
                  </div>
                </Form.Group>

                {/* Modalidad */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small">Modalidad</Form.Label>
                  <div className="d-flex flex-column gap-2">
                    <Form.Check
                      type="radio"
                      id="modalidad-todas"
                      label="Todas"
                      checked={selectedModality === 'Todas'}
                      onChange={() => setSelectedModality('Todas')}
                    />
                    {MODALITIES.map(mod => (
                      <Form.Check
                        key={mod}
                        type="radio"
                        id={`modalidad-${mod}`}
                        label={mod}
                        checked={selectedModality === mod}
                        onChange={() => setSelectedModality(mod)}
                      />
                    ))}
                  </div>
                </Form.Group>

                {/* Rango de Precio */}
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Precio máximo: ${priceRange.max.toLocaleString('es-CL')}
                  </Form.Label>
                  <Form.Range
                    min="0"
                    max="100000"
                    step="5000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>$0</span>
                    <span>$100.000</span>
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content - Grid de Skills */}
          <Col lg={9}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted">Cargando skills...</p>
              </div>
            ) : filteredSkills.length === 0 ? (
              <Card className="border-0 shadow-sm text-center py-5">
                <Card.Body>
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
                  <h4 className="mt-3 mb-2">No se encontraron resultados</h4>
                  <p className="text-muted mb-3">
                    {skills.length === 0 
                      ? 'No hay skills disponibles en este momento'
                      : 'Intenta ajustar los filtros o busca algo diferente'
                    }
                  </p>
                  <Button variant="primary" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <>
                <Row className="g-4">
                  {filteredSkills.map((skill) => (
                    <Col key={skill.id_skill} xs={12} sm={6} xl={4}>
                      <SkillCard skill={skill} />
                    </Col>
                  ))}
                </Row>

                {/* Pagination / Load More */}
                {filteredSkills.length >= 12 && (
                  <div className="text-center mt-5">
                    <Button variant="outline-primary" size="lg">
                      Cargar más
                      <i className="bi bi-arrow-down ms-2"></i>
                    </Button>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Explorar