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
        message: "El body debe tener items"
      });
    }

    // 🔥 CALCULAR SUBTOTAL Y TOTAL
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
      message: "Orden creada correctamente",
      order
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error creando la orden",
      error: error.message
    });
  }
};

module.exports = {
createOrder
}