const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getActivePaymentMethods = async (req, res) => {
    try {
        const methods = await prisma.paymentMethod.findMany({
            where: { isActive: true },
            select: { id: true, name: true, type: true },
            orderBy: { id: 'asc' },
        })

        return res.status(200).json({ methods })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

module.exports = { getActivePaymentMethods }
