const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { getActivePromotions, attachPromotionPricing } = require('../../utils/promotion-pricing')

// Adjunta finalPrice/promotion a cada productVariant de items[] — no toca
// bundleItems (Promotion no soporta scope BUNDLES).
async function enrichCart(cart) {
  if (!cart) return cart
  const activePromotions = await getActivePromotions()
  return {
    ...cart,
    items: cart.items.map((item) => ({
      ...item,
      productVariant: attachPromotionPricing(item.productVariant, activePromotions),
    })),
  }
}

// Todo lo que llega del cliente (ids, cantidades) pasa por acá antes de
// tocar la BD — nunca se confía en que ya venga como número entero válido.
function parsePositiveInt(value, max = Infinity) {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0 || n > max) return null
  return n
}

// Lanzarlo dentro de $transaction hace rollback sin ser un error de
// infraestructura — se captura afuera para devolver un 400 normal.
class InsufficientStockError extends Error {
  constructor(available, current) {
    super('insufficient_stock')
    this.name = 'InsufficientStockError'
    this.available = available
    this.current = current
  }
}

class BundleValidationError extends Error {
  constructor(message, available) {
    super(message)
    this.name = 'BundleValidationError'
    this.available = available
  }
}

const VARIANT_INCLUDE = {
  product: {
    include: { brand: true }
  },
  images: { orderBy: { slot: "asc" }, take: 2 },
  attributes: {
    include: { attributeValue: true }
  }
}

// Variantes de un componente del combo — tanto la variante "fija" (si el admin
// eligió una puntual) como el listado de variantes del producto (si el
// componente es "libre" y el cliente debe elegir).
const BUNDLE_VARIANT_SELECT = {
  id: true,
  sku: true,
  price: true,
  stock: true,
  reservedStock: true,
  isActive: true,
  images: { select: { imageUrl: true, slot: true }, orderBy: { slot: 'asc' }, take: 2 },
  attributes: {
    select: {
      attributeValue: { select: { value: true, attribute: { select: { name: true } } } }
    }
  },
}

const BUNDLE_RECIPE_SELECT = {
  id: true,
  quantity: true,
  productId: true,
  productVariantId: true,
  product: {
    select: {
      id: true, name: true, slug: true, mainImage: true,
      variants: { where: { isActive: true }, select: BUNDLE_VARIANT_SELECT },
    }
  },
  productVariant: { select: BUNDLE_VARIANT_SELECT },
}

const BUNDLE_INCLUDE = {
  bundle: {
    include: {
      items: { select: BUNDLE_RECIPE_SELECT }
    }
  },
  // Variante elegida por el cliente para cada componente "libre" de este combo.
  selections: {
    select: {
      productBundleItemId: true,
      productVariantId: true,
      productVariant: { select: BUNDLE_VARIANT_SELECT },
    }
  }
}

const CART_INCLUDE = {
  items: {
    include: { productVariant: { include: VARIANT_INCLUDE } }
  },
  bundleItems: {
    include: BUNDLE_INCLUDE
  }
}

