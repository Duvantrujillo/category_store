const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { buildSearchStems } = require("../../utils/search-stems");

const PROMOTION_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"];
const PROMOTION_SCOPES = ["ALL_PRODUCTS", "PRODUCTS", "CATEGORIES", "BRANDS"];
const PROMOTION_STATUSES = ["DRAFT", "ACTIVE", "PAUSED"];

// Relaciones de alcance incluidas al leer una promoción (para tabla/edición).
const PROMOTION_INCLUDE = {
  _count: { select: { usages: true } },
  products: { select: { product: { select: { id: true, name: true } } } },
  categories: { select: { category: { select: { id: true, name: true } } } },
  brands: { select: { brand: { select: { id: true, name: true } } } },
  variants: { select: { productVariant: { select: { id: true, sku: true, product: { select: { name: true } } } } } },
};

// Normaliza un array de ids que llega del body (productIds/categoryIds/brandIds/variantIds).
function parseIdArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value.map((v) => parseInt(v, 10)).filter((n) => Number.isInteger(n) && n > 0)
  )];
}

// Valida que el alcance elegido tenga la selección que le corresponde.
function validateScope({ scope, productIds, categoryIds, brandIds }) {
  if (scope === "PRODUCTS" && productIds.length === 0) {
    return "Selecciona al menos un producto para este alcance";
  }
  if (scope === "CATEGORIES" && categoryIds.length === 0) {
    return "Selecciona al menos una categoría para este alcance";
  }
  if (scope === "BRANDS" && brandIds.length === 0) {
    return "Selecciona al menos una marca para este alcance";
  }
  return null;
}

// Valida que los ids de productos/categorías/marcas/variantes efectivamente existan.
async function validateRestrictions({ productIds, categoryIds, brandIds, variantIds }) {
  if (productIds.length) {
    const count = await prisma.product.count({ where: { id: { in: productIds } } });
    if (count !== productIds.length) return "Uno o más productos seleccionados no existen";
  }

  if (categoryIds.length) {
    const count = await prisma.category.count({ where: { id: { in: categoryIds } } });
    if (count !== categoryIds.length) return "Una o más categorías seleccionadas no existen";
  }

  if (brandIds.length) {
    const count = await prisma.brand.count({ where: { id: { in: brandIds } } });
    if (count !== brandIds.length) return "Una o más marcas seleccionadas no existen";
  }

  if (variantIds.length) {
    const count = await prisma.productVariant.count({ where: { id: { in: variantIds } } });
    if (count !== variantIds.length) return "Una o más variantes seleccionadas no existen";
  }

  return null;
}

