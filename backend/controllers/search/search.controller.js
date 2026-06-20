const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LIMIT = 5;

const globalSearch = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q || q.length < 2) {
      return res.status(200).json({ results: {}, total: 0 });
    }

    const contains = q;

    const [categories, brands, products, orders] = await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,
          OR: [{ name: { contains } }, { slug: { contains } }],
        },
        select: { id: true, name: true, slug: true },
        take: LIMIT,
      }),

      prisma.brand.findMany({
        where: {
          OR: [{ name: { contains } }, { slug: { contains } }],
        },
        select: { id: true, name: true, slug: true },
        take: LIMIT,
      }),

      prisma.product.findMany({
        where: {
          OR: [{ name: { contains } }, { slug: { contains } }],
        },
        select: { id: true, name: true, slug: true },
        take: LIMIT,
      }),

      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains } },
            { email: { contains } },
            { firstName: { contains } },
            { lastName: { contains } },
          ],
        },
        select: {
          id: true,
          orderNumber: true,
          firstName: true,
          lastName: true,
          status: true,
        },
        take: LIMIT,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const total = categories.length + brands.length + products.length + orders.length;

    return res.status(200).json({
      results: { categories, brands, products, orders },
      total,
    });
  } catch (error) {
    console.error('[globalSearch]', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { globalSearch };
