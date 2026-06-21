const { PrismaClient } = require("@prisma/client");
const { sendShipmentUpdatedEmail } = require("../../services/email.service");

const prisma = new PrismaClient();

const STATUS_ORDER = ["CREATED", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED"];
const USER_SELECT  = { select: { id: true, name: true, email: true } };

const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, carrier, trackingNumber, note, shippedAt, deliveredAt } = req.body;

    const shipment = await prisma.shipment.findUnique({ where: { id: Number(id) } });

    if (!shipment) {
      return res.status(404).json({ message: "Envío no encontrado" });
    }

    if (status) {
      const currentIdx = STATUS_ORDER.indexOf(shipment.status);
      const newIdx     = STATUS_ORDER.indexOf(status);

      if (newIdx === -1) {
        return res.status(400).json({ message: `Estado "${status}" no es válido.` });
      }
      if (newIdx <= currentIdx) {
        return res.status(400).json({ message: `El estado "${status}" ya fue registrado.` });
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
