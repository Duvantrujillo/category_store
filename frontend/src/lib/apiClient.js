import axios from 'axios'
import toast from 'react-hot-toast'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Inyecta el token JWT en cada request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Maneja respuestas de error globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const { message, forceLogout } = error.response?.data ?? {}

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')

      if (message) {
        toast.error(message, { duration: 3000, id: 'auth-error' })
      }

      setTimeout(() => {
        window.location.href = '/login'
      }, forceLogout ? 1500 : 800)
    }

    if (status === 403) {
      toast.error(message ?? 'No tienes permiso para realizar esta acción.', {
        duration: 3000,
        id: 'permission-error',
      })
    }

    return Promise.reject(error)
  }
)

export default apiClient
