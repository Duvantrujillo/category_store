import { useState, useEffect } from 'react'
import { getRolesWithPermissions, updateRolePermissions } from '../api/permissionApi'
import { toast } from 'react-toastify'

export function useRolesWithPermissions({ skip = false } = {}) {
  const [data, setData]       = useState({ roles: [], permissions: [] })
  const [loading, setLoading] = useState(!skip)

  const fetch = async () => {
    if (skip) return
    try {
      setLoading(true)
      const res = await getRolesWithPermissions()
      setData(res)
    } catch {
      toast.error('Error al cargar permisos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [skip]) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...data, loading, refetch: fetch }
}

export function useUpdateRolePermissions() {
  const [saving, setSaving] = useState(false)

  const save = async (roleId, permissionIds) => {
    try {
      setSaving(true)
      await updateRolePermissions(roleId, permissionIds)
      toast.success('Permisos guardados correctamente')
      return true
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar permisos')
      return false
    } finally {
      setSaving(false)
    }
  }

  return { save, saving }
}