// POST /cart/public — crear carrito nuevo
const createPublicCart = async (req, res) => {
  try {
    const cart = await prisma.cart.create({
      data: { status: 'ACTIVE' },
      include: CART_INCLUDE
    })
    return res.json(await enrichCart(cart))
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
    return res.json(await enrichCart(cart))
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

    const variantIdNum = parsePositiveInt(productVariantId)
    if (!variantIdNum) {
      return res.status(400).json({ message: 'productVariantId requerido' })
    }
    const qtyNum = parsePositiveInt(quantity, 9999)
    if (!qtyNum) {
      return res.status(400).json({ message: 'Cantidad inválida' })
    }

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantIdNum },
      select: { id: true, stock: true, reservedStock: true, isActive: true }
    })
    if (!variant || !variant.isActive) {
      return res.status(404).json({ message: 'Variante no disponible' })
    }

    // Todo dentro de una transacción con lock sobre la fila del carrito: sin
    // esto, dos clics casi simultáneos en "agregar" pueden leer la misma
    // `currentQty` antes de que cualquiera escriba, y el segundo upsert
    // pisa al primero (se pierde una unidad en vez de sumar las dos).
    let updated
    try {
      updated = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM Cart WHERE id = ${cart.id} FOR UPDATE`

        const existing = await tx.cartItem.findUnique({
          where: {
            cartId_productVariantId: {
              cartId: cart.id,
              productVariantId: variantIdNum
            }
          }
        })

        const currentQty = existing?.quantity ?? 0
        const newQty = currentQty + qtyNum

        // Disponible = stock - reservedStock: si un pedido pendiente (incluso
        // uno abandonado sin pagar) ya reservó unidades, no cuentan como
        // libres para un carrito nuevo — solo se liberan cuando esa orden
        // expira o se cancela.
        const available = variant.stock - variant.reservedStock
        if (newQty > available) {
          throw new InsufficientStockError(available, currentQty)
        }

        await tx.cartItem.upsert({
          where: {
            cartId_productVariantId: {
              cartId: cart.id,
              productVariantId: variantIdNum
            }
          },
          update: { quantity: newQty },
          create: {
            cartId: cart.id,
            productVariantId: variantIdNum,
            quantity: qtyNum
          }
        })

        return tx.cart.findUnique({ where: { id: cart.id }, include: CART_INCLUDE })
      })
    } catch (err) {
      if (err instanceof InsufficientStockError) {
        return res.status(400).json({
          message: 'Stock insuficiente',
          available: err.available,
          current: err.current
        })
      }
      throw err
    }

    return res.json(await enrichCart(updated))
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

    const variantIdNum = parsePositiveInt(variantId)
    if (!variantIdNum) {
      return res.status(400).json({ message: 'Variante inválida' })
    }
    const qty = parsePositiveInt(quantity, 9999)
    if (!qty) {
      return res.status(400).json({ message: 'Cantidad inválida' })
    }

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantIdNum },
      select: { stock: true, reservedStock: true }
    })
    if (!variant) return res.status(404).json({ message: 'Variante no encontrada' })

    const available = variant.stock - variant.reservedStock
    if (qty > available) {
      return res.status(400).json({ message: 'Stock insuficiente', available })
    }

    await prisma.cartItem.update({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: variantIdNum
        }
      },
      data: { quantity: qty }
    })

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: CART_INCLUDE
    })

    return res.json(await enrichCart(updated))
  } catch (error) {
    // El ítem ya no está en el carrito (lo quitaron desde otra pestaña, etc.)
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Ese producto ya no está en el carrito' })
    }
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// DELETE /cart/public/:uuid/items/:variantId — eliminar ítem
const removePublicCartItem = async (req, res) => {
  try {
    const { uuid, variantId } = req.params

    const variantIdNum = parsePositiveInt(variantId)
    if (!variantIdNum) {
      return res.status(400).json({ message: 'Variante inválida' })
    }

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productVariantId: variantIdNum }
    })

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: CART_INCLUDE
    })

    return res.json(await enrichCart(updated))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// Resuelve, para cada componente del combo (la "receta" en ProductBundleItem),
// cuál es la variante efectiva: la fija elegida por el admin, o la que el
// cliente eligió (buscada en `selections` por productBundleItemId). Valida
// que la variante elegida por el cliente realmente pertenezca a ese producto
// (viene de `item.product.variants`, que Prisma ya filtra por ese producto) y
// esté activa. Devuelve { error } o { resolved } — resolved incluye el stock
// de la variante efectiva para el chequeo posterior.
function resolveBundleComponents(bundle, selections) {
  const selectionList = Array.isArray(selections) ? selections : []
  const resolved = []

  for (const item of bundle.items) {
    let variant
    const isFree = item.productVariantId === null

    if (!isFree) {
      variant = item.productVariant
      if (!variant || !variant.isActive) return { error: 'Combo no disponible' }
    } else {
      const selection = selectionList.find((s) => Number(s.productBundleItemId) === item.id)
      if (!selection) return { error: `Debes elegir una opción para "${item.product.name}"` }
      variant = item.product.variants.find((v) => v.id === Number(selection.productVariantId))
      if (!variant) return { error: `La opción elegida para "${item.product.name}" no está disponible` }
    }

    resolved.push({
      productBundleItemId: item.id,
      isFree,
      productVariantId: variant.id,
      productName: item.product.name,
      recipeQuantity: item.quantity,
      // Disponible = stock - reservedStock (si el llamador no trae
      // reservedStock, como order.controller.js, cae a 0 y queda igual que
      // antes — ese flujo ya reserva de forma atómica por su cuenta).
      stock: Number(variant.stock) - Number(variant.reservedStock ?? 0),
    })
  }

  return { resolved }
}

// Valida que el combo esté activo, resuelve sus componentes (fijos + elegidos
// por el cliente) y verifica que cada uno tenga stock suficiente para la
// cantidad total solicitada (quantity del combo × quantity del componente).
async function validateBundleAvailability(bundleId, quantity, selections) {
  const bundle = await prisma.productBundle.findUnique({
    where: { id: bundleId },
    include: { items: { select: BUNDLE_RECIPE_SELECT } }
  })

  if (!bundle || !bundle.isActive) {
    return { error: 'Combo no disponible' }
  }

  const { error, resolved } = resolveBundleComponents(bundle, selections)
  if (error) return { error }

  for (const component of resolved) {
    const required = quantity * component.recipeQuantity
    if (required > component.stock) {
      return {
        error: `"${component.productName}" no tiene stock suficiente para este combo`,
        available: component.stock,
        productName: component.productName,
      }
    }
  }

  return { bundle, resolved }
}

// Reemplaza en `tx` las selecciones guardadas de un CartBundleItem por las
// recién resueltas (solo los componentes "libres" necesitan fila).
async function replaceCartBundleSelections(tx, cartBundleItemId, resolved) {
  await tx.cartBundleItemSelection.deleteMany({ where: { cartBundleItemId } })
  const freeOnes = resolved.filter((r) => r.isFree)
  if (freeOnes.length) {
    await tx.cartBundleItemSelection.createMany({
      data: freeOnes.map((r) => ({
        cartBundleItemId,
        productBundleItemId: r.productBundleItemId,
        productVariantId: r.productVariantId,
      }))
    })
  }
}

// POST /cart/public/:uuid/bundles — agregar combo (valida stock por componente)
const addPublicBundleItem = async (req, res) => {
  try {
    const { uuid } = req.params
    const { bundleId, quantity = 1, selections } = req.body

    const bundleIdNum = parsePositiveInt(bundleId)
    if (!bundleIdNum) {
      return res.status(400).json({ message: 'bundleId requerido' })
    }
    const qtyNum = parsePositiveInt(quantity, 9999)
    if (!qtyNum) {
      return res.status(400).json({ message: 'Cantidad inválida' })
    }

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    // Mismo problema que en addPublicCartItem: leer currentQty y escribir
    // newQty en pasos separados permite que dos clics casi simultáneos
    // pisen la cantidad del otro. El lock sobre la fila del carrito serializa
    // ambas operaciones para este mismo carrito.
    let updated
    try {
      updated = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM Cart WHERE id = ${cart.id} FOR UPDATE`

        const existing = await tx.cartBundleItem.findUnique({
          where: { cartId_bundleId: { cartId: cart.id, bundleId: bundleIdNum } }
        })

        const currentQty = existing?.quantity ?? 0
        const newQty = currentQty + qtyNum

        const { error, available, resolved } = await validateBundleAvailability(bundleIdNum, newQty, selections)
        if (error) throw new BundleValidationError(error, available)

        const cartBundleItem = await tx.cartBundleItem.upsert({
          where: { cartId_bundleId: { cartId: cart.id, bundleId: bundleIdNum } },
          update: { quantity: newQty },
          create: { cartId: cart.id, bundleId: bundleIdNum, quantity: qtyNum }
        })
        await replaceCartBundleSelections(tx, cartBundleItem.id, resolved)

        return tx.cart.findUnique({ where: { id: cart.id }, include: CART_INCLUDE })
      })
    } catch (err) {
      if (err instanceof BundleValidationError) {
        return res.status(400).json({ message: err.message, available: err.available })
      }
      throw err
    }

    return res.json(await enrichCart(updated))
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// PUT /cart/public/:uuid/bundles/:bundleId — actualizar cantidad y/o selección (valida stock)
const updatePublicBundleItem = async (req, res) => {
  try {
    const { uuid, bundleId } = req.params
    const { quantity, selections } = req.body

    const bundleIdNum = parsePositiveInt(bundleId)
    if (!bundleIdNum) {
      return res.status(400).json({ message: 'Combo inválido' })
    }
    const qty = parsePositiveInt(quantity, 9999)
    if (!qty) {
      return res.status(400).json({ message: 'Cantidad inválida' })
    }

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    const { error, available, resolved } = await validateBundleAvailability(bundleIdNum, qty, selections)
    if (error) return res.status(400).json({ message: error, available })

    await prisma.$transaction(async (tx) => {
      const cartBundleItem = await tx.cartBundleItem.update({
        where: { cartId_bundleId: { cartId: cart.id, bundleId: bundleIdNum } },
        data: { quantity: qty }
      })
      await replaceCartBundleSelections(tx, cartBundleItem.id, resolved)
    })

    const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: CART_INCLUDE })
    return res.json(await enrichCart(updated))
  } catch (error) {
    // El combo ya no está en el carrito (lo quitaron desde otra pestaña, etc.)
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Ese combo ya no está en el carrito' })
    }
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// DELETE /cart/public/:uuid/bundles/:bundleId — eliminar combo del carrito
// (las selecciones se eliminan en cascada vía onDelete: Cascade del schema)
const removePublicBundleItem = async (req, res) => {
  try {
    const { uuid, bundleId } = req.params

    const bundleIdNum = parsePositiveInt(bundleId)
    if (!bundleIdNum) {
      return res.status(400).json({ message: 'Combo inválido' })
    }

    const cart = await prisma.cart.findUnique({ where: { uuid, status: 'ACTIVE' } })
    if (!cart) return res.status(404).json({ message: 'Carrito no encontrado' })

    await prisma.cartBundleItem.deleteMany({
      where: { cartId: cart.id, bundleId: bundleIdNum }
    })

    const updated = await prisma.cart.findUnique({ where: { id: cart.id }, include: CART_INCLUDE })
    return res.json(await enrichCart(updated))
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
  removePublicCartItem,
  addPublicBundleItem,
  updatePublicBundleItem,
  removePublicBundleItem,
  resolveBundleComponents,
}
