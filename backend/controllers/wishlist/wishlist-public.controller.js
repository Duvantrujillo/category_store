const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const VARIANT_INCLUDE = {
  product: {
    include: { brand: true }
  },
  images: { orderBy: { slot: "asc" }, take: 2 },
  attributes: {
    include: { attributeValue: true }
  }
}

const WISHLIST_INCLUDE = {
  items: {
    include: { productVariant: { include: VARIANT_INCLUDE } }
  }
}

async function findOrCreateWishlist(cartUuid) {
  const cart = await prisma.cart.findUnique({
    where: { uuid: cartUuid, status: 'ACTIVE' },
    include: { wishlist: { include: WISHLIST_INCLUDE } }
  })
  if (!cart) return null

  if (cart.wishlist) return cart.wishlist

  return prisma.wishlist.create({
    data: { cartId: cart.id },
    include: WISHLIST_INCLUDE
  })
}

// GET /wishlist/public/:cartUuid
const getPublicWishlist = async (req, res) => {
  try {
    const { cartUuid } = req.params
    const wishlist = await findOrCreateWishlist(cartUuid)
    if (!wishlist) return res.status(404).json({ message: 'Carrito no encontrado' })
    return res.json(wishlist)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// POST /wishlist/public/:cartUuid/items
const addPublicWishlistItem = async (req, res) => {
  try {
    const { cartUuid } = req.params
    const { productVariantId } = req.body

    if (!productVariantId) {
      return res.status(400).json({ message: 'productVariantId requerido' })
    }

    const wishlist = await findOrCreateWishlist(cartUuid)
    if (!wishlist) return res.status(404).json({ message: 'Carrito no encontrado' })

    const variant = await prisma.productVariant.findUnique({
      where: { id: Number(productVariantId) },
      select: { id: true, isActive: true }
    })
    if (!variant || !variant.isActive) {
      return res.status(404).json({ message: 'Variante no disponible' })
    }

    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productVariantId: {
          wishlistId: wishlist.id,
          productVariantId: Number(productVariantId)
        }
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productVariantId: Number(productVariantId)
      }
    })

    const updated = await prisma.wishlist.findUnique({
      where: { id: wishlist.id },
      include: WISHLIST_INCLUDE
    })
    return res.json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// DELETE /wishlist/public/:cartUuid/items/:variantId
const removePublicWishlistItem = async (req, res) => {
  try {
    const { cartUuid, variantId } = req.params

    const wishlist = await findOrCreateWishlist(cartUuid)
    if (!wishlist) return res.status(404).json({ message: 'Carrito no encontrado' })

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productVariantId: Number(variantId)
      }
    })

    const updated = await prisma.wishlist.findUnique({
      where: { id: wishlist.id },
      include: WISHLIST_INCLUDE
    })
    return res.json(updated)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

module.exports = {
  getPublicWishlist,
  addPublicWishlistItem,
  removePublicWishlistItem
}
