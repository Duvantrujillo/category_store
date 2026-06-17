const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const STATUS_ORDER = ["CREATED", "PREPARING", "SHIPPED", "DELIVERED", "RETURNED"];

const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      carrier,
      trackingNumber,
      note,
      shippedAt,
      deliveredAt,
    } = req.body;

    const shipment = await prisma.shipment.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!shipment) {
      return res.status(404).json({
        message: "Envío no encontrado",
      });
    }

    if (status) {
      const currentIdx = STATUS_ORDER.indexOf(shipment.status);
      const newIdx     = STATUS_ORDER.indexOf(status);

      if (newIdx === -1) {
        return res.status(400).json({
          message: `Estado "${status}" no es válido.`,
        });
      }

      if (newIdx <= currentIdx) {
        return res.status(400).json({
          message: `El estado "${status}" ya fue registrado.`,
        });
      }
    }

    const updateData = {
      status,
      carrier,
      trackingNumber,
    };

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
      where: {
        id: Number(id),
      },
      data: updateData,
    });

    await prisma.shipmentHistory.create({
      data: {
        shipmentId: updatedShipment.id,
        status,
        note: note || null,
      },
    });

    return res.status(200).json({
      message: "Envío actualizado correctamente",
      shipment: updatedShipment,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno",
    });
  }
};


const allShipment = async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return res.status(200).json(shipments);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno",
    });
  }
};



const getShipmentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await prisma.shipmentHistory.findMany({
      where: {
        shipmentId: Number(id),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno",
    });
  }
};

module.exports = {
  updateShipment,
  allShipment,
  getShipmentHistory,
};