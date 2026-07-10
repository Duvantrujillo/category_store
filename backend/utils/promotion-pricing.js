const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Promociones ACTIVE, vigentes hoy y que aún no agotaron su usageLimit.
// Se pide una sola vez por request y se reutiliza contra todas las
// variantes/productos que esa respuesta vaya a devolver.
async function getActivePromotions(db = prisma) {
  const now = new Date();

  const promotions = await db.promotion.findMany({
    where: { status: "ACTIVE", startsAt: { lte: now }, expiresAt: { gte: now } },
    include: {
      _count: { select: { usages: true } },
      products: { select: { productId: true } },
      categories: { select: { categoryId: true } },
      brands: { select: { brandId: true } },
      variants: { select: { productVariantId: true } },
    },
    orderBy: [{ priority: "desc" }, { id: "asc" }],
  });

  return promotions.filter((p) => p.usageLimit == null || p._count.usages < p.usageLimit);
}

function matchesScope(promotion, { productId, categoryId, brandId, variantId }) {
  if (promotion.scope === "ALL_PRODUCTS") return true;

  if (promotion.scope === "PRODUCTS") {
    const inProducts = promotion.products.some((p) => p.productId === productId);
    if (!inProducts) return false;
    if (promotion.variants.length === 0) return true;
    return promotion.variants.some((v) => v.productVariantId === variantId);
  }

  if (promotion.scope === "CATEGORIES") {
    return categoryId != null && promotion.categories.some((c) => c.categoryId === categoryId);
  }

  if (promotion.scope === "BRANDS") {
    return brandId != null && promotion.brands.some((b) => b.brandId === brandId);
  }

  return false;
}

function computeDiscountedPrice(price, promotion) {
  const numericPrice = Number(price);
  if (promotion.type === "PERCENTAGE") {
    return Math.max(0, Math.round(numericPrice * (1 - Number(promotion.value) / 100)));
  }
  return Math.max(0, Math.round(numericPrice - Number(promotion.value)));
}

// `activePromotions` ya viene ordenada por priority desc, id asc — la
// primera que matchee el scope es la que gana (sin combinar promociones).
function pickPromotion(context, activePromotions) {
  for (const promotion of activePromotions) {
    if (matchesScope(promotion, context)) return promotion;
  }
  return null;
}

// Acepta una variante o un array de variantes. `overrideContext`, si se
// pasa, se usa como { productId, categoryId, brandId } para TODOS los items
// en vez de leerlo de `variant.product` — necesario en endpoints donde el
// producto es el nodo padre y las variantes no traen `.product` anidado
// (getPublicProductBySlug).
function attachPromotionPricing(variantOrList, activePromotions, overrideContext = null) {
  const isArray = Array.isArray(variantOrList);
  const list = isArray ? variantOrList : [variantOrList];

  const enriched = list.map((variant) => {
    const context = overrideContext ?? {
      productId: variant.productId ?? variant.product?.id ?? null,
      categoryId: variant.product?.categoryId ?? variant.product?.category?.id ?? null,
      brandId: variant.product?.brandId ?? variant.product?.brand?.id ?? null,
      variantId: variant.id,
    };

    const promotion = pickPromotion({ ...context, variantId: variant.id }, activePromotions);

    return {
      ...variant,
      finalPrice: promotion ? computeDiscountedPrice(variant.price, promotion) : Number(variant.price),
      promotion: promotion
        ? { id: promotion.id, name: promotion.name, type: promotion.type, value: Number(promotion.value) }
        : null,
    };
  });

  return isArray ? enriched : enriched[0];
}

module.exports = { getActivePromotions, attachPromotionPricing };
