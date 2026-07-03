import { createContext, useContext, useEffect, useState } from 'react'
import apiClient from '@/lib/apiClient'

const PermissionContext = createContext({ permissions: [], role: null })

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export function PermissionProvider({ children }) {
  const stored = getStoredUser()
  const [permissions, setPermissions] = useState(stored?.permissions ?? [])
  const [role, setRole]               = useState(stored?.role ?? null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    // silentAuth: esto es una sincronización en segundo plano, no una acción
    // que el usuario haya pedido — si el token quedó vencido no debe sacarlo
    // de la página en la que esté (incluida la tienda pública).
    apiClient.get('/user/me', { silentAuth: true }).then(({ data }) => {
      setPermissions(data.permissions)
      setRole(data.role)
      // Mantener localStorage sincronizado
      const prev = getStoredUser()
      localStorage.setItem('user', JSON.stringify({ ...prev, ...data }))
    }).catch(() => {
      // Si falla (401 ya limpió el token viejo en apiClient), seguimos con
      // los datos que había en localStorage o sin permisos.
    })
  }, [])

  return (
    <PermissionContext.Provider value={{ permissions, role }}>
      {children}
    </PermissionContext.Provider>
  )
}

export function useHasPermission(permName) {
  const { permissions, role } = useContext(PermissionContext)
  if (role === 'super_admin') return true
  return Array.isArray(permissions) && permissions.includes(permName)
}
