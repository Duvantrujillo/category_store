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

    // Un actor que no sea super_admin no puede otorgar permisos que él mismo
    // no posee — evita que alguien con solo "permissions.manage" se
    // autoasigne (o le asigne a otro rol) capacidades que ni él tiene.
    if (req.user?.role !== 'super_admin') {
      const currentlyActive = await prisma.rolePermission.findMany({
        where: { roleId, isActive: true },
        select: { permissionId: true },
      })
      const currentlyActiveIds = new Set(currentlyActive.map((rp) => rp.permissionId))
      const newlyGrantedIds = permissionIds.filter((pid) => !currentlyActiveIds.has(pid))

      if (newlyGrantedIds.length > 0) {
        const newlyGrantedPermissions = await prisma.permission.findMany({
          where: { id: { in: newlyGrantedIds } },
          select: { name: true },
        })
        const actorPermissions = new Set(req.user?.permissions ?? [])
        const notOwned = newlyGrantedPermissions.filter((p) => !actorPermissions.has(p.name))
        if (notOwned.length > 0) {
          return res.status(403).json({
            message: `No puedes otorgar permisos que tú mismo no tienes: ${notOwned.map((p) => p.name).join(', ')}`,
          })
        }
      }
    }

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
