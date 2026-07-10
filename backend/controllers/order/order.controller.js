const { randomBytes } = require('crypto')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { notifyOrderCreated } = require('../../services/notification.service')
const { resolveDiscount } = require('../discount-code/discount_code.controller')
const { resolveBundleComponents } = require('../cart/cart-public.controller')
const { getActivePromotions, attachPromotionPricing } = require('../../utils/promotion-pricing')
const { buildSearchStems } = require('../../utils/search-stems')

// ── Constantes de negocio ──────────────────────────────────────────────────────
const ALLOWED_CURRENCIES = new Set(['COP', 'USD'])
const MAX_ITEMS_PER_ORDER = 50
const MAX_BUNDLES_PER_ORDER = 20
const SHIPPING_COST = 11000

// Combos de una orden, para las vistas admin (listado/búsqueda/filtro) — sin
// esto el admin nunca ve que una orden incluye un combo, solo sus productos
// sueltos. `items` es el desglose de qué productos componen cada combo.
const ORDER_BUNDLE_ITEMS_INCLUDE = {
  select: {
    id: true,
    bundleName: true,
    quantity: true,
    unitPrice: true,
    subtotal: true,
    items: {
      select: {
        productName: true,
        quantity: true,
        productVariant: { select: { sku: true } }
      }
    }
  }
}

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
      include: { items: true, bundleItems: { include: { items: true } } }
    })
    if (existing) return res.status(200).json({ message: 'Orden ya procesada', order: existing })

    const {
      firstName, lastName, documentNumber, email,
      phoneNumber, departament, municipality, address,
      additionalDetails, items, bundleItems, currency, discountCode, cartUuid
    } = req.body
    // `/order/create` es pública (sin sesión) — nunca se confía en un
    // `userId` enviado por el cliente para asociar el pedido a una cuenta.

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
    const rawItems = Array.isArray(items) ? items : []
    const rawBundleItems = Array.isArray(bundleItems) ? bundleItems : []

    if (rawItems.length === 0 && rawBundleItems.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' })
    }
    if (rawItems.length > MAX_ITEMS_PER_ORDER) {
      return res.status(400).json({ message: `Máximo ${MAX_ITEMS_PER_ORDER} ítems por orden` })
    }
    if (rawBundleItems.length > MAX_BUNDLES_PER_ORDER) {
      return res.status(400).json({ message: `Máximo ${MAX_BUNDLES_PER_ORDER} combos por orden` })
    }
    const seenVariants = new Set()
    for (const item of rawItems) {
      if (seenVariants.has(item.productVariantId)) {
        return res.status(400).json({
          message: `productVariantId duplicado: ${item.productVariantId}`,
          productVariantId: item.productVariantId
        })
      }
      seenVariants.add(item.productVariantId)
    }
    for (const item of rawItems) {
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

    const seenBundles = new Set()
    for (const bundleItem of rawBundleItems) {
      if (seenBundles.has(bundleItem.bundleId)) {
        return res.status(400).json({
          message: `bundleId duplicado: ${bundleItem.bundleId}`,
          bundleId: bundleItem.bundleId
        })
      }
      seenBundles.add(bundleItem.bundleId)
    }
    for (const bundleItem of rawBundleItems) {
      if (!bundleItem.bundleId) {
        return res.status(400).json({ message: 'Cada combo debe tener bundleId' })
      }
      const qty = Number(bundleItem.quantity)
      if (!Number.isInteger(qty) || qty <= 0 || qty > 9999) {
        return res.status(400).json({
          message: `Cantidad inválida para el combo ${bundleItem.bundleId} (1–9999)`,
          bundleId: bundleItem.bundleId
        })
      }
    }

    const variantIds = rawItems.map(item => item.productVariantId)
    const bundleIds = rawBundleItems.map(bundleItem => bundleItem.bundleId)
    const orderNumber = `ORD-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`

    const order = await prisma.$transaction(async (tx) => {
      // FIX 5 — PRECIO DESDE BD (dentro de la transacción)
      // Leer aquí garantiza que usamos el precio comprometido al momento exacto
      // del pedido, no una lectura previa que pudo haber quedado desactualizada.
      const rawVariants = await tx.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
        select: { id: true, price: true, product: { select: { id: true, name: true, categoryId: true, brandId: true } } }
      })
      // Precio ya con la promoción activa aplicada (si corresponde) — es el
      // único precio que se valida y se cobra de acá en adelante.
      const activePromotions = await getActivePromotions(tx)
      const variants = attachPromotionPricing(rawVariants, activePromotions)
      const variantMap = Object.fromEntries(variants.map(v => [v.id, v]))

      for (const item of rawItems) {
        const variant = variantMap[item.productVariantId]
        if (!variant) {
          // No vino en la consulta de arriba (no existe o quedó inactiva) —
          // se busca aparte, sin el filtro isActive, solo para poder decir
          // a qué producto pertenecía en vez de mostrar nada más que el id.
          const missing = await tx.productVariant.findUnique({
            where: { id: item.productVariantId },
            select: { sku: true, product: { select: { name: true } } }
          })
          const label = missing?.product?.name
            ? `${missing.product.name}${missing.sku ? ` (${missing.sku})` : ''}`
            : ''
          throw new Error(`VARIANT_NOT_FOUND:${item.productVariantId}:${label}`)
        }
        // Comparar en centavos enteros evita falsos positivos/negativos por IEEE 754
        if (Math.round(Number(variant.finalPrice) * 100) !== Math.round(Number(item.unitPrice) * 100)) {
          throw new Error(`PRICE_MISMATCH:${item.productVariantId}:${Number(variant.finalPrice)}`)
        }
      }

      // Combos: se leen íntegros desde la BD (nombre, precio, componentes) — el
      // cliente solo puede elegir bundleId + quantity + (si el componente es
      // "libre") qué variante quiere de cada producto; nunca el precio ni la
      // composición, así que no hay PRICE_MISMATCH posible para combos.
      const bundles = await tx.productBundle.findMany({
        where: { id: { in: bundleIds }, isActive: true },
        include: {
          items: {
            select: {
              id: true,
              quantity: true,
              productId: true,
              productVariantId: true,
              product: {
                select: {
                  name: true,
                  variants: { where: { isActive: true }, select: { id: true, stock: true, isActive: true } }
                }
              },
              productVariant: { select: { id: true, isActive: true, stock: true } },
            }
          }
        }
      })
      const bundleMap = Object.fromEntries(bundles.map(b => [b.id, b]))
      // bundleId -> componentes ya resueltos (variante fija o elegida por el cliente)
      const resolvedBundleComponents = {}

      for (const bundleItem of rawBundleItems) {
        const bundle = bundleMap[bundleItem.bundleId]
        if (!bundle) throw new Error(`BUNDLE_NOT_FOUND:${bundleItem.bundleId}`)

        const { error, resolved } = resolveBundleComponents(bundle, bundleItem.selections)
        if (error) throw new Error(`BUNDLE_SELECTION:${bundleItem.bundleId}:${error}`)

        resolvedBundleComponents[bundleItem.bundleId] = resolved
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
      for (const item of rawItems) {
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

      // Misma reserva atómica, pero por cada componente ya resuelto de cada
      // combo — la cantidad requerida es quantity del combo × quantity del
      // componente dentro de la receta. Si un solo componente de un solo
      // combo no alcanza, toda la transacción (incluidos ítems sueltos ya
      // reservados) se revierte.
      for (const bundleItem of rawBundleItems) {
        const resolved = resolvedBundleComponents[bundleItem.bundleId]
        for (const component of resolved) {
          const requiredQty = Number(bundleItem.quantity) * component.recipeQuantity
          const affected = await tx.$executeRaw`
            UPDATE ProductVariant
            SET reservedStock = reservedStock + ${requiredQty}
            WHERE id = ${component.productVariantId}
              AND (stock - reservedStock) >= ${requiredQty}
          `
          if (Number(affected) === 0) {
            throw new Error(`INSUFFICIENT_STOCK:${component.productVariantId}:${component.productName}`)
          }
        }
      }

      // Subtotal calculado con precios de BD (ya con promoción aplicada), nunca con los del cliente
      const itemsSubtotal = rawItems.reduce((acc, item) => {
        return acc + Number(variantMap[item.productVariantId].finalPrice) * Number(item.quantity)
      }, 0)
      const bundlesSubtotal = rawBundleItems.reduce((acc, bundleItem) => {
        return acc + Number(bundleMap[bundleItem.bundleId].price) * Number(bundleItem.quantity)
      }, 0)
      const subtotal = itemsSubtotal + bundlesSubtotal

      // Cupón de descuento — validado y recalculado aquí (nunca confiar en un
      // monto de descuento enviado por el cliente). Los combos no participan
      // en la elegibilidad del cupón: ya tienen su propio precio fijo.
      let discount = null
      if (discountCode && rawItems.length > 0) {
        const cartLines = rawItems.map(item => ({
          variantId: item.productVariantId,
          unitPrice: variantMap[item.productVariantId].finalPrice,
          quantity: Number(item.quantity),
          product: variantMap[item.productVariantId].product
        }))
        discount = await resolveDiscount(tx, discountCode, cartLines)
      }

      const shippingCost = discount?.freeShipping ? 0 : SHIPPING_COST
      const discountAmount = discount?.discountAmount ?? 0
      const total = Math.max(0, subtotal + shippingCost - discountAmount)

      // FIX 7 — IDEMPOTENCIA CONCURRENTE (blindaje total)
      // Si dos requests con la misma idempotencyKey llegan simultáneamente y
      // pasan el early-exit inicial, el primero en hacer commit gana el índice
      // @unique. El segundo recibe P2002, que capturamos en el catch.
      // Al estar dentro de la transacción, si este create falla, las reservas
      // de stock hechas arriba se revierten automáticamente.
      // El cupón queda "reservado" en la orden desde ya (su monto ya está
      // descontado en `total`), pero NO se registra como DiscountCodeUsage
      // todavía — eso solo pasa cuando el webhook confirma el pago (PAID),
      // para que el maxUses del cupón cuente compras pagadas, no intentos.
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          idempotencyKey,
          cartUuid: cartUuid || null,
          firstName, lastName, documentNumber,
          email: email || null,
          phoneNumber, departament, municipality, address,
          additionalDetails: additionalDetails || null,
          subtotal,
          shippingCost,
          total,
          currency: normalizedCurrency,
          discountCodeId: discount?.discountCode.id ?? null,
          discountAmount,
          items: {
            create: rawItems.map(item => {
              const variant = variantMap[item.productVariantId]
              const quantity = Number(item.quantity)
              return {
                productVariantId: item.productVariantId,
                productName: variant.product.name,
                quantity,
                unitPrice: variant.finalPrice,
                subtotal: Number(variant.finalPrice) * quantity,
                promotionId: variant.promotion?.id ?? null,
                promotionDiscount: variant.promotion
                  ? (Number(variant.price) - Number(variant.finalPrice)) * quantity
                  : 0,
              }
            })
          },
          bundleItems: {
            create: rawBundleItems.map(bundleItem => {
              const bundle = bundleMap[bundleItem.bundleId]
              const resolved = resolvedBundleComponents[bundleItem.bundleId]
              return {
                bundleId: bundleItem.bundleId,
                bundleName: bundle.name,
                quantity: Number(bundleItem.quantity),
                unitPrice: bundle.price,
                subtotal: Number(bundle.price) * Number(bundleItem.quantity),
                items: {
                  create: resolved.map(component => ({
                    productVariantId: component.productVariantId,
                    productName: component.productName,
                    quantity: component.recipeQuantity,
                  }))
                }
              }
            })
          }
        },
        include: { items: true, bundleItems: { include: { items: true } } }
      })

      return createdOrder
    })

    notifyOrderCreated(order).catch(err => console.error('Error notificando ORDER_CREATED', err))
    return res.status(201).json({ message: 'Orden creada', order })

  } catch (error) {
    if (error.message?.startsWith('INVALID_COUPON:')) {
      return res.status(400).json({ message: error.message.slice('INVALID_COUPON:'.length) })
    }
    if (error.message?.startsWith('VARIANT_NOT_FOUND:')) {
      const [, variantId, ...rest] = error.message.split(':')
      const label = rest.join(':')
      return res.status(400).json({
        message: label ? `"${label}" ya no está disponible` : `Variante ${variantId} no encontrada`,
        productVariantId: Number(variantId)
      })
    }
    if (error.message?.startsWith('BUNDLE_NOT_FOUND:')) {
      const bundleId = error.message.split(':')[1]
      return res.status(400).json({ message: `Combo ${bundleId} no disponible`, bundleId: Number(bundleId) })
    }
    if (error.message?.startsWith('BUNDLE_SELECTION:')) {
      const [, bundleId, ...rest] = error.message.split(':')
      return res.status(400).json({ message: rest.join(':'), bundleId: Number(bundleId) })
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
          include: { items: true, bundleItems: { include: { items: true } } }
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
        user: { select: { id: true, name: true, email: true } },
        payment: true,
        items: {
          include: {
            productVariant: true,
            returnItems: {
              select: { quantity: true }
            }
          }
        },
        bundleItems: ORDER_BUNDLE_ITEMS_INCLUDE,
        discountCode: { select: { code: true, type: true, value: true } }
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

    // AND de stems: busca "juan perez" encontrando la orden aunque el nombre
    // esté partido en columnas separadas (firstName/lastName) — cada palabra
    // debe aparecer en ALGÚN campo, no necesariamente en el mismo.
    const stems = buildSearchStems(q);
    const orders = await prisma.order.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { orderNumber: { contains: s } },
            { email:       { contains: s } },
            { firstName:   { contains: s } },
            { lastName:    { contains: s } },
          ],
        })),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: true,
        items: {
          include: {
            productVariant: true,
            returnItems: { select: { quantity: true } },
          },
        },
        bundleItems: ORDER_BUNDLE_ITEMS_INCLUDE,
        discountCode: { select: { code: true, type: true, value: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ ok: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
};

// ── trackOrder ────────────────────────────────────────────────────────────────
// Endpoint público: el cliente consulta su pedido con el número de orden + el
// correo con el que lo registró. Sin autenticación, así que:
//   · Nunca revelamos si el orderNumber existe cuando el email no coincide
//     (mismo mensaje genérico) para evitar enumeración de pedidos.
//   · Solo devolvemos los campos necesarios para el seguimiento, nunca
//     documentNumber/phoneNumber/userId.
const NOT_FOUND_MSG = 'Pedido no encontrado. Verifica el número de pedido y el correo electrónico.'

const trackOrder = async (req, res) => {
  try {
    const { orderNumber, email } = req.query

    if (!orderNumber || typeof orderNumber !== 'string' || !orderNumber.trim()) {
      return res.status(400).json({ ok: false, message: 'El número de pedido es requerido' })
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ ok: false, message: 'El correo electrónico es requerido' })
    }

    const normalizedOrderNumber = orderNumber.trim().toUpperCase()
    const normalizedEmail = email.trim().toLowerCase()

    const order = await prisma.order.findUnique({
      where: { orderNumber: normalizedOrderNumber },
      include: {
        items: {
          select: {
            productName: true, quantity: true, unitPrice: true, subtotal: true,
            productVariant: {
              select: { images: { select: { imageUrl: true }, orderBy: { slot: 'asc' }, take: 1 } }
            }
          }
        },
        payment: { select: { status: true, paymentMethod: true, amount: true, currency: true } },
        shipment: {
          select: {
            status: true, carrier: true, trackingNumber: true, shippedAt: true, deliveredAt: true,
            history: {
              select: { status: true, note: true, createdAt: true },
              orderBy: { createdAt: 'asc' }
            }
          }
        },
        discountCode: { select: { code: true, type: true } }
      }
    })

    if (!order || !order.email || order.email.trim().toLowerCase() !== normalizedEmail) {
      return res.status(404).json({ ok: false, message: NOT_FOUND_MSG })
    }

    return res.status(200).json({
      ok: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        firstName: order.firstName,
        lastName: order.lastName,
        departament: order.departament,
        municipality: order.municipality,
        address: order.address,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        total: order.total,
        currency: order.currency,
        items: order.items,
        payment: order.payment,
        shipment: order.shipment,
        discountCode: order.discountCode,
        discountAmount: order.discountAmount,
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ ok: false, message: 'Error interno' })
  }
}

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
        user: { select: { id: true, name: true, email: true } },
        payment: true,
        items: {
          include: {
            productVariant: true,
            returnItems: { select: { quantity: true } },
          },
        },
        bundleItems: ORDER_BUNDLE_ITEMS_INCLUDE,
        discountCode: { select: { code: true, type: true, value: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ ok: true, orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: 'Error interno' });
  }
};

// Solo se borran canceladas con al menos este tiempo de antigüedad — nunca
// las recientes. Evita que una cancelación de hace 5 minutos (por error, o
// que el cliente todavía podría reclamar) desaparezca junto con las viejas.
// Fijo en el backend a propósito: el cliente no puede mandar un umbral
// distinto, así que esta regla siempre se cumple sin importar qué pida el
// frontend.
const CANCELLED_ORDER_RETENTION_MS = 15 * 24 * 60 * 60 * 1000 // 15 días

// DELETE /order/cancelled — borra en bloque las órdenes con status CANCELLED
// que llevan canceladas más de CANCELLED_ORDER_RETENTION_MS. Acción
// irreversible y de alto impacto: por eso vive detrás de un permiso separado
// (orders.delete) que nadie tiene por defecto, ni siquiera el rol admin — hay
// que asignarlo explícitamente.
//
// Antes de borrar la orden hay que borrar, en este orden, todo lo que
// referencia su id (MySQL no tiene ON DELETE CASCADE configurado para estas
// relaciones): ReturnItem/Refund (cuelgan de ReturnRequest), ReturnRequest,
// ShipmentHistory, Shipment, Payment, OrderBundleItem (esto sí cascadea a
// OrderBundleItemDetail solo), OrderItem y DiscountCodeUsage. En la práctica
// una orden CANCELLED normalmente solo tiene OrderItem/OrderBundleItem y tal
// vez un Payment — pero se limpia todo por si acaso, sin asumir nada.
//
// Excepción de seguridad: si el pago de la orden quedó APPROVED (el cliente
// SÍ pagó) mientras la orden se quedó en CANCELLED, es el caso límite que ya
// documentamos en webhook.controller.js — el cron canceló la orden por
// demora justo antes de que la confirmación del pago llegara tarde, y esa
// orden queda marcada con un ALERTA en los logs para revisión manual. Borrar
// esa orden destruiría la única evidencia de que se cobró sin entregar nada,
// así que se excluye del borrado en bloque sin importar la antigüedad —
// tiene que revisarla un humano primero (reembolso o reconciliación).
const deleteCancelledOrders = async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - CANCELLED_ORDER_RETENTION_MS)

    const cancelledOrders = await prisma.order.findMany({
      where: {
        status: 'CANCELLED',
        createdAt: { lt: cutoff },
        OR: [
          { payment: null },
          { payment: { status: { not: 'APPROVED' } } },
        ],
      },
      select: { id: true },
    })
    const orderIds = cancelledOrders.map((o) => o.id)

    if (orderIds.length === 0) {
      return res.status(200).json({ message: 'No hay órdenes canceladas antiguas para eliminar', deletedCount: 0 })
    }

    const returnRequests = await prisma.returnRequest.findMany({
      where: { orderId: { in: orderIds } },
      select: { id: true },
    })
    const returnRequestIds = returnRequests.map((r) => r.id)

    const shipments = await prisma.shipment.findMany({
      where: { orderId: { in: orderIds } },
      select: { id: true },
    })
    const shipmentIds = shipments.map((s) => s.id)

    await prisma.$transaction(async (tx) => {
      await tx.refund.deleteMany({ where: { returnRequestId: { in: returnRequestIds } } })
      await tx.returnItem.deleteMany({ where: { returnRequestId: { in: returnRequestIds } } })
      await tx.returnRequest.deleteMany({ where: { id: { in: returnRequestIds } } })

      await tx.shipmentHistory.deleteMany({ where: { shipmentId: { in: shipmentIds } } })
      await tx.shipment.deleteMany({ where: { id: { in: shipmentIds } } })

      await tx.payment.deleteMany({ where: { orderId: { in: orderIds } } })

      // OrderBundleItemDetail cascadea sola al borrar OrderBundleItem (onDelete: Cascade en el schema).
      await tx.orderBundleItem.deleteMany({ where: { orderId: { in: orderIds } } })
      await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } })

      await tx.discountCodeUsage.deleteMany({ where: { orderId: { in: orderIds } } })

      await tx.order.deleteMany({ where: { id: { in: orderIds } } })
    })

    return res.status(200).json({
      message: `${orderIds.length} orden${orderIds.length === 1 ? '' : 'es'} cancelada${orderIds.length === 1 ? '' : 's'} eliminada${orderIds.length === 1 ? '' : 's'}`,
      deletedCount: orderIds.length,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// Llama a esta función desde un cron cada 3 minutos (ver CLEANUP_INTERVAL_MS en app.js).
// Cancela órdenes PENDING sin pago y libera el stock reservado — pero no todas
// con el mismo plazo:
//   · Sin pago registrado, o con pago pero sin transactionId todavía (tarjeta,
//     o la persona nunca llegó a elegir un método en ePayco): 10 min alcanzan
//     de sobra a un comprador real, y no dejan un producto con poco stock
//     "secuestrado" por alguien que ya se fue.
//   · Con transactionId (ePayco ya confirmó la transacción con estado
//     "Pendiente" — típico de efectivo/PSE, que puede tardar horas en
//     confirmarse en un punto físico o el banco): 48 horas de margen, para no
//     cancelarle la compra a alguien que todavía va a pagar.
const RESERVATION_TTL_MS = 10 * 60 * 1000        // 10 minutos
const PENDING_PAYMENT_TTL_MS = 48 * 60 * 60 * 1000 // 48 horas

const releaseExpiredReservations = async () => {
  const shortCutoff = new Date(Date.now() - RESERVATION_TTL_MS)
  const longCutoff  = new Date(Date.now() - PENDING_PAYMENT_TTL_MS)

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      OR: [
        { createdAt: { lt: shortCutoff }, payment: null },
        { createdAt: { lt: shortCutoff }, payment: { is: { transactionId: null } } },
        { createdAt: { lt: longCutoff },  payment: { is: { transactionId: { not: null } } } },
      ]
    },
    include: {
      items: { select: { productVariantId: true, quantity: true } },
      bundleItems: {
        select: { quantity: true, items: { select: { productVariantId: true, quantity: true } } }
      }
    }
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

        // Por cada componente de cada combo, la cantidad reservada fue
        // quantity del combo × quantity del componente en la receta.
        for (const bundleItem of order.bundleItems) {
          for (const detail of bundleItem.items) {
            const releaseQty = bundleItem.quantity * detail.quantity
            await tx.$executeRaw`
              UPDATE ProductVariant
              SET reservedStock = GREATEST(reservedStock - ${releaseQty}, 0)
              WHERE id = ${detail.productVariantId}
            `
          }
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
  trackOrder,
  deleteCancelledOrders,
  releaseExpiredReservations,
}