// Valida los campos comunes a create/update. Devuelve { error } si algo no
// es válido, o { data } con los valores ya normalizados/parseados.
function validateFields(body) {
  const {
    name, description, type, value, scope, minimumPurchase,
    allowCombination, usageLimit, usagePerCustomer, startsAt, expiresAt, status,
  } = body;

  if (!name || !name.trim()) {
    return { error: "El nombre es obligatorio" };
  }

  const normalizedName = name.trim();
  if (normalizedName.length > 150) {
    return { error: "El nombre no puede superar 150 caracteres" };
  }

  if (description && description.length > 500) {
    return { error: "La descripción no puede superar 500 caracteres" };
  }

  if (!type || !PROMOTION_TYPES.includes(type)) {
    return { error: "El tipo de promoción no es válido" };
  }

  const numericValue = Number(value);
  if (value === undefined || value === null || value === "" || isNaN(numericValue)) {
    return { error: "El valor de la promoción es obligatorio" };
  }

  if (type === "PERCENTAGE" && (numericValue <= 0 || numericValue > 100)) {
    return { error: "El porcentaje debe estar entre 1 y 100" };
  }

  if (type === "FIXED_AMOUNT" && numericValue <= 0) {
    return { error: "El monto fijo debe ser mayor a 0" };
  }

  if (!scope || !PROMOTION_SCOPES.includes(scope)) {
    return { error: "El alcance de la promoción no es válido" };
  }

  let numericMinPurchase = 0;
  if (minimumPurchase !== undefined && minimumPurchase !== null && minimumPurchase !== "") {
    numericMinPurchase = Number(minimumPurchase);
    if (isNaN(numericMinPurchase) || numericMinPurchase < 0) {
      return { error: "La compra mínima no puede ser negativa" };
    }
  }

  let allowCombinationValue = allowCombination;
  if (typeof allowCombinationValue === "string") allowCombinationValue = allowCombinationValue === "true";
  if (typeof allowCombinationValue !== "boolean") allowCombinationValue = false;

  let numericUsageLimit = null;
  if (usageLimit !== undefined && usageLimit !== null && usageLimit !== "") {
    numericUsageLimit = parseInt(usageLimit, 10);
    if (isNaN(numericUsageLimit) || numericUsageLimit <= 0) {
      return { error: "El límite de usos debe ser un número mayor a 0" };
    }
  }

  let numericUsagePerCustomer = null;
  if (usagePerCustomer !== undefined && usagePerCustomer !== null && usagePerCustomer !== "") {
    numericUsagePerCustomer = parseInt(usagePerCustomer, 10);
    if (isNaN(numericUsagePerCustomer) || numericUsagePerCustomer <= 0) {
      return { error: "El límite de usos por cliente debe ser un número mayor a 0" };
    }
  }

  if (!startsAt || !expiresAt) {
    return { error: "Las fechas de vigencia son obligatorias" };
  }

  const start = new Date(startsAt);
  const end = new Date(expiresAt);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: "Formato de fecha inválido" };
  }

  if (start >= end) {
    return { error: "La fecha de expiración debe ser posterior a la de inicio" };
  }

  let statusValue = status;
  if (!statusValue || !PROMOTION_STATUSES.includes(statusValue)) {
    statusValue = "DRAFT";
  }

  return {
    data: {
      name: normalizedName,
      description: description?.trim() || null,
      type,
      value: numericValue,
      scope,
      status: statusValue,
      minimumPurchase: numericMinPurchase,
      allowCombination: allowCombinationValue,
      usageLimit: numericUsageLimit,
      usagePerCustomer: numericUsagePerCustomer,
      startsAt: start,
      expiresAt: end,
    },
  };
}

