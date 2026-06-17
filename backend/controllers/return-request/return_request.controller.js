const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createreturnRequest = async (req, res) => {
    try {
        const { orderId, status, resolution, reason } = req.body

        const orderIdNumb = Number(orderId)

        if (isNaN(orderIdNumb)) {
            return res.status(400).json({ message: "ID inválido" })
        }

        const orderIdExist = await prisma.order.findUnique({
            where: { id: orderIdNumb }
        })

        if (!orderIdExist) {
            return res.status(400).json({ message: 'Orden no encontrada' })
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
            message: "Solicitud creada",
            data: createReturnRequest
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

const getAllReturnRequests = async (req, res) => {
    try {
        const requests = await prisma.returnRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        firstName: true,
                        lastName: true,
                        total: true,
                    }
                },
                items: {
                    include: {
                        orderItem: {
                            select: {
                                productName: true,
                                unitPrice: true,
                                quantity: true,
                            }
                        }
                    }
                },
                refunds: true,
            }
        })

        return res.status(200).json(requests)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

const updateReturnRequest = async (req, res) => {
    try {
        const { id } = req.params
        const { status, resolution, reason } = req.body

        const existing = await prisma.returnRequest.findUnique({
            where: { id: Number(id) }
        })

        if (!existing) {
            return res.status(404).json({ message: "Solicitud no encontrada" })
        }

        const updated = await prisma.returnRequest.update({
            where: { id: Number(id) },
            data: {
                ...(status && { status }),
                ...(resolution !== undefined && { resolution }),
                ...(reason !== undefined && { reason }),
            }
        })

        return res.status(200).json({
            message: "Solicitud actualizada correctamente",
            data: updated
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

module.exports = {
    createreturnRequest,
    getAllReturnRequests,
    updateReturnRequest,
}
