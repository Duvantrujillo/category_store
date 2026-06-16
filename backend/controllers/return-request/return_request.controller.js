const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createreturnRequest = async (req, res) => {
    try {
        const { orderId, status, resolution, reason } = req.body

        const orderIdNumb = Number(orderId)

        if (isNaN(orderIdNumb)) {
            return res.status(400).json({ message: "Id no es numérico" })
        }

        const orderIdExist = await prisma.order.findUnique({
            where: { id: orderIdNumb }
        })

        if (!orderIdExist) {
            return res.status(400).json({ message: 'La orden no existe' })
        }

        const createReturnRequest = await prisma.returnRequest.create({
            data: {
                orderId: orderIdNumb,
                status,        // debe ser enum válido
                resolution,    // opcional
                reason
            }
        })

        return res.status(201).json({
            message: "Return request creada correctamente",
            data: createReturnRequest
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno del servidor" })
    }
}

module.exports = {
    createreturnRequest,
}
