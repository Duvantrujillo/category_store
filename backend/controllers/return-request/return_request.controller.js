const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const {
  notifyReturnCreated,
  notifyReturnApproved,
  notifyReturnRejected,
  notifyReturnCompleted
} = require('../../services/notification.service')
const { sendReturnStatusEmail } = require('../../services/email.service')
const { buildSearchStems } = require('../../utils/search-stems')

const VALID_STATUSES    = ['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'COMPLETED']
const VALID_RESOLUTIONS = ['REFUND', 'EXCHANGE', 'STORE_CREDIT']

const STATUS_LABELS = {
  PENDING:   'Pendiente',
  RECEIVED:  'Recibida',
  APPROVED:  'Aprobada',
  REJECTED:  'Rechazada',
  COMPLETED: 'Completada',
}

const VALID_TRANSITIONS = {
  PENDING:   ['RECEIVED'],
  RECEIVED:  ['APPROVED', 'REJECTED'],
  APPROVED:  ['COMPLETED'],
  REJECTED:  ['COMPLETED'],
  COMPLETED: [],
}

const USER_SELECT = { select: { id: true, name: true, email: true } }

// El ReturnRequest no trae el email del cliente — hay que subir hasta la
// orden. Se dispara "fire and forget" (no bloquea la respuesta al admin).
function sendReturnEmail(returnRequest, newStatus) {
  prisma.order.findUnique({
    where: { id: returnRequest.orderId },
    select: { orderNumber: true, email: true, firstName: true },
  }).then((order) => {
    if (order) {
      sendReturnStatusEmail(order, returnRequest, newStatus).catch((err) => {
        console.error(`Error enviando email RETURN_${newStatus}`, err)
      })
    }
  }).catch((err) => {
    console.error(`Error obteniendo orden para email RETURN_${newStatus}`, err)
  })
}

function computeWillIncludeShipping(rr) {
  if (rr.resolution !== 'REFUND' || (rr.refunds?.length ?? 0) > 0) return false
  const orderItems = rr.order?.items ?? []
  if (orderItems.length === 0) return false

  const qty = {}
  for (const otherRR of (rr.order?.returns ?? [])) {
    for (const item of otherRR.items) {
      qty[item.orderItemId] = (qty[item.orderItemId] || 0) + item.quantity
    }
  }
  for (const item of rr.items) {
    qty[item.orderItemId] = (qty[item.orderItemId] || 0) + item.quantity
  }

  return orderItems.every(oi => (qty[oi.id] || 0) >= oi.quantity)
}

function enrichReturnRequest(rr) {
  const willIncludeShipping = computeWillIncludeShipping(rr)
  const shippingCost = Number(rr.order?.shippingCost ?? 0)
  const order = rr.order
    ? (({ items: _i, returns: _r, shippingCost: _s, ...rest }) => rest)(rr.order)
    : rr.order
  return { ...rr, order, willIncludeShipping, shippingCost }
}

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

        if (reason.trim().length > 300) {
            return res.status(400).json({ message: "El motivo no puede superar los 300 caracteres" })
        }

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: "Estado inválido" })
        }

        if (status && status !== 'PENDING') {
            return res.status(400).json({ message: "Al crear, el estado se asigna automáticamente como Pendiente" })
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
                        shippingCost: true,
                        items: { select: { id: true, quantity: true } },
                        returns: {
                          where: { refunds: { some: {} } },
                          select: {
                            id: true,
                            items: { select: { orderItemId: true, quantity: true } }
                          }
                        },
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

        return res.status(200).json(requests.map(enrichReturnRequest))
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
            where: { id: Number(id) },
            include: { refunds: { select: { id: true } } }
        })

        if (!existing) {
            return res.status(404).json({ message: "Solicitud no encontrada" })
        }

        if (existing.status === 'COMPLETED') {
            return res.status(400).json({ message: "La solicitud ya está completada y no puede modificarse" })
        }

        if (resolution !== undefined && existing.resolution && resolution !== existing.resolution) {
            return res.status(400).json({ message: "La resolución ya fue establecida y no puede modificarse" })
        }

        if (resolution !== undefined && existing.refunds?.length > 0 && resolution !== existing.resolution) {
            return res.status(400).json({ message: "No se puede cambiar la resolución: ya existe un reembolso asociado a esta solicitud" })
        }

        if (status && status !== existing.status) {
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({ message: "Estado inválido" })
            }
            const allowed = VALID_TRANSITIONS[existing.status] ?? []
            if (!allowed.includes(status)) {
                const from = STATUS_LABELS[existing.status] ?? existing.status
                const to   = STATUS_LABELS[status] ?? status
                return res.status(400).json({
                    message: `No se puede cambiar el estado de "${from}" a "${to}"`
                })
            }
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
            sendReturnEmail(updated, 'APPROVED')
        } else if (status === 'REJECTED') {
            notifyReturnRejected(updated).catch((err) => {
                console.error('Error notificando RETURN_REJECTED', err)
            })
            sendReturnEmail(updated, 'REJECTED')
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

    const stems = buildSearchStems(q);

    const requests = await prisma.returnRequest.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { reason: { contains: s } },
            { order: { orderNumber: { contains: s } } },
            { order: { firstName:   { contains: s } } },
            { order: { lastName:    { contains: s } } },
          ],
        })),
      },
      include: {
        order: {
        select: {
          orderNumber: true,
          firstName: true,
          lastName: true,
          total: true,
          shippingCost: true,
          items: { select: { id: true, quantity: true } },
          returns: {
            where: { refunds: { some: {} } },
            select: {
              id: true,
              items: { select: { orderItemId: true, quantity: true } }
            }
          },
        }
      },
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

    return res.status(200).json({ data: requests.map(enrichReturnRequest) });
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
