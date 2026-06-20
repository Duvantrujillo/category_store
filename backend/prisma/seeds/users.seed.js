const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("12345678", 10);

  // Obtener roles por nombre para no depender del orden de IDs
  const superAdminRole = await prisma.role.findFirst({ where: { name: 'super_admin' } });
  const adminRole      = await prisma.role.findFirst({ where: { name: 'admin' } });

  if (!superAdminRole || !adminRole) {
    throw new Error('Roles no encontrados. Ejecuta primero roles.seed.js');
  }

  await prisma.user.createMany({
    data: [
      {
        name:     "Duvan Trujillo",
        email:    "duvan@gmail.com",
        password: hashedPassword,
        status:   "active",
        roleId:   superAdminRole.id,
      },
      {
        name:     "Super Admin",
        email:    "superadmin@categorystore.com",
        password: hashedPassword,
        status:   "active",
        roleId:   superAdminRole.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("🌱 Usuarios creados correctamente");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
