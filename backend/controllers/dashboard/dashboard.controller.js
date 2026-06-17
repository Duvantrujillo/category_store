const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      shipmentsByStatus,
      returnsLast30Days,
      returnsByStatus,
      ordersByStatus,
      revenueResult,
      revenueThisMonth,
      totalProducts,
      lowStockVariants,
      ordersThisMonth,
    ] = await Promise.all([
      prisma.shipment.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.returnRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.returnRequest.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID', createdAt: { gte: startOfMonth } } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.productVariant.count({ where: { stock: 0, isActive: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    const toMap = (arr) =>
      Object.fromEntries(arr.map((r) => [r.status, r._count.id]));

    return res.status(200).json({
      shipments: {
        ...toMap(shipmentsByStatus),
        total: shipmentsByStatus.reduce((s, r) => s + r._count.id, 0),
      },
      returns: {
        last30Days: returnsLast30Days,
        ...toMap(returnsByStatus),
        total: returnsByStatus.reduce((s, r) => s + r._count.id, 0),
      },
      orders: {
        ...toMap(ordersByStatus),
        total: ordersByStatus.reduce((s, r) => s + r._count.id, 0),
        thisMonth: ordersThisMonth,
      },
      revenue: {
        total: Number(revenueResult._sum.total ?? 0),
        thisMonth: Number(revenueThisMonth._sum.total ?? 0),
      },
      products: {
        active: totalProducts,
        lowStock: lowStockVariants,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error obteniendo estadísticas' });
  }
};

module.exports = { getStats };
