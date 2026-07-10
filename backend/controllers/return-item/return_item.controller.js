const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CreatereturnItem = async (req, res) => {
  try {
    const { returnRequest, items } = req.body

    const returnRequestNumb = Number(returnRequest)

    if (isNaN(returnRequestNumb)) {
      return res.status(400).json({
        message: "ID inválido"
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Se esperaba un array de ítems"
      })
    }

    const returnRequestExist = await prisma.returnRequest.findUnique({
      where: { id: returnRequestNumb }
    })

    if (!returnRequestExist) {
      return res.status(400).json({
        message: "Solicitud no encontrada"
      })
    }

    // Validar formato de todos los ítems antes de tocar la BD
    const parsedItems = []
    for (const item of items) {
      const orderItemNumb = Number(item.orderItem)
      const quantityNumb = Number(item.quantity)
      if (!Number.isInteger(orderItemNumb) || orderItemNumb <= 0 || !Number.isInteger(quantityNumb) || quantityNumb <= 0) {
        return res.status(400).json({ message: "Datos inválidos" })
      }
      parsedItems.push({ orderItemNumb, quantityNumb })
    }

    const createdItems = []

    // Todo en una sola transacción: SELECT ... FOR UPDATE bloquea la fila del
    // OrderItem mientras dura, así dos solicitudes de devolución concurrentes
    // para el mismo ítem no pueden leer la suma "ya devuelta" antes de que la
    // otra confirme su propia escritura (evita sobre-devolución por carrera).
    try {
      await prisma.$transaction(async (tx) => {
        for (const { orderItemNumb, quantityNumb } of parsedItems) {
          const locked = await tx.$queryRaw`
            SELECT id, orderId, quantity FROM OrderItem WHERE id = ${orderItemNumb} FOR UPDATE
          `
          const orderItemExist = locked[0]

          if (!orderItemExist) {
            throw new Error(`ITEM_NOT_FOUND:${orderItemNumb}`)
          }

          // El ítem debe pertenecer a la misma orden que la solicitud de
          // devolución — si no, se podría colar un producto de un pedido ajeno.
          if (orderItemExist.orderId !== returnRequestExist.orderId) {
            throw new Error(`ITEM_ORDER_MISMATCH:${orderItemNumb}`)
          }

          if (quantityNumb > orderItemExist.quantity) {
            throw new Error(`QTY_EXCEEDS:${orderItemNumb}`)
          }

          // Solo cuentan devoluciones de solicitudes que no fueron rechazadas —
          // una devolución rechazada nunca "gastó" cupo real.
          const alreadyReturned = await tx.returnItem.aggregate({
            where: {
              orderItemId: orderItemNumb,
              returnRequestId: { not: returnRequestNumb },
              returnRequest: { status: { not: 'REJECTED' } },
            },
            _sum: { quantity: true },
          })
          const prevQty = alreadyReturned._sum.quantity ?? 0
          if (prevQty + quantityNumb > orderItemExist.quantity) {
            throw new Error(`QTY_TOTAL_EXCEEDS:${orderItemNumb}:${prevQty + quantityNumb}:${orderItemExist.quantity}`)
          }

          const created = await tx.returnItem.upsert({
            where: {
              returnRequestId_orderItemId: {
                returnRequestId: returnRequestNumb,
                orderItemId: orderItemNumb
              }
            },
            update: { quantity: quantityNumb },
            create: {
              returnRequestId: returnRequestNumb,
              orderItemId: orderItemNumb,
              quantity: quantityNumb
            }
          })

          createdItems.push(created)
        }
      })
    } catch (err) {
      if (err.message?.startsWith('ITEM_NOT_FOUND:')) {
        return res.status(400).json({ message: `Ítem ${err.message.split(':')[1]} no encontrado` })
      }
      if (err.message?.startsWith('ITEM_ORDER_MISMATCH:')) {
        return res.status(400).json({ message: `El ítem ${err.message.split(':')[1]} no pertenece al pedido de esta solicitud` })
      }
      if (err.message?.startsWith('QTY_EXCEEDS:')) {
        return res.status(400).json({ message: `Cantidad excede el pedido` })
      }
      if (err.message?.startsWith('QTY_TOTAL_EXCEEDS:')) {
        const [, , total, max] = err.message.split(':')
        return res.status(400).json({ message: `La cantidad total devuelta (${total}) supera lo pedido (${max})` })
      }
      throw err
    }

    return res.status(201).json({
      message: "Ítems registrados",
      data: createdItems
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Error interno"
    })
  }
}


module.exports = {
  CreatereturnItem
}