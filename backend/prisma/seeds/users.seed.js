const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  // Nunca sembrar una contraseña de super_admin fija y conocida (riesgo real
  // si este seed se corre por accidente contra una base de producción).
  // En producción hay que definir SEED_SUPERADMIN_PASSWORD explícitamente;
  // en desarrollo, si no se define, se genera una aleatoria y se imprime.
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_SUPERADMIN_PASSWORD) {
    throw new Error('Define la variable de entorno SEED_SUPERADMIN_PASSWORD antes de correr este seed en producción.');
  }

  const seedPassword = process.env.SEED_SUPERADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
  if (!process.env.SEED_SUPERADMIN_PASSWORD) {
    console.warn(`⚠️  SEED_SUPERADMIN_PASSWORD no definido — se generó esta contraseña temporal para desarrollo: ${seedPassword}`);
  }

  const hashedPassword = await bcrypt.hash(seedPassword, 10);

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
