const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { buildSearchStems } = require('../../utils/search-stems');

const LIMIT = 5;

const globalSearch = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q || q.length < 2) {
      return res.status(200).json({ results: {}, total: 0 });
    }

    // AND de stems: cada palabra debe aparecer en algún campo, sin importar
    // el orden — una búsqueda de varias palabras ("porton rojo") no debe
    // exigir que el campo contenga la frase completa como un solo substring.
    const stems = buildSearchStems(q);
    // Los pedidos contienen datos personales de clientes — solo se buscan
    // si el usuario realmente tiene permiso para ver órdenes, no por el
    // simple hecho de estar autenticado.
    const canViewOrders = req.user?.permissions?.includes('orders.view');

    const [categories, brands, products, orders] = await Promise.all([
      prisma.category.findMany({
        where: {
          isActive: true,
          AND: stems.map((s) => ({ OR: [{ name: { contains: s } }, { slug: { contains: s } }] })),
        },
        select: { id: true, name: true, slug: true },
        take: LIMIT,
      }),

      prisma.brand.findMany({
        where: {
          AND: stems.map((s) => ({ OR: [{ name: { contains: s } }, { slug: { contains: s } }] })),
        },
        select: { id: true, name: true, slug: true },
        take: LIMIT,
      }),

      prisma.product.findMany({
        where: {
          AND: stems.map((s) => ({ OR: [{ name: { contains: s } }, { slug: { contains: s } }] })),
        },
        select: { id: true, name: true, slug: true },
        take: LIMIT,
      }),

      canViewOrders
        ? prisma.order.findMany({
            where: {
              AND: stems.map((s) => ({
                OR: [
                  { orderNumber: { contains: s } },
                  { email: { contains: s } },
                  { firstName: { contains: s } },
                  { lastName: { contains: s } },
                ],
              })),
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
          })
        : Promise.resolve([]),
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
