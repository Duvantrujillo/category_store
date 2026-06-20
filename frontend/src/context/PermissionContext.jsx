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

    apiClient.get('/user/me').then(({ data }) => {
      setPermissions(data.permissions)
      setRole(data.role)
      // Mantener localStorage sincronizado
      const prev = getStoredUser()
      localStorage.setItem('user', JSON.stringify({ ...prev, ...data }))
    }).catch(() => {
      // Si falla (401 lo maneja apiClient), seguimos con los datos del localStorage
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
