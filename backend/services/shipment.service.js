const { PrismaClient } = require("@prisma/client");
const { notifyShipmentCreated } = require("./notification.service");
const { sendShipmentCreatedEmail } = require("./email.service");

const prisma = new PrismaClient();

// Creación idempotente: intenta insertar y captura la violación de unicidad (P2002).
// Elimina el TOCTOU que existía con el patrón findUnique → create:
//   dos requests concurrentes podían pasar el findUnique antes de que alguno creara el registro
//   y luego uno fallaba silenciosamente. Ahora la BD es el árbitro, no la aplicación.
const createShipment = async (orderId) => {
  try {
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
      include: { history: true },
    });

    notifyShipmentCreated(shipment).catch((err) => {
      console.error("Error notificando SHIPMENT_CREATED", err);
    });

    // Obtener correo de la orden para notificar al cliente
    prisma.order.findUnique({
      where: { id: Number(orderId) },
      select: { orderNumber: true, firstName: true, lastName: true, email: true, address: true, municipality: true, departament: true },
    }).then((order) => {
      if (order) sendShipmentCreatedEmail(order).catch((err) => {
        console.error("Error enviando email SHIPMENT_CREATED", err);
      });
    });

    return shipment;
  } catch (error) {
    // P2002 = unique constraint violation: otro proceso ya creó el shipment.
    // Devolvemos el existente sin notificar (la notificación ya fue enviada).
    if (error.code === "P2002") {
      console.log(`Shipment ya existe para orden ${orderId} — retornando existente`);
      return prisma.shipment.findUnique({ where: { orderId: Number(orderId) } });
    }
    throw error;
  }
};

module.exports = { createShipment };
