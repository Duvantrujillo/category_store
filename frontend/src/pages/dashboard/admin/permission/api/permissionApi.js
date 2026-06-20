import apiClient from '@/lib/apiClient'

export const getRolesWithPermissions = () =>
  apiClient.get('/permission/roles').then((r) => r.data)

export const updateRolePermissions = (roleId, permissionIds) =>
  apiClient.put(`/permission/role/${roleId}`, { permissionIds }).then((r) => r.data)
