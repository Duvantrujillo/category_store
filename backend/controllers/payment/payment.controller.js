const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createPayment = async (req, res) => {
    try {
        const { orderId, provider, reference, transactionId, currency, paymentMethod } = req.body;

        if (!orderId || !provider || !reference) {
            return res.status(400).json({ message: "Campos requeridos" });
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        // `orderId` es un entero autoincremental fácil de adivinar/enumerar.
        // Exigimos que además coincida con `orderNumber` (el identificador
        // público, no secuencial, que solo conoce quien creó ese pedido)
        // para evitar que cualquiera registre un pago falso sobre la orden
        // de otra persona y bloquee su pago legítimo.
        if (!order || order.orderNumber !== reference) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        const existingPayment = await prisma.payment.findUnique({ where: { orderId } });
        if (existingPayment) {
            return res.status(400).json({ message: "La orden ya tiene un pago registrado" });
        }

        // El monto siempre se toma del total de la orden (incluye costo de envío).
        // Nunca del cliente, para evitar manipulación.
        const amount = Number(order.total);

        const payment = await prisma.payment.create({
            data: {
                orderId,
                provider,
                reference,
                transactionId: transactionId || null,
                amount,
                currency: currency || order.currency,
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