const createPromotion = async (req, res) => {
  try {
    const { error, data } = validateFields(req.body);
    if (error) return res.status(400).json({ message: error });

    const productIds = data.scope === "PRODUCTS" ? parseIdArray(req.body.productIds) : [];
    const categoryIds = data.scope === "CATEGORIES" ? parseIdArray(req.body.categoryIds) : [];
    const brandIds = data.scope === "BRANDS" ? parseIdArray(req.body.brandIds) : [];
    const variantIds = data.scope === "PRODUCTS" ? parseIdArray(req.body.variantIds) : [];

    const scopeError = validateScope({ scope: data.scope, productIds, categoryIds, brandIds });
    if (scopeError) return res.status(400).json({ message: scopeError });

    const restrictionsError = await validateRestrictions({ productIds, categoryIds, brandIds, variantIds });
    if (restrictionsError) return res.status(400).json({ message: restrictionsError });

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.promotion.create({ data });

      if (productIds.length) {
        await tx.promotionProduct.createMany({
          data: productIds.map((productId) => ({ promotionId: created.id, productId })),
        });
      }
      if (categoryIds.length) {
        await tx.promotionCategory.createMany({
          data: categoryIds.map((categoryId) => ({ promotionId: created.id, categoryId })),
        });
      }
      if (brandIds.length) {
        await tx.promotionBrand.createMany({
          data: brandIds.map((brandId) => ({ promotionId: created.id, brandId })),
        });
      }
      if (variantIds.length) {
        await tx.promotionVariant.createMany({
          data: variantIds.map((productVariantId) => ({ promotionId: created.id, productVariantId })),
        });
      }

      return created;
    });

    return res.status(201).json({ message: "Promoción creada", data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const promotionExist = await prisma.promotion.findUnique({ where: { id: formId } });
    if (!promotionExist) {
      return res.status(404).json({ message: "No encontrado" });
    }

    const { error, data } = validateFields(req.body);
    if (error) return res.status(400).json({ message: error });

    const productIds = data.scope === "PRODUCTS" ? parseIdArray(req.body.productIds) : [];
    const categoryIds = data.scope === "CATEGORIES" ? parseIdArray(req.body.categoryIds) : [];
    const brandIds = data.scope === "BRANDS" ? parseIdArray(req.body.brandIds) : [];
    const variantIds = data.scope === "PRODUCTS" ? parseIdArray(req.body.variantIds) : [];

    const scopeError = validateScope({ scope: data.scope, productIds, categoryIds, brandIds });
    if (scopeError) return res.status(400).json({ message: scopeError });

    const restrictionsError = await validateRestrictions({ productIds, categoryIds, brandIds, variantIds });
    if (restrictionsError) return res.status(400).json({ message: restrictionsError });

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.promotion.update({ where: { id: formId }, data });

      // Reemplaza la selección completa de alcance por la nueva.
      await tx.promotionProduct.deleteMany({ where: { promotionId: formId } });
      await tx.promotionCategory.deleteMany({ where: { promotionId: formId } });
      await tx.promotionBrand.deleteMany({ where: { promotionId: formId } });
      await tx.promotionVariant.deleteMany({ where: { promotionId: formId } });

      if (productIds.length) {
        await tx.promotionProduct.createMany({
          data: productIds.map((productId) => ({ promotionId: formId, productId })),
        });
      }
      if (categoryIds.length) {
        await tx.promotionCategory.createMany({
          data: categoryIds.map((categoryId) => ({ promotionId: formId, categoryId })),
        });
      }
      if (brandIds.length) {
        await tx.promotionBrand.createMany({
          data: brandIds.map((brandId) => ({ promotionId: formId, brandId })),
        });
      }
      if (variantIds.length) {
        await tx.promotionVariant.createMany({
          data: variantIds.map((productVariantId) => ({ promotionId: formId, productVariantId })),
        });
      }

      return result;
    });

    return res.status(200).json({ message: "Promoción actualizada", data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const promotionExist = await prisma.promotion.findUnique({ where: { id: formId } });
    if (!promotionExist) {
      return res.status(404).json({ message: "No encontrado" });
    }

    const hasUsages = await prisma.promotionUsage.findFirst({ where: { promotionId: formId } });
    if (hasUsages) {
      return res.status(400).json({ message: "Tiene usos registrados asociados" });
    }

    await prisma.promotion.delete({ where: { id: formId } });

    return res.status(200).json({ message: "Promoción eliminada" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const allPromotion = async (req, res) => {
  try {
    const all = await prisma.promotion.findMany({
      include: PROMOTION_INCLUDE,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });

    if (all.length === 0) {
      return res.status(200).json({ message: "No existen registros aún" });
    }

    return res.status(200).json({ data: all });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const searchPromotion = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json({ data: [] });

    const stems = buildSearchStems(q);

    const promotions = await prisma.promotion.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { name: { contains: s } },
            { description: { contains: s } },
          ],
        })),
      },
      include: PROMOTION_INCLUDE,
      take: 20,
    });

    return res.status(200).json({ data: promotions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al buscar" });
  }
};

// Registra el uso "oficial" de cada promoción que aplicó en la orden (el que
// cuenta para su usageLimit) — se debe llamar SOLO cuando el pago se
// confirma como PAID (desde el webhook), nunca al crear la orden. La orden
// ya fue creada con el precio promocionado aplicado a cada línea, pero eso
// no consume el cupo de la promoción hasta este momento. Simétrico a
// `confirmDiscountUsage` en discount_code.controller.js.
async function confirmPromotionUsage(db, order) {
  const items = await db.orderItem.findMany({
    where: { orderId: order.id, promotionId: { not: null } },
    select: { promotionId: true, promotionDiscount: true },
  });
  if (!items.length) return;

  const byPromotion = new Map();
  for (const item of items) {
    byPromotion.set(
      item.promotionId,
      (byPromotion.get(item.promotionId) ?? 0) + Number(item.promotionDiscount)
    );
  }

  for (const [promotionId, amount] of byPromotion) {
    const promotion = await db.promotion.findUnique({ where: { id: promotionId } });
    if (!promotion) continue;

    const now = new Date();
    let stillValid = promotion.status === "ACTIVE" && now >= promotion.startsAt && now <= promotion.expiresAt;

    if (stillValid && promotion.usageLimit != null) {
      const usedCount = await db.promotionUsage.count({ where: { promotionId } });
      if (usedCount >= promotion.usageLimit) stillValid = false;
    }

    if (!stillValid) {
      console.warn(`Promoción ${promotion.name} ya no disponible al confirmar el pago de la orden ${order.id}; no se registra el uso.`);
      continue;
    }

    await db.promotionUsage.create({ data: { promotionId, orderId: order.id, amount } });
  }
}

module.exports = {
  createPromotion,
  updatePromotion,
  deletePromotion,
  allPromotion,
  searchPromotion,
  confirmPromotionUsage,
};
