const { PrismaClient } = require("@prisma/client");
const { sendShipmentUpdatedEmail } = require("../../services/email.service");
const { buildSearchStems } = require("../../utils/search-stems");

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

    // Fechas manuales de envío/entrega: no pueden ser futuras ni anteriores
    // a la creación del envío — si no, se podría burlar el bloqueo de "no
    // editable después de 7 días hábiles" (que se calcula desde deliveredAt)
    // poniendo una fecha muy futura, o congelar el envío de inmediato
    // poniendo una fecha muy pasada.
    const now = new Date();
    let parsedShippedAt = null;
    let parsedDeliveredAt = null;

    if (shippedAt !== undefined && shippedAt !== null && shippedAt !== "") {
      parsedShippedAt = new Date(shippedAt);
      if (isNaN(parsedShippedAt.getTime())) {
        return res.status(400).json({ message: "Formato de fecha de envío inválido." });
      }
      if (parsedShippedAt > now) {
        return res.status(400).json({ message: "La fecha de envío no puede ser futura." });
      }
      if (parsedShippedAt < shipment.createdAt) {
        return res.status(400).json({ message: "La fecha de envío no puede ser anterior a la creación del envío." });
      }
    }

    if (deliveredAt !== undefined && deliveredAt !== null && deliveredAt !== "") {
      parsedDeliveredAt = new Date(deliveredAt);
      if (isNaN(parsedDeliveredAt.getTime())) {
        return res.status(400).json({ message: "Formato de fecha de entrega inválido." });
      }
      if (parsedDeliveredAt > now) {
        return res.status(400).json({ message: "La fecha de entrega no puede ser futura." });
      }
      const shippedReference = parsedShippedAt || shipment.shippedAt;
      if (shippedReference && parsedDeliveredAt < shippedReference) {
        return res.status(400).json({ message: "La fecha de entrega no puede ser anterior a la fecha de envío." });
      }
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

    if (parsedShippedAt) {
      updateData.shippedAt = parsedShippedAt;
    } else if (status === "SHIPPED" && !shipment.shippedAt) {
      updateData.shippedAt = new Date();
    }

    if (parsedDeliveredAt) {
      updateData.deliveredAt = parsedDeliveredAt;
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

    const stems = buildSearchStems(q);

    const shipments = await prisma.shipment.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { trackingNumber: { contains: s } },
            { order: { orderNumber: { contains: s } } },
            { order: { firstName:   { contains: s } } },
            { order: { lastName:    { contains: s } } },
          ],
        })),
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
