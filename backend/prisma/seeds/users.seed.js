const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("12345678", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Duvan Trujillo",
        email: "duvan@gmail.com",
        password: hashedPassword,
        roleId: 1
      }
    ],
    skipDuplicates: true
  });

  console.log("🌱 usuarios creados correctamente")
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });