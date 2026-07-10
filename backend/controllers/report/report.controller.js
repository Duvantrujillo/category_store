const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Parsea fechas opcionales del query string: ?from=2024-01-01&to=2024-12-31
function parseDateRange(query) {
  const where = {}
  if (query.from || query.to) {
    where.createdAt = {}
    if (query.from) where.createdAt.gte = new Date(query.from)
    if (query.to) {
      const to = new Date(query.to)
      to.setHours(23, 59, 59, 999)
      where.createdAt.lte = to
    }
  }
  return where
}

// GET /report/summary
// Totales generales: órdenes, ventas, devoluciones, reembolsos, envíos
const getSummary = async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query)

    const [
      totalOrders,
      paidOrders,
      cancelledOrders,
      totalReturns,
      pendingReturns,
      totalRefunds,
      processedRefunds,
      shipmentsByStatus,
      topProducts,
      topBundles,
    ] = await Promise.all([
      prisma.order.count({ where: dateFilter }),

      prisma.order.aggregate({
        where: { ...dateFilter, status: 'PAID' },
        _sum: { total: true },
        _count: true,
      }),

      prisma.order.count({ where: { ...dateFilter, status: 'CANCELLED' } }),

      prisma.returnRequest.count({ where: dateFilter }),

      prisma.returnRequest.count({ where: { ...dateFilter, status: 'PENDING' } }),

      prisma.refund.aggregate({
        where: dateFilter,
        _sum: { amount: true },
        _count: true,
      }),

      prisma.refund.aggregate({
        where: { ...dateFilter, status: 'PROCESSED' },
        _sum: { amount: true },
        _count: true,
      }),

      prisma.shipment.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      prisma.orderItem.groupBy({
        by: ['productName'],
        where: {
          order: { ...dateFilter, status: 'PAID' },
        },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      // Top combos vendidos — se cuentan aparte de los productos sueltos
      // porque su ingreso ya está representado en el total de la orden;
      // mezclarlos con topProducts duplicaría el revenue reportado.
      prisma.orderBundleItem.groupBy({
        by: ['bundleName'],
        where: {
          order: { ...dateFilter, status: 'PAID' },
        },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ])

    return res.json({
      orders: {
        total: totalOrders,
        paid: paidOrders._count,
        cancelled: cancelledOrders,
        revenue: Number(paidOrders._sum.total ?? 0),
      },
      returns: {
        total: totalReturns,
        pending: pendingReturns,
      },
      refunds: {
        total: totalRefunds._count,
        totalAmount: Number(totalRefunds._sum.amount ?? 0),
        processed: processedRefunds._count,
        processedAmount: Number(processedRefunds._sum.amount ?? 0),
      },
      shipments: shipmentsByStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
      topProducts: topProducts.map((p) => ({
        name: p.productName,
        quantity: p._sum.quantity,
        revenue: Number(p._sum.subtotal ?? 0),
      })),
      topBundles: topBundles.map((b) => ({
        name: b.bundleName,
        quantity: b._sum.quantity,
        revenue: Number(b._sum.subtotal ?? 0),
      })),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// GET /report/returns
// Devoluciones detalladas con auditoría de usuario
const getReturnsReport = async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query)
    const { status } = req.query

    const where = { ...dateFilter }
    if (status) where.status = status

    const [returns, byStatus, byResolution, byUser] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { orderNumber: true, firstName: true, lastName: true, total: true } },
          registeredBy: { select: { id: true, name: true, email: true } },
          approvedBy:   { select: { id: true, name: true, email: true } },
          refunds: { select: { status: true, amount: true } },
          items: {
            include: {
              orderItem: { select: { productName: true, unitPrice: true, quantity: true } },
            },
          },
        },
      }),

      prisma.returnRequest.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: { status: true },
      }),

      prisma.returnRequest.groupBy({
        by: ['resolution'],
        where: dateFilter,
        _count: { resolution: true },
      }),

      prisma.returnRequest.groupBy({
        by: ['registeredById'],
        where: { ...dateFilter, registeredById: { not: null } },
        _count: { registeredById: true },
        orderBy: { _count: { registeredById: 'desc' } },
        take: 10,
      }),
    ])

    // Enriquecer byUser con nombre del usuario
    const userIds = byUser.map((u) => u.registeredById).filter(Boolean)
    const users   = userIds.length
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : []
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    return res.json({
      records: returns,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
      byResolution: byResolution.map((r) => ({
        resolution: r.resolution ?? 'Sin definir',
        count: r._count.resolution,
      })),
      byUser: byUser.map((u) => ({
        user: userMap[u.registeredById] ?? null,
        count: u._count.registeredById,
      })),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// GET /report/refunds
// Reembolsos con quién los procesó
const getRefundsReport = async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query)

    const [refunds, byStatus, byProcessor, totals] = await Promise.all([
      prisma.refund.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        include: {
          returnRequest: {
            select: {
              id: true,
              status: true,
              order: { select: { orderNumber: true, firstName: true, lastName: true } },
            },
          },
          processedBy: { select: { id: true, name: true, email: true } },
          payment: { select: { reference: true, provider: true } },
        },
      }),

      prisma.refund.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: { status: true },
        _sum: { amount: true },
      }),

      prisma.refund.groupBy({
        by: ['processedById'],
        where: { ...dateFilter, processedById: { not: null } },
        _count: { processedById: true },
        _sum: { amount: true },
        orderBy: { _count: { processedById: 'desc' } },
        take: 10,
      }),

      prisma.refund.aggregate({
        where: dateFilter,
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const processorIds = byProcessor.map((p) => p.processedById).filter(Boolean)
    const processors   = processorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: processorIds } },
          select: { id: true, name: true, email: true },
        })
      : []
    const processorMap = Object.fromEntries(processors.map((u) => [u.id, u]))

    return res.json({
      records: refunds,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
        amount: Number(s._sum.amount ?? 0),
      })),
      byProcessor: byProcessor.map((p) => ({
        user: processorMap[p.processedById] ?? null,
        count: p._count.processedById,
        amount: Number(p._sum.amount ?? 0),
      })),
      totals: {
        count: totals._count,
        amount: Number(totals._sum.amount ?? 0),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// GET /report/shipments
// Envíos con historial de cambios y quién los realizó
const getShipmentsReport = async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query)
    const { status, carrier } = req.query

    const where = { ...dateFilter }
    if (status)  where.status  = status
    if (carrier) where.carrier = carrier

    const [shipments, byStatus, byCarrier, byOperator] = await Promise.all([
      prisma.shipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { orderNumber: true, firstName: true, lastName: true } },
          history: {
            orderBy: { createdAt: 'asc' },
            include: { updatedBy: { select: { id: true, name: true, email: true } } },
          },
        },
      }),

      prisma.shipment.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: { status: true },
      }),

      prisma.shipment.groupBy({
        by: ['carrier'],
        where: { ...dateFilter, carrier: { not: null } },
        _count: { carrier: true },
      }),

      // Quién actualiza más envíos
      prisma.shipmentHistory.groupBy({
        by: ['updatedById'],
        where: { updatedById: { not: null } },
        _count: { updatedById: true },
        orderBy: { _count: { updatedById: 'desc' } },
        take: 10,
      }),
    ])

    const operatorIds = byOperator.map((o) => o.updatedById).filter(Boolean)
    const operators   = operatorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: operatorIds } },
          select: { id: true, name: true, email: true },
        })
      : []
    const operatorMap = Object.fromEntries(operators.map((u) => [u.id, u]))

    return res.json({
      records: shipments,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
      byCarrier: byCarrier.map((c) => ({ carrier: c.carrier, count: c._count.carrier })),
      byOperator: byOperator.map((o) => ({
        user: operatorMap[o.updatedById] ?? null,
        count: o._count.updatedById,
      })),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// GET /report/sales
// Ventas por período con desglose de órdenes
const getSalesReport = async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query)

    const [orders, byStatus, revenue, topProducts, topBundles] = await Promise.all([
      prisma.order.findMany({
        where: { ...dateFilter, status: { in: ['PAID', 'REFUNDED'] } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          firstName: true,
          lastName: true,
          status: true,
          subtotal: true,
          shippingCost: true,
          total: true,
          currency: true,
          createdAt: true,
          items: {
            select: { productName: true, quantity: true, unitPrice: true, subtotal: true },
          },
          bundleItems: {
            select: {
              bundleName: true,
              quantity: true,
              unitPrice: true,
              subtotal: true,
              items: { select: { productName: true, quantity: true } },
            },
          },
        },
      }),

      prisma.order.groupBy({
        by: ['status'],
        where: dateFilter,
        _count: { status: true },
        _sum: { total: true },
      }),

      prisma.order.aggregate({
        where: { ...dateFilter, status: 'PAID' },
        _sum: { total: true },
        _avg: { total: true },
        _count: true,
      }),

      prisma.orderItem.groupBy({
        by: ['productName'],
        where: { order: { ...dateFilter, status: 'PAID' } },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { subtotal: 'desc' } },
        take: 10,
      }),

      // Top combos por ingresos — aparte de topProducts para no duplicar
      // revenue (el total del combo ya está incluido en order.total).
      prisma.orderBundleItem.groupBy({
        by: ['bundleName'],
        where: { order: { ...dateFilter, status: 'PAID' } },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { subtotal: 'desc' } },
        take: 10,
      }),
    ])

    return res.json({
      records: orders,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.status,
        total: Number(s._sum.total ?? 0),
      })),
      revenue: {
        total: Number(revenue._sum.total ?? 0),
        average: Number(revenue._avg.total ?? 0),
        count: revenue._count,
      },
      topProducts: topProducts.map((p) => ({
        name: p.productName,
        quantity: p._sum.quantity,
        revenue: Number(p._sum.subtotal ?? 0),
      })),
      topBundles: topBundles.map((b) => ({
        name: b.bundleName,
        quantity: b._sum.quantity,
        revenue: Number(b._sum.subtotal ?? 0),
      })),
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// GET /report/detailed
// Reporte consolidado: ventas brutas - reembolsos = ingreso neto
const getDetailedReport = async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query)

    const orders = await prisma.order.findMany({
      where: { ...dateFilter, status: { in: ['PAID', 'REFUNDED'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        address: true,
        municipality: true,
        departament: true,
        status: true,
        subtotal: true,
        shippingCost: true,
        total: true,
        currency: true,
        createdAt: true,
        payment: {
          select: { paymentMethod: true, provider: true, reference: true },
        },
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
            returnItems: { select: { quantity: true } },
          },
        },
        bundleItems: {
          select: {
            id: true,
            bundleName: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
            // Los combos no se pueden devolver por componente en el modelo
            // actual (ReturnItem solo referencia OrderItem) — no hay
            // returnItems que enlazar aquí.
            items: { select: { productName: true, quantity: true } },
          },
        },
        returns: {
          select: {
            id: true,
            status: true,
            resolution: true,
            reason: true,
            createdAt: true,
            registeredBy: { select: { name: true, email: true } },
            approvedBy:   { select: { name: true, email: true } },
            refunds: { select: { status: true, amount: true, method: true } },
            items: {
              select: {
                quantity: true,
                orderItem: { select: { productName: true, unitPrice: true } },
              },
            },
          },
        },
      },
    })

    let totalGross          = 0
    let totalShipping       = 0
    let totalRefunded       = 0
    let totalReturnedItems  = 0
    let totalReturnRequests = 0

    const enrichedOrders = orders.map((order) => {
      const gross    = Number(order.total)
      const shipping = Number(order.shippingCost ?? 0)

      // Solo las devoluciones COMPLETADAS tienen efecto financiero real
      const completedReturns = order.returns.filter((r) => r.status === 'COMPLETED')

      const refundedForOrder = completedReturns
        .flatMap((r) => r.refunds)
        .filter((rf) => rf.status === 'PROCESSED')
        .reduce((s, rf) => s + Number(rf.amount), 0)

      const returnedItemsQty = completedReturns.reduce(
        (s, r) => s + r.items.reduce((si, ri) => si + ri.quantity, 0),
        0
      )

      totalGross          += gross
      totalShipping       += shipping
      totalRefunded       += refundedForOrder
      totalReturnedItems  += returnedItemsQty
      totalReturnRequests += completedReturns.length

      return {
        id:                  order.id,
        orderNumber:         order.orderNumber,
        firstName:           order.firstName,
        lastName:            order.lastName,
        email:               order.email,
        phoneNumber:         order.phoneNumber,
        address:             order.address,
        municipality:        order.municipality,
        departament:         order.departament,
        status:              order.status,
        createdAt:           order.createdAt,
        paymentMethod:       order.payment?.paymentMethod ?? null,
        paymentProvider:     order.payment?.provider ?? null,
        paymentReference:    order.payment?.reference ?? null,
        subtotal:            Number(order.subtotal ?? 0),
        shippingCost:        shipping,
        grossTotal:          gross,
        refundedAmount:      refundedForOrder,
        netTotal:            gross - refundedForOrder,
        returnedItemsQty,
        returnRequestsCount: order.returns.length,
        items: order.items.map((item) => {
          const returnedQty      = item.returnItems.reduce((s, ri) => s + ri.quantity, 0)
          const returnedSubtotal = returnedQty * Number(item.unitPrice)
          return {
            productName:      item.productName,
            quantity:         item.quantity,
            unitPrice:        Number(item.unitPrice),
            subtotal:         Number(item.subtotal),
            returnedQty,
            returnedSubtotal,
            netSubtotal:      Number(item.subtotal) - returnedSubtotal,
          }
        }),
        // Combos vendidos en la orden — sin soporte de devolución por
        // componente todavía, por eso no hay returnedQty/returnedSubtotal.
        bundleItems: order.bundleItems.map((bundleItem) => ({
          bundleName: bundleItem.bundleName,
          quantity:   bundleItem.quantity,
          unitPrice:  Number(bundleItem.unitPrice),
          subtotal:   Number(bundleItem.subtotal),
          netSubtotal: Number(bundleItem.subtotal),
          components: bundleItem.items.map((detail) => ({
            productName: detail.productName,
            quantity:    detail.quantity,
          })),
        })),
        returns: order.returns.map((r) => ({
          status:        r.status,
          resolution:    r.resolution,
          reason:        r.reason,
          createdAt:     r.createdAt,
          registeredBy:  r.registeredBy,
          approvedBy:    r.approvedBy,
          refunds:       r.refunds.map((rf) => ({
            status: rf.status,
            amount: Number(rf.amount),
            method: rf.method,
          })),
          items: r.items.map((ri) => ({
            productName: ri.orderItem.productName,
            unitPrice:   Number(ri.orderItem.unitPrice),
            quantity:    ri.quantity,
          })),
        })),
      }
    })

    return res.json({
      summary: {
        ordersCount:         orders.length,
        grossRevenue:        totalGross,
        totalShipping,
        totalReturnRequests,
        totalReturnedItems,
        refundedAmount:      totalRefunded,
        netRevenue:          totalGross - totalRefunded,
      },
      orders: enrichedOrders,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

// GET /report/discount-codes
// Cupones usados: cuáles, cuántas veces y cuánto se descontó
const getDiscountCodeReport = async (req, res) => {
  try {
    const dateFilter = parseDateRange(req.query)

    const [usages, byDiscountCode, totals] = await Promise.all([
      prisma.discountCodeUsage.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        include: {
          discountCode: { select: { code: true, type: true, value: true } },
          order: { select: { orderNumber: true, firstName: true, lastName: true, status: true, total: true } },
        },
      }),

      prisma.discountCodeUsage.groupBy({
        by: ['discountCodeId'],
        where: dateFilter,
        _count: { discountCodeId: true },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10,
      }),

      prisma.discountCodeUsage.aggregate({
        where: dateFilter,
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const discountCodeIds = byDiscountCode.map((d) => d.discountCodeId)
    const discountCodes   = discountCodeIds.length
      ? await prisma.discountCode.findMany({
          where: { id: { in: discountCodeIds } },
          select: { id: true, code: true, type: true },
        })
      : []
    const discountCodeMap = Object.fromEntries(discountCodes.map((d) => [d.id, d]))

    return res.json({
      records: usages,
      byDiscountCode: byDiscountCode.map((d) => ({
        discountCode: discountCodeMap[d.discountCodeId] ?? null,
        count: d._count.discountCodeId,
        amount: Number(d._sum.amount ?? 0),
      })),
      totals: {
        count: totals._count,
        amount: Number(totals._sum.amount ?? 0),
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

module.exports = {
  getSummary,
  getReturnsReport,
  getRefundsReport,
  getShipmentsReport,
  getSalesReport,
  getDetailedReport,
  getDiscountCodeReport,
}
