import axios from 'axios'
import { toast } from 'react-toastify'

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
        toast.error(message, { autoClose: 3000, toastId: 'auth-error' })
      }

      setTimeout(() => {
        window.location.href = '/login'
      }, forceLogout ? 1500 : 800)
    }

    if (status === 403) {
      const isViewPermission = typeof message === 'string' && message.includes('.view')
      if (!isViewPermission) {
        toast.error(message ?? 'No tienes permiso para realizar esta acción.', {
          autoClose: 3000,
          toastId: 'permission-error',
        })
      }
      error._handled = true
    }

    return Promise.reject(error)
  }
)

export default apiClient
