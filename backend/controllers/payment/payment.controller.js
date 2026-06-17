const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()



const createPayment = async (req, res) => {
    try {
        const { orderId, provider, reference, transactionId, amount, currency, paymentMethod } = req.body;

        // Validaciones básicas
        if (!orderId || !provider || !reference || !amount) {
            return res.status(400).json({
                message: "Campos requeridos"
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
            message: "Pago creado",
            payment
        });

    } catch (error) {
        console.error(error);

        // Manejar errores de unicidad
        if (error.code === "P2002") { // Prisma unique constraint failed
            return res.status(400).json({
                message: "Referencia ya registrada"
            });
        }

        return res.status(500).json({
            message: "Error interno"
        });
    }
};




const getPaymentMethods = async (req, res) => {
    try {
        const rows = await prisma.payment.findMany({
            where: { paymentMethod: { not: null } },
            select: { paymentMethod: true },
            distinct: ['paymentMethod'],
        })

        const methods = rows.map((r) => r.paymentMethod)

        return res.status(200).json({ methods })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

module.exports = {
    createPayment,
    getPaymentMethods,
}