const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 50;

/**
 * GET /search/public
 * Parámetros:
 *   q          texto libre (mín. 2 chars)
 *   page       número de página (default 1)
 *   limit      resultados por página (default 20, max 50)
 *   categoryId filtrar por categoría
 *   brandId    filtrar por marca
 *   minPrice   precio mínimo
 *   maxPrice   precio máximo
 *   sortBy     'newest' | 'price_asc' | 'price_desc' | 'name' (default)
 */
const publicSearch = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q || q.length < 2) {
      return res.status(200).json({ data: [], total: 0, page: 1, limit: DEFAULT_LIMIT, totalPages: 0, query: q });
    }

    const page       = Math.max(1, parseInt(req.query.page)  || 1);
    const limit      = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
    const skip       = (page - 1) * limit;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : undefined;
    const brandId    = req.query.brandId    ? parseInt(req.query.brandId)    : undefined;
    const minPrice   = req.query.minPrice   ? parseFloat(req.query.minPrice) : undefined;
    const maxPrice   = req.query.maxPrice   ? parseFloat(req.query.maxPrice) : undefined;
    const sortBy     = req.query.sortBy || 'name';

    // ── Filtro base ────────────────────────────────────────────────────────
    const where = {
      isActive: true,
      stock: { gt: 0 },  // solo con stock disponible
      product: {
        status: 'ACTIVE',
        ...(categoryId && { categoryId }),
        ...(brandId    && { brandId    }),
      },
      // Rango de precio
      ...(minPrice !== undefined || maxPrice !== undefined
        ? { price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          }}
        : {}),
      // Búsqueda en múltiples campos — un solo OR abarca todo
      OR: [
        { sku:     { contains: q } },
        { product: { name:        { contains: q } } },
        { product: { description: { contains: q } } },
        { product: { brand:    { name: { contains: q } } } },
        { product: { category: { name: { contains: q } } } },
        { attributes: { some: { attributeValue: { value: { contains: q } } } } },
      ],
    };

    // ── Orden ──────────────────────────────────────────────────────────────
    const orderBy = {
      price_asc:  { price: 'asc'  },
      price_desc: { price: 'desc' },
      newest:     { createdAt: 'desc' },
      name:       [{ product: { name: 'asc' } }, { id: 'asc' }],
    }[sortBy] ?? [{ product: { name: 'asc' } }, { id: 'asc' }];

    // ── Consulta paralela: datos + total ───────────────────────────────────
    const [variants, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id:        true,
          price:     true,
          stock:     true,
          isDefault: true,
          sku:       true,
          attributes: {
            select: {
              attributeValue: {
                select: {
                  value:     true,
                  attribute: { select: { name: true } },
                },
              },
            },
          },
          images: {
            where:  { slot: 1 },
            select: { imageUrl: true, slot: true },
            take:   1,
          },
          product: {
            select: {
              id:          true,
              name:        true,
              slug:        true,
              description: true,
              category: { select: { id: true, name: true, slug: true } },
              brand:    { select: { id: true, name: true, slug: true, logoUrl: true } },
            },
          },
        },
      }),
      prisma.productVariant.count({ where }),
    ]);

    return res.status(200).json({
      data:       variants,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      query:      q,
    });
  } catch (error) {
    console.error('[publicSearch]', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { publicSearch };
