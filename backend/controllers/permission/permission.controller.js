const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// GET /permission/roles  — roles (excluye customer) con sus permisos activos + lista completa de permisos
const getRolesWithPermissions = async (req, res) => {
  try {
    const [roles, permissions] = await Promise.all([
      prisma.role.findMany({
        where: { status: true, NOT: { name: 'customer' } },
        select: {
          id: true,
          name: true,
          permissions: {
            where: { isActive: true },
            select: { permissionId: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.permission.findMany({
        select: { id: true, name: true, description: true },
        orderBy: { name: 'asc' },
      }),
    ])

    const rolesWithSets = roles.map((r) => ({
      id:            r.id,
      name:          r.name,
      permissionIds: r.permissions.map((p) => p.permissionId),
    }))

    res.json({ roles: rolesWithSets, permissions })
  } catch {
    res.status(500).json({ message: 'Error al obtener permisos' })
  }
}

// PUT /permission/role/:roleId  — activa/desactiva permisos sin eliminar registros
const updateRolePermissions = async (req, res) => {
  const roleId = Number(req.params.roleId)
  const { permissionIds } = req.body

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ message: 'permissionIds debe ser un arreglo' })
  }

  try {
    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role)                       return res.status(404).json({ message: 'Rol no encontrado' })
    if (role.name === 'super_admin') return res.status(400).json({ message: 'Los permisos de super_admin no se pueden modificar' })
    if (role.name === 'customer')    return res.status(400).json({ message: 'No se pueden asignar permisos de panel a customer' })

    await prisma.$transaction(async (tx) => {
      // Desactivar los que no están en la lista
      await tx.rolePermission.updateMany({
        where: { roleId, permissionId: { notIn: permissionIds } },
        data:  { isActive: false },
      })

      // Activar o crear los que sí están en la lista
      for (const pid of permissionIds) {
        await tx.rolePermission.upsert({
          where:  { roleId_permissionId: { roleId, permissionId: pid } },
          create: { roleId, permissionId: pid, isActive: true },
          update: { isActive: true },
        })
      }
    })

    res.json({ message: 'Permisos actualizados correctamente' })
  } catch {
    res.status(500).json({ message: 'Error al actualizar permisos' })
  }
}

module.exports = { getRolesWithPermissions, updateRolePermissions }
