const { randomBytes } = require('crypto')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { notifyOrderCreated } = require('../../services/notification.service')

// ── Constantes de negocio ──────────────────────────────────────────────────────
const ALLOWED_CURRENCIES = new Set(['COP', 'USD'])
const MAX_ITEMS_PER_ORDER = 50

// ── createOrder ───────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const idempotencyKey = req.headers['x-idempotency-key']

  try {
    // Obligatoria: sin ella, cualquier retry crea una orden duplicada con su propia
    // reserva de stock. El cliente debe generar un UUID por intento de compra.
    if (!idempotencyKey || typeof idempotencyKey !== 'string' || idempotencyKey.trim().length < 8 || idempotencyKey.length > 128) {
      return res.status(400).json({ message: 'Cabecera X-Idempotency-Key requerida (8–128 caracteres)' })
    }

    const existing = await prisma.order.findUnique({
      where: { idempotencyKey },
      include: { items: true }
    })
    if (existing) return res.status(200).json({ message: 'Orden ya procesada', order: existing })

    const {
      userId, firstName, lastName, documentNumber, email,
      phoneNumber, departament, municipality, address,
      additionalDetails, items, currency
    } = req.body

    // FIX 2 — CURRENCY WHITELIST
    // Nunca confiar en strings libres del cliente para campos críticos.
    const normalizedCurrency = String(currency || 'COP').toUpperCase().trim()
    if (!ALLOWED_CURRENCIES.has(normalizedCurrency)) {
      return res.status(400).json({
        message: `Moneda no soportada. Permitidas: ${[...ALLOWED_CURRENCIES].join(', ')}`
      })
    }

    // FIX 3 — CAMPOS REQUERIDOS
    const requiredFields = { firstName, lastName, documentNumber, phoneNumber, departament, municipality, address }
    const missing = Object.entries(requiredFields)
      .filter(([, v]) => !v || !String(v).trim())
      .map(([k]) => k)
    if (missing.length > 0) {
      return res.status(400).json({ message: `Campos requeridos faltantes: ${missing.join(', ')}` })
    }

    // FIX 4 — LÍMITE DE ÍTEMS (evita payloads abusivos y sobrecarga en BD)
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Se esperaba un array de ítems' })
    }
    if (items.length > MAX_ITEMS_PER_ORDER) {
      return res.status(400).json({ message: `Máximo ${MAX_ITEMS_PER_ORDER} ítems por orden` })
    }
    const seenVariants = new Set()
    for (const item of items) {
      if (seenVariants.has(item.productVariantId)) {
        return res.status(400).json({
          message: `productVariantId duplicado: ${item.productVariantId}`,
          productVariantId: item.productVariantId
        })
      }
      seenVariants.add(item.productVariantId)
    }
    for (const item of items) {
      if (!item.productVariantId) {
        return res.status(400).json({ message: 'Cada ítem debe tener productVariantId' })
      }
      const qty = Number(item.quantity)
      if (!Number.isInteger(qty) || qty <= 0 || qty > 9999) {
        return res.status(400).json({
          message: `Cantidad inválida para variante ${item.productVariantId} (1–9999)`,
          productVariantId: item.productVariantId
        })
      }
    }

    const variantIds = items.map(item => item.productVariantId)
    const orderNumber = `ORD-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`

    const order = await prisma.$transaction(async (tx) => {
      // FIX 5 — PRECIO DESDE BD (dentro de la transacción)
      // Leer aquí garantiza que usamos el precio comprometido al momento exacto
      // del pedido, no una lectura previa que pudo haber quedado desactualizada.
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
        select: { id: true, price: true, product: { select: { name: true } } }
      })
      const variantMap = Object.fromEntries(variants.map(v => [v.id, v]))

      for (const item of items) {
        const variant = variantMap[item.productVariantId]
        if (!variant) throw new Error(`VARIANT_NOT_FOUND:${item.productVariantId}`)
        // Comparar en centavos enteros evita falsos positivos/negativos por IEEE 754
        if (Math.round(Number(variant.price) * 100) !== Math.round(Number(item.unitPrice) * 100)) {
          throw new Error(`PRICE_MISMATCH:${item.productVariantId}:${Number(variant.price)}`)
        }
      }

      // FIX 6 — RESERVA ATÓMICA DE STOCK (compare-and-swap real)
      // Un solo UPDATE que evalúa la condición y aplica el cambio en una misma
      // operación a nivel de motor. Si otra transacción concurrente ya tomó el
      // stock disponible, esta instrucción afecta 0 filas → rollback automático.
      // Esto elimina completamente la race condition de sobreventa sin necesidad
      // de locks explícitos o servicios externos.
      //
      // Disponible = stock - reservedStock
      // El webhook libera reservedStock y descuenta stock al confirmar el pago.
      // Si el pago falla/caduca, el webhook libera la reserva sin tocar stock.
      for (const item of items) {
        const affected = await tx.$executeRaw`
          UPDATE ProductVariant
          SET reservedStock = reservedStock + ${Number(item.quantity)}
          WHERE id = ${item.productVariantId}
            AND (stock - reservedStock) >= ${Number(item.quantity)}
        `
        if (Number(affected) === 0) {
          const name = variantMap[item.productVariantId]?.product?.name ?? `variante ${item.productVariantId}`
          throw new Error(`INSUFFICIENT_STOCK:${item.productVariantId}:${name}`) // name may contain colons
        }
      }

      // Subtotal calculado con precios de BD, nunca con los del cliente
      const subtotal = items.reduce((acc, item) => {
        return acc + Number(variantMap[item.productVariantId].price) * Number(item.quantity)
      }, 0)

      // FIX 7 — IDEMPOTENCIA CONCURRENTE (blindaje total)
      // Si dos requests con la misma idempotencyKey llegan simultáneamente y
      // pasan el early-exit inicial, el primero en hacer commit gana el índice
      // @unique. El segundo recibe P2002, que capturamos en el catch.
      // Al estar dentro de la transacción, si este create falla, las reservas
      // de stock hechas arriba se revierten automáticamente.
      return await tx.order.create({
        data: {
          orderNumber,
          idempotencyKey,
          userId: userId || null,
          firstName, lastName, documentNumber,
          email: email || null,
          phoneNumber, departament, municipality, address,
          additionalDetails: additionalDetails || null,
          subtotal,
          total: subtotal,
          currency: normalizedCurrency,
          items: {
            create: items.map(item => {
              const variant = variantMap[item.productVariantId]
              return {
                productVariantId: item.productVariantId,
                productName: variant.product.name,
                quantity: Number(item.quantity),
                unitPrice: variant.price,
                subtotal: Number(variant.price) * Number(item.quantity)
              }
            })
          }
        },
        include: { items: true }
      })
    })

    notifyOrderCreated(order).catch(err => console.error('Error notificando ORDER_CREATED', err))
    return res.status(201).json({ message: 'Orden creada', order })

  } catch (error) {
    if (error.message?.startsWith('VARIANT_NOT_FOUND:')) {
      const variantId = error.message.split(':')[1]
      return res.status(400).json({ message: `Variante ${variantId} no encontrada` })
    }
    if (error.message?.startsWith('PRICE_MISMATCH:')) {
      const [, variantId, currentPrice] = error.message.split(':')
      return res.status(409).json({
        message: 'El precio del producto cambió',
        productVariantId: Number(variantId),
        currentPrice: Number(currentPrice)
      })
    }
    if (error.message?.startsWith('INSUFFICIENT_STOCK:')) {
      const parts = error.message.split(':')
      const variantId = parts[1]
      const productName = parts.slice(2).join(':')
      return res.status(409).json({
        message: `"${productName}" está agotado`,
        productVariantId: Number(variantId)
      })
    }
    // Dos requests simultáneas con la misma idempotencyKey: la primera ganó el
    // insert @unique, devolvemos la orden que ya existe.
    if (error?.code === 'P2002' && error?.meta?.target?.includes('idempotencyKey')) {
      if (idempotencyKey) {
        const existing = await prisma.order.findUnique({
          where: { idempotencyKey },
          include: { items: true }
        })
        if (existing) return res.status(200).json({ message: 'Orden ya procesada', order: existing })
      }
    }

    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}


const allOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            productVariant: true,
            returnItems: {
              select: { quantity: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      ok: true,
      orders
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno'
    });
  }
};


const searchOrder = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ ok: false, message: 'Query requerida' });
    }

    const term = q.trim();
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: term } },
          { email:       { contains: term } },
          { firstName:   { contains: term } },
          { lastName:    { contains: term } },
        ],
      },
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            productVariant: true,
            returnItems: { select: { quantity: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ ok: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
};

const filterOrderByDate = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from) {
      return res.status(400).json({ ok: false, message: 'Fecha de inicio requerida' });
    }

    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = to ? new Date(to) : new Date(from);
    toDate.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: fromDate, lte: toDate } },
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            productVariant: true,
            returnItems: { select: { quantity: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ ok: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
};

// Llama a esta función desde un cron cada 15 minutos.
// Cancela órdenes PENDING sin pago después de RESERVATION_TTL_MS y libera el stock reservado.
const RESERVATION_TTL_MS = 30 * 60 * 1000 // 30 minutos

const releaseExpiredReservations = async () => {
  const cutoff = new Date(Date.now() - RESERVATION_TTL_MS)

  const expiredOrders = await prisma.order.findMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff } },
    include: { items: { select: { productVariantId: true, quantity: true } } }
  })

  let released = 0
  for (const order of expiredOrders) {
    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: { id: order.id, status: 'PENDING' },
          data:  { status: 'CANCELLED' }
        })
        if (claimed.count === 0) return // otro proceso ya lo canceló

        for (const item of order.items) {
          if (!item.productVariantId) continue
          await tx.$executeRaw`
            UPDATE ProductVariant
            SET reservedStock = GREATEST(reservedStock - ${item.quantity}, 0)
            WHERE id = ${item.productVariantId}
          `
        }
      })
      released++
    } catch (err) {
      console.error(`Error liberando reserva orden ${order.id}:`, err)
    }
  }

  if (released > 0) console.log(`Reservas liberadas: ${released} órdenes`)
  return released
}

module.exports = {
  createOrder,
  allOrder,
  searchOrder,
  filterOrderByDate,
  releaseExpiredReservations,
}
