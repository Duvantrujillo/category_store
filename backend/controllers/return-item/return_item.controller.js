const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CreatereturnItem = async (req, res) => {
  try {
    const { returnRequest, items } = req.body

    const returnRequestNumb = Number(returnRequest)

    if (isNaN(returnRequestNumb)) {
      return res.status(400).json({
        message: "returnRequest debe ser numérico"
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "items debe ser un array con productos"
      })
    }

    const returnRequestExist = await prisma.returnRequest.findUnique({
      where: { id: returnRequestNumb }
    })

    if (!returnRequestExist) {
      return res.status(400).json({
        message: "La solicitud no existe"
      })
    }

    const createdItems = []

    for (const item of items) {
      const orderItemNumb = Number(item.orderItem)
      const quantityNumb = Number(item.quantity)

      if (isNaN(orderItemNumb) || isNaN(quantityNumb)) {
        return res.status(400).json({
          message: "orderItem y quantity deben ser numéricos"
        })
      }

      const orderItemExist = await prisma.orderItem.findUnique({
        where: { id: orderItemNumb }
      })

      if (!orderItemExist) {
        return res.status(400).json({
          message: `El orderItem ${orderItemNumb} no existe`
        })
      }

      if (quantityNumb > orderItemExist.quantity) {
        return res.status(400).json({
          message: `Cantidad inválida en orderItem ${orderItemNumb}`
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
      message: "Registro exitoso",
      data: createdItems
    })

  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Error interno del servidor"
    })
  }
}


module.exports = {
  CreatereturnItem
}