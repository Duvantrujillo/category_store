const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const createCartItem = async (req, res) => {
  try {
    const cartUuid = req.cookies?.cart_uuid
    const items = req.body


    // 1. validar que sea array
    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: "El body debe ser un array de items"
      })
    }

    // 2. buscar carrito por cookie
    let cart = null

    if (cartUuid) {
      cart = await prisma.cart.findFirst({
        where: {
          uuid: cartUuid,
          status: "ACTIVE"
        }
      })
    }

    // 3. si no existe carrito, crearlo
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          status: "ACTIVE"
        }
      })

      res.cookie("cart_uuid", cart.uuid, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30
      })
    }

    // 4. procesar items del array
    const results = []

    for (const item of items) {
      const { productVariantId, quantity } = item

      if (!productVariantId) {
        return res.status(400).json({
          message: "productVariantId requerido en uno de los items"
        })
      }

      const cartItem = await prisma.cartItem.upsert({
        where: {
          cartId_productVariantId: {
            cartId: cart.id,
            productVariantId: Number(productVariantId)
          }
        },
        update: {
          quantity: {
            increment: quantity ? Number(quantity) : 1
          }
        },
        create: {
          cartId: cart.id,
          productVariantId: Number(productVariantId),
          quantity: quantity ? Number(quantity) : 1
        }
      })

      results.push(cartItem)
    }

    return res.json({
      message: "Items agregados correctamente",
      items: results
    })

  } catch (error) {
    return res.status(500).json({
      message: "Error al agregar al carrito"
    })
  }
}

module.exports = { createCartItem }