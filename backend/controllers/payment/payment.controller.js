const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createPayment = async (req, res) => {
    try {
        const { orderId, provider, reference, transactionId, amount, currency, paymentMethod } = req.body;

        if (!orderId || !provider || !reference || !amount) {
            return res.status(400).json({ message: "Campos requeridos" });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        const payment = await prisma.payment.create({
            data: {
                orderId,
                provider,
                reference,
                transactionId: transactionId || null,
                amount,
                currency: currency || "COP",
                paymentMethod: paymentMethod || null,
                status: "PENDING",
            }
        });

        return res.status(201).json({ message: "Pago creado", payment });

    } catch (error) {
        console.error(error);
        if (error.code === "P2002") {
            return res.status(400).json({ message: "Referencia ya registrada" });
        }
        return res.status(500).json({ message: "Error interno" });
    }
};

const getPaymentMethods = async (req, res) => {
    try {
        const rows = await prisma.paymentMethod.findMany({
            where: { isActive: true },
            select: { name: true },
            orderBy: { id: 'asc' },
        })
        const methods = rows.map((r) => r.name)
        return res.status(200).json({ methods })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.query;
        if (!reference) return res.status(400).json({ message: "Referencia requerida" });

        const payment = await prisma.payment.findUnique({
            where: { reference },
            select: { status: true }
        });

        if (!payment) return res.status(404).json({ message: "Pago no encontrado" });
        return res.json({ status: payment.status });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};

module.exports = {
    createPayment,
    getPaymentMethods,
    verifyPayment,
}
