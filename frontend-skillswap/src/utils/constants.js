export const URLBASE = import.meta.env.VITE_URL_BACKEND ?? 'https://backend-skillswap-jdba.onrender.com'
export const CATEGORIES = [
  'Programación',
  'Diseño',
  'Marketing',
  'Idiomas',
  'Música',
  'Negocios',
  'Fotografía',
  'Cocina'
]

export const LEVELS = [
  'Principiante',
  'Intermedio',
  'Avanzado'
]

export const MODALITIES = [
  'Online',
  'Presencial',
  'Híbrido'
]

export const ORDER_STATUS = {
  PENDING: 'pendiente',
  COMPLETED: 'completado',
  CANCELLED: 'cancelado'
}