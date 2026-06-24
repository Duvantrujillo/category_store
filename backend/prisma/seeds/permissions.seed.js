const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  // Productos
  { name: 'products.view',           description: 'Ver productos' },
  { name: 'products.create',         description: 'Crear productos' },
  { name: 'products.update',         description: 'Editar productos' },
  { name: 'products.delete',         description: 'Eliminar productos' },

  // Variantes de producto
  { name: 'product-variants.view',   description: 'Ver variantes de producto' },
  { name: 'product-variants.create', description: 'Crear variantes de producto' },
  { name: 'product-variants.update', description: 'Editar variantes de producto' },
  { name: 'product-variants.delete', description: 'Eliminar variantes de producto' },

  // Pedidos + vista de envíos (GET /order/* y GET /shipment/*)
  { name: 'orders.view',             description: 'Ver pedidos y consultar envíos / número de guía' },

  // Envíos — solo la acción de actualizar (estado, transportista, guía)
  { name: 'shipments.update',        description: 'Actualizar envío: estado, transportista y número de guía' },

  // Categorías
  { name: 'categories.view',         description: 'Ver categorías' },
  { name: 'categories.create',       description: 'Crear categorías' },
  { name: 'categories.update',       description: 'Editar categorías' },
  { name: 'categories.delete',       description: 'Eliminar categorías' },

  // Marcas
  { name: 'brands.view',             description: 'Ver marcas' },
  { name: 'brands.create',           description: 'Crear marcas' },
  { name: 'brands.update',           description: 'Editar marcas' },
  { name: 'brands.delete',           description: 'Eliminar marcas' },

  // Atributos
  { name: 'attributes.view',         description: 'Ver atributos' },
  { name: 'attributes.create',       description: 'Crear atributos' },
  { name: 'attributes.update',       description: 'Editar atributos' },
  { name: 'attributes.delete',       description: 'Eliminar atributos' },

  // Valores de atributo
  { name: 'attribute-values.view',   description: 'Ver valores de atributo' },
  { name: 'attribute-values.create', description: 'Crear valores de atributo' },
  { name: 'attribute-values.update', description: 'Editar valores de atributo' },
  { name: 'attribute-values.delete', description: 'Eliminar valores de atributo' },

  // Formularios / Respuestas de formulario
  { name: 'forms.view',              description: 'Ver formularios y respuestas' },
  { name: 'forms.create',            description: 'Crear formularios' },
  { name: 'forms.update',            description: 'Editar formularios' },
  { name: 'forms.delete',            description: 'Eliminar formularios' },

  // Devoluciones
  { name: 'returns.view',            description: 'Ver devoluciones' },
  { name: 'returns.approve',         description: 'Aprobar / rechazar devoluciones' },

  // Reembolsos
  { name: 'refunds.create',          description: 'Registrar reembolso de una devolución' },
  { name: 'refunds.process',         description: 'Procesar y marcar reembolso como pagado' },

  // Dashboard
  { name: 'dashboard.view',          description: 'Ver estadísticas del dashboard' },

  // Reportes
  { name: 'reports.view',            description: 'Ver reportes (ventas, envíos, devoluciones, reembolsos)' },

  // Banners / Hero
  { name: 'banners.view',            description: 'Ver banners del hero' },
  { name: 'banners.create',          description: 'Crear banners del hero' },
  { name: 'banners.update',          description: 'Editar banners del hero' },
  { name: 'banners.delete',          description: 'Eliminar banners del hero' },

  // Permisos — gestión de roles (solo super_admin puede asignarlo)
  { name: 'permissions.manage',      description: 'Gestionar permisos de roles' },
];

// Permisos que el rol "admin" tiene por defecto al ejecutar el seed
const ADMIN_DEFAULT_PERMISSIONS = [
  'products.view',
  'product-variants.view',
  'orders.view',        // incluye ver envíos y número de guía
  'categories.view',
  'brands.view',
  'attributes.view',
  'attribute-values.view',
  'forms.view',
  'returns.view',
  'dashboard.view',
  'reports.view',
  'banners.view',
];

async function main() {
  const validNames = ALL_PERMISSIONS.map((p) => p.name);

  // 1. Eliminar de la BD los permisos que ya no existen en la lista
  await prisma.rolePermission.deleteMany({
    where: { permission: { name: { notIn: validNames } } },
  });
  await prisma.permission.deleteMany({
    where: { name: { notIn: validNames } },
  });
  console.log('🧹 Permisos obsoletos eliminados');

  // 2. Crear / actualizar permisos actuales
  await prisma.permission.createMany({
    data: ALL_PERMISSIONS,
    skipDuplicates: true,
  });
  console.log(`✅ ${ALL_PERMISSIONS.length} permisos sincronizados`);

  // 3. Obtener roles
  const superAdminRole = await prisma.role.findFirst({ where: { name: 'super_admin' } });
  const adminRole      = await prisma.role.findFirst({ where: { name: 'admin' } });

  if (!superAdminRole || !adminRole) {
    throw new Error('Roles super_admin / admin no encontrados. Ejecuta primero roles.seed.js');
  }

  // 4. Obtener todos los permisos
  const allPerms = await prisma.permission.findMany({ select: { id: true, name: true } });
  const permMap  = Object.fromEntries(allPerms.map((p) => [p.name, p.id]));

  // 5. Asignar TODOS los permisos a super_admin
  const superAdminAssign = allPerms.map((p) => ({
    roleId:       superAdminRole.id,
    permissionId: p.id,
  }));
  await prisma.rolePermission.createMany({ data: superAdminAssign, skipDuplicates: true });
  console.log(`✅ super_admin: ${superAdminAssign.length} permisos asignados`);

  // 6. Asignar permisos por defecto a admin
  const adminAssign = ADMIN_DEFAULT_PERMISSIONS.map((name) => ({
    roleId:       adminRole.id,
    permissionId: permMap[name],
  }));
  await prisma.rolePermission.createMany({ data: adminAssign, skipDuplicates: true });
  console.log(`✅ admin: ${adminAssign.length} permisos asignados`);

  console.log('🌱 Seed de permisos ejecutado correctamente');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
