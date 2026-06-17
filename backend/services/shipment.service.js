const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createShipment = async (orderId) => {
  const shipmentExists = await prisma.shipment.findUnique({
    where: {
      orderId: Number(orderId),
    },
  });

  if (shipmentExists) {
    return shipmentExists;
  }

  const shipment = await prisma.shipment.create({
    data: {
      orderId: Number(orderId),
      status: "CREATED",

      history: {
        create: {
          status: "CREATED",
          note: "Envío creado automáticamente después del pago",
        },
      },
    },
    include: {
      history: true,
    },
  });

  return shipment;
};

module.exports = {
  createShipment,
};