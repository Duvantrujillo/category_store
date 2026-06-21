const { PrismaClient } = require("@prisma/client");
const { sendShipmentUpdatedEmail } = require("../../services/email.service");

const prisma = new PrismaClient();

const STATUS_ORDER = ["CREATED", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED"];
const STATUS_LABEL = {
  CREATED:   "Creado",
  PREPARING: "En preparación",
  SHIPPED:   "Enviado",
  DELIVERED: "Entregado",
  RETURNED:  "Devuelto",
};
const LOCKED_STATUSES = new Set(["DELIVERED", "RETURNED"]);
const USER_SELECT = { select: { id: true, name: true, email: true } };

function elapsedBusinessDays(from, to) {
  let count = 0;
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (current < end) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, carrier, trackingNumber, note, shippedAt, deliveredAt } = req.body;

    if (trackingNumber !== undefined && trackingNumber !== null && trackingNumber !== "") {
      if (!/^\d+$/.test(trackingNumber)) {
        return res.status(400).json({ message: "El número de rastreo solo puede contener dígitos." });
      }
      if (trackingNumber.length > 35) {
        return res.status(400).json({ message: "El número de rastreo no puede superar los 35 caracteres." });
      }
    }

    if (note && note.length > 200) {
      return res.status(400).json({ message: "La nota no puede superar los 200 caracteres." });
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: Number(id) } });

    if (!shipment) {
      return res.status(404).json({ message: "Envío no encontrado." });
    }

    if (LOCKED_STATUSES.has(shipment.status)) {
      let statusSetAt = shipment.deliveredAt || null;

      if (!statusSetAt) {
        const historyEntry = await prisma.shipmentHistory.findFirst({
          where:   { shipmentId: Number(id), status: shipment.status },
          orderBy: { createdAt: "asc" },
        });
        statusSetAt = historyEntry ? historyEntry.createdAt : shipment.updatedAt;
      }

      if (elapsedBusinessDays(statusSetAt, new Date()) >= 7) {
        return res.status(403).json({
          message: `El envío no puede modificarse. Han transcurrido más de 7 días hábiles desde que se marcó como "${STATUS_LABEL[shipment.status]}".`,
        });
      }
    }

    if (status) {
      const currentIdx = STATUS_ORDER.indexOf(shipment.status);
      const newIdx     = STATUS_ORDER.indexOf(status);

      if (newIdx === -1) {
        return res.status(400).json({ message: "El estado seleccionado no es válido." });
      }
      if (newIdx !== currentIdx + 1) {
        const siguiente = STATUS_ORDER[currentIdx + 1];
        if (!siguiente) {
          return res.status(400).json({
            message: `El envío ya se encuentra en su estado final "${STATUS_LABEL[shipment.status]}" y no puede avanzar más.`,
          });
        }
        return res.status(400).json({
          message: `El siguiente estado requerido es "${STATUS_LABEL[siguiente]}". No es posible omitir pasos en el proceso de envío.`,
        });
      }
    }

    const updateData = { status, carrier, trackingNumber };

    if (shippedAt) {
      updateData.shippedAt = new Date(shippedAt);
    } else if (status === "SHIPPED" && !shipment.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (deliveredAt) {
      updateData.deliveredAt = new Date(deliveredAt);
    } else if (status === "DELIVERED" && !shipment.deliveredAt) {
      updateData.deliveredAt = new Date();
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: Number(id) },
      data: updateData,
    });

    await prisma.shipmentHistory.create({
      data: {
        shipmentId:  updatedShipment.id,
        status,
        note:        note || null,
        updatedById: req.user.id,
      },
    });

    // Email al cliente solo cuando cambia el estado
    if (status) {
      prisma.order.findUnique({
        where: { id: updatedShipment.orderId },
        select: { orderNumber: true, firstName: true, lastName: true, email: true, address: true, municipality: true, departament: true },
      }).then((order) => {
        if (order) sendShipmentUpdatedEmail(order, updatedShipment, status).catch((err) => {
          console.error("Error enviando email SHIPMENT_UPDATED", err);
        });
      });
    }

    return res.status(200).json({
      message: "Envío actualizado correctamente",
      shipment: updatedShipment,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};


const allShipment = async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: { orderNumber: true, firstName: true, lastName: true },
        },
      },
    });

    return res.status(200).json(shipments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};


const getShipmentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await prisma.shipmentHistory.findMany({
      where: { shipmentId: Number(id) },
      orderBy: { createdAt: "desc" },
      include: { updatedBy: USER_SELECT },
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const searchShipment = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q) return res.status(200).json({ data: [] });

    const shipments = await prisma.shipment.findMany({
      where: {
        OR: [
          { trackingNumber: { contains: q } },
          { order: { orderNumber: { contains: q } } },
          { order: { firstName:   { contains: q } } },
          { order: { lastName:    { contains: q } } },
        ],
      },
      include: {
        order: { select: { orderNumber: true, firstName: true, lastName: true } },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ data: shipments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al buscar" });
  }
};

module.exports = { updateShipment, allShipment, getShipmentHistory, searchShipment };
