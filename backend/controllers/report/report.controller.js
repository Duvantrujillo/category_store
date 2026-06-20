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

    const [orders, byStatus, revenue, topProducts] = await Promise.all([
      prisma.order.findMany({
        where: { ...dateFilter, status: { in: ['PAID', 'REFUNDED'] } },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          firstName: true,
          lastName: true,
          status: true,
          total: true,
          currency: true,
          createdAt: true,
          items: {
            select: { productName: true, quantity: true, unitPrice: true, subtotal: true },
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
}
