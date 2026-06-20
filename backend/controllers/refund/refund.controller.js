const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { notifyRefundProcessed } = require('../../services/notification.service')

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
        order: { include: { payment: true } }
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

    const refund = await prisma.refund.create({
      data: {
        returnRequestId: returnRequest.id,
        paymentId: returnRequest.order.payment.id,
        amount: totalRefund,
        status: "PENDING",
        reference: null,
      }
    })

    return res.status(201).json({ message: "Reembolso creado", refund })

  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Error interno" })
  }
}


const processRefund = async (req, res) => {
  try {
    const { refundId, method, reference } = req.body

    const refund = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: "PROCESSED",
        method,
        reference,
        paidAt: new Date(),
        processedById: req.user.id,
      }
    })

    notifyRefundProcessed(refund).catch((err) => {
      console.error('Error notificando REFUND_PROCESSED', err)
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
