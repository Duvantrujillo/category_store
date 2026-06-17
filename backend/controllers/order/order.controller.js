const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()


const createOrder = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      documentNumber,
      email,
      phoneNumber,
      departament,
      municipality,
      address,
      additionalDetails,
      items,
      currency
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Se esperaba un array de ítems"
      });
    }

    // Verificar que el unitPrice de cada item coincida con el precio real en BD
    const variantIds = items.map(item => item.productVariantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, price: true }
    });

    const variantPriceMap = Object.fromEntries(variants.map(v => [v.id, v.price]));

    for (const item of items) {
      const realPrice = variantPriceMap[item.productVariantId];
      if (realPrice === undefined) {
        return res.status(400).json({
          message: `Variante ${item.productVariantId} no encontrada`
        });
      }
      if (Number(realPrice) !== Number(item.unitPrice)) {
        return res.status(400).json({
          message: `Precio incorrecto`,
          productVariantId: item.productVariantId,
          expectedPrice: Number(realPrice),
          receivedPrice: Number(item.unitPrice)
        });
      }
    }

    // CALCULAR SUBTOTAL Y TOTAL
    const subtotal = items.reduce((acc, item) => {
      return acc + Number(item.unitPrice) * Number(item.quantity);
    }, 0);

    const total = subtotal;

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.$transaction(async (tx) => {
      return await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          firstName,
          lastName,
          documentNumber,
          email: email || null,
          phoneNumber,
          departament,
          municipality,
          address,
          additionalDetails: additionalDetails || null,

          subtotal,
          total,
          currency: currency || "COP",

          items: {
            create: items.map(item => ({
              productVariantId: item.productVariantId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: Number(item.unitPrice) * Number(item.quantity)
            }))
          }
        },
        include: {
          items: true
        }
      });
    });

    return res.status(201).json({
      message: "Orden creada",
      order
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error interno"
    });
  }
};



const allOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            productVariant: true,
            returnItems: {
              select: { quantity: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      ok: true,
      orders
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno'
    });
  }
};


module.exports = {
createOrder,
allOrder
}