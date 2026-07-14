const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { notifyRefundProcessed } = require('../../services/notification.service')
const { sendRefundProcessedEmail } = require('../../services/email.service')

const createRefund = async (req, res) => {
  try {
    const { returnRequestId } = req.body

    if (!returnRequestId) {
      return res.status(400).json({ message: "returnRequestId requerido" })
    }
    if (isNaN(returnRequestId)) {
      return res.status(400).json({ message: "returnRequestId inválido" })
    }

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnRequestId },
      include: {
        items: { include: { orderItem: true } },
        refunds: true,
        order: {
          include: {
            payment: true,
            items: { select: { id: true, quantity: true } },
          }
        }
      }
    })

    if (!returnRequest) {
      return res.status(404).json({ message: "Solicitud no encontrada" })
    }

    if (!returnRequest.order?.payment) {
      return res.status(400).json({ message: "Sin pago asociado" })
    }

    if (returnRequest.items.length === 0) {
      return res.status(400).json({ message: "Sin productos asociados" })
    }

    if (returnRequest.status !== 'APPROVED') {
      return res.status(400).json({ message: "Solo se puede reembolsar una solicitud aprobada" })
    }

    if (returnRequest.refunds.length > 0) {
      return res.status(400).json({ message: "Reembolso ya registrado" })
    }

    let totalRefund = 0
    for (const item of returnRequest.items) {
      totalRefund += Number(item.orderItem.unitPrice) * item.quantity
    }

    if (totalRefund <= 0) {
      return res.status(400).json({ message: "Monto inválido" })
    }

    // Verificar si este reembolso cubre el 100% de la orden
    const alreadyRefundedQty = {}

    const previousReturnRequests = await prisma.returnRequest.findMany({
      where: {
        orderId: returnRequest.orderId,
        id: { not: Number(returnRequestId) },
        refunds: { some: {} },
      },
      select: { items: { select: { orderItemId: true, quantity: true } } }
    })

    for (const rr of previousReturnRequests) {
      for (const item of rr.items) {
        alreadyRefundedQty[item.orderItemId] = (alreadyRefundedQty[item.orderItemId] || 0) + item.quantity
      }
    }

    for (const item of returnRequest.items) {
      alreadyRefundedQty[item.orderItemId] = (alreadyRefundedQty[item.orderItemId] || 0) + item.quantity
    }

    const orderItems = returnRequest.order.items
    const isFullRefund = orderItems.length > 0 &&
      orderItems.every(oi => (alreadyRefundedQty[oi.id] || 0) >= oi.quantity)

    const shippingAmount = isFullRefund ? Number(returnRequest.order.shippingCost) : 0
    if (isFullRefund) totalRefund += shippingAmount

    let refund
    try {
      refund = await prisma.refund.create({
        data: {
          returnRequestId: returnRequest.id,
          paymentId: returnRequest.order.payment.id,
          amount: totalRefund,
          status: "PENDING",
          reference: null,
        }
      })
    } catch (err) {
      // Backstop real contra el TOCTOU del chequeo `returnRequest.refunds.length`
      // de arriba (dos requests casi simultáneas) — la restricción única en
      // BD (@@unique([returnRequestId]) en Refund) es la que realmente lo evita.
      if (err.code === 'P2002') {
        return res.status(409).json({ message: "Reembolso ya registrado" })
      }
      throw err
    }

    return res.status(201).json({
      message: "Reembolso creado",
      refund,
      includesShipping: isFullRefund,
      shippingAmount,
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error interno" })
  }
}


const processRefund = async (req, res) => {
  try {
    const { refundId, method, reference } = req.body

    const refundIdNum = Number(refundId)
    if (!Number.isInteger(refundIdNum) || refundIdNum <= 0) {
      return res.status(400).json({ message: "refundId inválido" })
    }

    // CAS: solo procesa un reembolso que siga PENDING — evita que dos
    // requests concurrentes (o un doble clic) lo procesen dos veces, y evita
    // reabrir uno ya FAILED/PROCESSED con una referencia nueva.
    const claimed = await prisma.refund.updateMany({
      where: { id: refundIdNum, status: "PENDING" },
      data: {
        status: "PROCESSED",
        method,
        reference,
        paidAt: new Date(),
        processedById: req.user.id,
      }
    })

    if (claimed.count === 0) {
      return res.status(409).json({ message: "El reembolso ya fue procesado o no está pendiente" })
    }

    const refund = await prisma.refund.findUnique({ where: { id: refundIdNum } })

    notifyRefundProcessed(refund).catch((err) => {
      console.error('Error notificando REFUND_PROCESSED', err)
    })

    // El refund solo tiene paymentId — hay que subir hasta la orden para
    // sacar el email del cliente (no viaja en el registro de Refund).
    prisma.payment.findUnique({
      where: { id: refund.paymentId },
      select: { order: { select: { orderNumber: true, email: true, firstName: true, currency: true } } },
    }).then((payment) => {
      if (payment?.order) {
        sendRefundProcessedEmail(payment.order, refund).catch((err) => {
          console.error('Error enviando email REFUND_PROCESSED', err)
        })
      }
    }).catch((err) => {
      console.error('Error obteniendo orden para email REFUND_PROCESSED', err)
    })

    return res.json({ message: "Reembolso procesado", refund })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error interno" })
  }
}


module.exports = {
  createRefund,
  processRefund
}
