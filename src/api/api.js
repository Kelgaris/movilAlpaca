import axios from 'axios'

// Definimos base URL para consumir backend desde emulador Android.
const API_BASE = 'http://10.0.2.2:3000/api'

// Creamos cliente HTTP compartido para toda la app móvil.
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

export function setAuthToken(token) {
  // Configuramos cabecera Authorization para peticiones autenticadas.
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}

export async function login(email, password) {
  // Enviamos credenciales y devolvemos respuesta de login del backend.
  const res = await api.post('/auth/login', { email, password })
  return res.data
}

export async function register(data) {
  // Registramos usuario nuevo con los datos proporcionados por formulario.
  const res = await api.post('/auth/register', data)
  return res.data
}

export async function getActividades() {
  // Consultamos catálogo completo de actividades.
  const res = await api.get('/actividades')
  return res.data
}

export async function getActividad(id) {
  // Consultamos detalle de una actividad por id.
  const res = await api.get(`/actividades/${id}`)
  return res.data
}

export async function reservarActividad(id, usuarioId) {
  // Registramos una reserva de actividad para usuario concreto.
  const res = await api.post(`/actividades/${id}/reservar`, { usuarioId })
  return res.data
}

export async function cancelarReserva(id, usuarioId) {
  // Cancelamos una reserva activa para usuario concreto.
  const res = await api.post(`/actividades/${id}/cancelar`, { usuarioId })
  return res.data
}

export async function deleteActividad(id) {
  // Eliminamos actividad desde panel de administración.
  const res = await api.delete(`/actividades/${id}`)
  return res.data
}

export async function createActividad(data) {
  // Creamos actividad nueva desde panel de administración.
  const res = await api.post('/actividades', data)
  return res.data
}

export async function updateActividad(id, data) {
  // Actualizamos actividad existente desde panel de administración.
  const res = await api.put(`/actividades/${id}`, data)
  return res.data
}

export default api
