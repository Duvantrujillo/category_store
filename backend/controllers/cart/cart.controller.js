const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


const createCart = async (req, res) => {
  try {
    // 1. leer cookie
    const cartUuid = req.cookies?.cart_uuid

    let cart

    // 2. si existe cookie → buscar carrito
    if (cartUuid) {
      cart = await prisma.cart.findUnique({
        where: {
          uuid: cartUuid,
          status: "ACTIVE"
        },
        include: {
          items: true
        }
      })
    }

    // 3. si no existe carrito → crear uno nuevo
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          status: "ACTIVE"
        },
        include: {
          items: true
        }
      })

      // 4. guardar cookie en el navegador
      res.cookie("cart_uuid", cart.uuid, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30 // 30 días
      })
    }

    // 5. devolver carrito
    return res.json(cart)

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error interno" })
  }
}






module.exports = {
    createCart
}