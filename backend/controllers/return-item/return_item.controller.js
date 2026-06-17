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

    const createdItems = []

    for (const item of items) {
      const orderItemNumb = Number(item.orderItem)
      const quantityNumb = Number(item.quantity)

      if (isNaN(orderItemNumb) || isNaN(quantityNumb)) {
        return res.status(400).json({
          message: "Datos inválidos"
        })
      }

      const orderItemExist = await prisma.orderItem.findUnique({
        where: { id: orderItemNumb }
      })

      if (!orderItemExist) {
        return res.status(400).json({
          message: `Ítem ${orderItemNumb} no encontrado`
        })
      }

      if (quantityNumb > orderItemExist.quantity) {
        return res.status(400).json({
          message: `Cantidad excede el pedido`
        })
      }

      const created = await prisma.returnItem.upsert({
        where: {
          returnRequestId_orderItemId: {
            returnRequestId: returnRequestNumb,
            orderItemId: orderItemNumb
          }
        },
        update: {
          quantity: quantityNumb
        },
        create: {
          returnRequestId: returnRequestNumb,
          orderItemId: orderItemNumb,
          quantity: quantityNumb
        }
      })

      createdItems.push(created)
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