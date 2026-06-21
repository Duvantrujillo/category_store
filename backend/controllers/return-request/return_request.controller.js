const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const {
  notifyReturnCreated,
  notifyReturnApproved,
  notifyReturnRejected,
  notifyReturnCompleted
} = require('../../services/notification.service')

const VALID_STATUSES    = ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'COMPLETED']
const VALID_RESOLUTIONS = ['REFUND', 'EXCHANGE', 'STORE_CREDIT']

const USER_SELECT = { select: { id: true, name: true, email: true } }

const createreturnRequest = async (req, res) => {
    try {
        const { orderId, status, resolution, reason } = req.body

        const orderIdNumb = Number(orderId)
        if (!orderId || isNaN(orderIdNumb)) {
            return res.status(400).json({ message: "Debes seleccionar una orden" })
        }

        if (!resolution || !VALID_RESOLUTIONS.includes(resolution)) {
            return res.status(400).json({ message: "Debes seleccionar una resolución válida" })
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: "Debes ingresar el motivo de la devolución" })
        }

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Estado inválido" })
        }

        const orderIdExist = await prisma.order.findUnique({
            where: { id: orderIdNumb }
        })

        if (!orderIdExist) {
            return res.status(404).json({ message: 'Orden no encontrada' })
        }

        const createReturnRequest = await prisma.returnRequest.create({
            data: {
                orderId: orderIdNumb,
                status: status || 'PENDING',
                resolution,
                reason: reason.trim(),
                registeredById: req.user.id,
            }
        })

        notifyReturnCreated(createReturnRequest).catch((err) => {
            console.error('Error notificando RETURN_CREATED', err)
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
                refunds: {
                    include: {
                        processedBy: USER_SELECT,
                    }
                },
                registeredBy: USER_SELECT,
                approvedBy:   USER_SELECT,
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

        const isApprovalAction = status === 'APPROVED' || status === 'REJECTED'

        const updated = await prisma.returnRequest.update({
            where: { id: Number(id) },
            data: {
                ...(status && { status }),
                ...(resolution !== undefined && { resolution }),
                ...(reason !== undefined && { reason }),
                ...(isApprovalAction && { approvedById: req.user.id }),
            }
        })

        if (status === 'APPROVED') {
            notifyReturnApproved(updated).catch((err) => {
                console.error('Error notificando RETURN_APPROVED', err)
            })
        } else if (status === 'REJECTED') {
            notifyReturnRejected(updated).catch((err) => {
                console.error('Error notificando RETURN_REJECTED', err)
            })
        } else if (status === 'COMPLETED') {
            notifyReturnCompleted(updated).catch((err) => {
                console.error('Error notificando RETURN_COMPLETED', err)
            })
        }

        return res.status(200).json({
            message: "Solicitud actualizada correctamente",
            data: updated
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

const searchReturnRequest = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q) return res.status(200).json({ data: [] });

    const requests = await prisma.returnRequest.findMany({
      where: {
        OR: [
          { reason: { contains: q } },
          { order: { orderNumber: { contains: q } } },
          { order: { firstName:   { contains: q } } },
          { order: { lastName:    { contains: q } } },
        ],
      },
      include: {
        order: { select: { orderNumber: true, firstName: true, lastName: true, total: true } },
        items: {
          include: {
            orderItem: { select: { productName: true, unitPrice: true, quantity: true } },
          },
        },
        refunds:      { include: { processedBy: USER_SELECT } },
        registeredBy: USER_SELECT,
        approvedBy:   USER_SELECT,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ data: requests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al buscar" });
  }
};

module.exports = {
    createreturnRequest,
    getAllReturnRequests,
    updateReturnRequest,
    searchReturnRequest,
}
