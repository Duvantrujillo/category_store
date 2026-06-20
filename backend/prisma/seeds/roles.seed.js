const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 🔥 Crear roles iniciales
  await prisma.role.createMany({
    data: [
       {
      name: 'super_admin',
      description: 'Super Administrador',
      status: true
    },
      { name: 'admin', description: 'Administrador', status: true },
      { name: 'customer', description: 'Cliente', status: true }
    ],
    skipDuplicates: true
  });

  console.log("🌱 Seeder ejecutado correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });