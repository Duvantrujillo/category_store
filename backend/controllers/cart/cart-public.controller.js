const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const VARIANT_INCLUDE = {
  product: {
    include: { brand: true, category: true }
  },
  images: true,
  attributes: {
    include: {
      attributeValue: {
        include: { attribute: true }
      }
    }
  }
}

const CART_INCLUDE = {
  items: {
    include: { productVariant: { include: VARIANT_INCLUDE } }
  }
}

// POST /cart/public — crear carrito nuevo
const createPublicCart = async (req, res) => {
  try {
    const cart = await prisma.cart.create({
      data: { status: 'ACTIVE' },
      include: CART_INCLUDE
    })
    return res.json(cart)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// GET /cart/public/:uuid — obtener carrito con ítems
const getPublicCart = async (req, res) => {
  try {
    const { uuid } = req.params
    const cart = await prisma.cart.findUnique({
      where: { uuid, status: 'ACTIVE' },
      include: CART_INCLUDE
    })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })
    return res.json(cart)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// POST /cart/public/:uuid/items — agregar ítem (valida stock)
const addPublicCartItem = async (req, res) => {
  try {
    const { uuid } = req.params
    const { productVariantId, quantity = 1 } = req.body

    if (!productVariantId) {
      return res.status(400).json({ message: 'productVariantId requerido' })
    }

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    const variant = await prisma.productVariant.findUnique({
      where: { id: Number(productVariantId) },
      select: { id: true, stock: true, isActive: true }
    })
    if (!variant || !variant.isActive) {
      return res.status(404).json({ message: 'Variante no disponible' })
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: Number(productVariantId)
        }
      }
    })

    const currentQty = existing?.quantity ?? 0
    const newQty = currentQty + Number(quantity)

    if (newQty > variant.stock) {
      return res.status(400).json({
        message: 'Stock insuficiente',
        available: variant.stock,
        current: currentQty
      })
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: Number(productVariantId)
        }
      },
      update: { quantity: newQty },
      create: {
        cartId: cart.id,
        productVariantId: Number(productVariantId),
        quantity: Number(quantity)
      }
    })

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: CART_INCLUDE
    })

    return res.json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// PUT /cart/public/:uuid/items/:variantId — actualizar cantidad exacta (valida stock)
const updatePublicCartItem = async (req, res) => {
  try {
    const { uuid, variantId } = req.params
    const { quantity } = req.body

    const qty = Number(quantity)
    if (!qty || qty < 1) {
      return res.status(400).json({ message: 'Cantidad inválida' })
    }

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    const variant = await prisma.productVariant.findUnique({
      where: { id: Number(variantId) },
      select: { stock: true }
    })
    if (!variant) return res.status(404).json({ message: 'Variante no encontrada' })

    if (qty > variant.stock) {
      return res.status(400).json({ message: 'Stock insuficiente', available: variant.stock })
    }

    await prisma.cartItem.update({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: Number(variantId)
        }
      },
      data: { quantity: qty }
    })

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: CART_INCLUDE
    })

    return res.json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// DELETE /cart/public/:uuid/items/:variantId — eliminar ítem
const removePublicCartItem = async (req, res) => {
  try {
    const { uuid, variantId } = req.params

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productVariantId: Number(variantId) }
    })

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: CART_INCLUDE
    })

    return res.json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

module.exports = {
  createPublicCart,
  getPublicCart,
  addPublicCartItem,
  updatePublicCartItem,
  removePublicCartItem
}
