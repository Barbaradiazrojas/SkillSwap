import { Spinner } from 'react-bootstrap'

function Loading({ 
  fullScreen = true, 
  message = 'Cargando...', 
  size = 'lg',
  variant = 'primary' 
}) {
  const content = (
    <div className="text-center py-5">
      <Spinner 
        animation="border" 
        variant={variant} 
        size={size}
        role="status"
        className="mb-3"
      />
      {message && (
        <p className="text-muted mb-0">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div 
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh' }}
      >
        {content}
      </div>
    )
  }

  return content
}

export default Loading