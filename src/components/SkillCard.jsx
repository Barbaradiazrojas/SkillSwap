import { useState } from 'react'
import { Card, Badge, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { favoritesAPI, cartAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function SkillCard({ skill, showActions = true }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(skill.es_favorito || false)
  const [isInCart, setIsInCart] = useState(skill.en_carrito || false)

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

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

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

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

  return (
    <Card 
      className="h-100 border-0 shadow-sm position-relative overflow-hidden"
      style={{ 
        borderRadius: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
      }}
      onClick={() => navigate(`/skill/${skill.id_skill}`)}
    >
      {/* Imagen */}
      <div className="position-relative" style={{ paddingTop: '66.67%' }}>
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${skill.imagen_url || 'https://via.placeholder.com/400x300'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Botón de Favorito */}
          {showActions && (
            <Button
              variant="light"
              size="sm"
              className="position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
              style={{ width: '36px', height: '36px', padding: 0 }}
              onClick={handleToggleFavorite}
            >
              <i className={`bi bi-heart${isFavorite ? '-fill text-danger' : ''}`}></i>
            </Button>
          )}

          {/* Badge de Rating */}
          {skill.rating && (
            <Badge 
              bg="dark" 
              className="position-absolute bottom-0 start-0 m-2 d-flex align-items-center gap-1"
              style={{ fontSize: '0.75rem', opacity: 0.9 }}
            >
              <i className="bi bi-star-fill text-warning"></i>
              {parseFloat(skill.rating || 0).toFixed(1)}
            </Badge>
          )}
        </div>
      </div>

      {/* Contenido */}
      <Card.Body className="p-3">
        {/* Categoría */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <Badge bg="light" text="dark" className="text-uppercase" style={{ fontSize: '0.65rem' }}>
            {skill.categoria}
          </Badge>
          {skill.nivel && (
            <Badge bg="info" text="dark" style={{ fontSize: '0.65rem' }}>
              {skill.nivel}
            </Badge>
          )}
        </div>

        {/* Título */}
        <Link 
          to={`/skill/${skill.id_skill}`}
          className="text-decoration-none text-dark"
        >
          <Card.Title 
            className="h6 mb-2"
            style={{ 
              fontSize: '0.95rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {skill.titulo}
          </Card.Title>
        </Link>

        {/* Instructor */}
        <p className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>
          <i className="bi bi-person me-1"></i>
          {skill.user?.nombre} {skill.user?.apellido}
        </p>

        {/* Duración y Modalidad */}
        {(skill.duracion_horas || skill.modalidad) && (
          <div className="d-flex gap-2 mb-3 text-muted" style={{ fontSize: '0.75rem' }}>
            {skill.duracion_horas && (
              <span>
                <i className="bi bi-clock me-1"></i>
                {skill.duracion_horas}h
              </span>
            )}
            {skill.modalidad && (
              <>
                <span>•</span>
                <span>
                  <i className={`bi bi-${skill.modalidad === 'Online' ? 'laptop' : skill.modalidad === 'Presencial' ? 'geo-alt' : 'diagram-3'} me-1`}></i>
                  {skill.modalidad}
                </span>
              </>
            )}
          </div>
        )}

        {/* Precio y Acción */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="text-primary fw-bold" style={{ fontSize: '1.1rem' }}>
              ${Math.round(skill.precio).toLocaleString('es-CL')}
            </span>
            <span className="text-muted small"> CLP</span>
          </div>
          
          {showActions && (
            <Button
              variant={isInCart ? 'success' : 'outline-primary'}
              size="sm"
              className="rounded-pill"
              onClick={handleAddToCart}
              disabled={isInCart}
            >
              <i className={`bi bi-${isInCart ? 'check' : 'cart-plus'}`}></i>
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  )
}

export default SkillCard