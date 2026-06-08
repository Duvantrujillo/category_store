const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()



const createPayment = async (req, res) => {
    try {
        const { orderId, provider, reference, transactionId, amount, currency, paymentMethod } = req.body;

        // Validaciones básicas
        if (!orderId || !provider || !reference || !amount) {
            return res.status(400).json({
                message: "Faltan datos obligatorios para crear el Payment"
            });
        }

        // Verificar que la orden exista
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        // Crear el pago
        const payment = await prisma.payment.create({
            data: {
                orderId,
                provider,
                reference,
                transactionId: transactionId || null,
                amount,
                currency: currency || "COP",
                paymentMethod: paymentMethod || null,
                status: "PENDING" // Por defecto
            }
        });

        return res.status(201).json({
            message: "Pago creado correctamente",
            payment
        });

    } catch (error) {
        console.error(error);

        // Manejar errores de unicidad
        if (error.code === "P2002") { // Prisma unique constraint failed
            return res.status(400).json({
                message: "Ya existe un pago con ese reference o orderId",
                error: error.meta.target
            });
        }

        return res.status(500).json({
            message: "Error creando el Payment",
            error: error.message
        });
    }
};




module.exports = {
    createPayment
}