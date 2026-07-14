const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { buildSearchStems } = require("../../utils/search-stems");

const PURCHASE_GIFT_STATUSES = ["DRAFT", "ACTIVE", "PAUSED"];

const PURCHASE_GIFT_INCLUDE = {
  _count: { select: { usages: true } },
  productVariant: {
    select: {
      id: true,
      sku: true,
      price: true,
      stock: true,
      reservedStock: true,
      isActive: true,
      product: { select: { id: true, name: true, mainImage: true } },
      images: { select: { imageUrl: true, slot: true }, orderBy: { slot: "asc" }, take: 1 },
      attributes: {
        select: {
          attributeValue: { select: { value: true, attribute: { select: { name: true } } } },
        },
      },
    },
  },
};

// Valida los campos comunes a create/update. Devuelve { error } o { data }
// con los valores ya normalizados/parseados — mismas reglas que Promotion
// (validateFields en promotion.controller.js), sin scope porque el regalo
// siempre apunta a una única variante puntual.
function validateFields(body) {
  const { name, description, minimumPurchase, productVariantId, quantity, usageLimit, startsAt, expiresAt, status } = body;

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

  const numericMinPurchase = Number(minimumPurchase);
  if (minimumPurchase === undefined || minimumPurchase === null || minimumPurchase === "" || isNaN(numericMinPurchase) || numericMinPurchase <= 0) {
    return { error: "La compra mínima debe ser mayor a 0" };
  }

  const numericVariantId = parseInt(productVariantId, 10);
  if (!Number.isInteger(numericVariantId) || numericVariantId <= 0) {
    return { error: "Debes seleccionar la variante que se va a obsequiar" };
  }

  let numericQuantity = 1;
  if (quantity !== undefined && quantity !== null && quantity !== "") {
    numericQuantity = parseInt(quantity, 10);
    if (!Number.isInteger(numericQuantity) || numericQuantity <= 0) {
      return { error: "La cantidad a obsequiar debe ser un número mayor a 0" };
    }
  }

  let numericUsageLimit = null;
  if (usageLimit !== undefined && usageLimit !== null && usageLimit !== "") {
    numericUsageLimit = parseInt(usageLimit, 10);
    if (isNaN(numericUsageLimit) || numericUsageLimit <= 0) {
      return { error: "El límite de usos debe ser un número mayor a 0" };
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
  if (!statusValue || !PURCHASE_GIFT_STATUSES.includes(statusValue)) {
    statusValue = "DRAFT";
  }

  return {
    data: {
      name: normalizedName,
      description: description?.trim() || null,
      minimumPurchase: numericMinPurchase,
      productVariantId: numericVariantId,
      quantity: numericQuantity,
      status: statusValue,
      usageLimit: numericUsageLimit,
      startsAt: start,
      expiresAt: end,
    },
  };
}

const createPurchaseGift = async (req, res) => {
  try {
    const { error, data } = validateFields(req.body);
    if (error) return res.status(400).json({ message: error });

    const variant = await prisma.productVariant.findUnique({ where: { id: data.productVariantId } });
    if (!variant || !variant.isActive) {
      return res.status(400).json({ message: "La variante seleccionada no existe o no está activa" });
    }

    const created = await prisma.purchaseGift.create({ data, include: PURCHASE_GIFT_INCLUDE });
    return res.status(201).json({ message: "Regalo creado", data: created });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const updatePurchaseGift = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const exists = await prisma.purchaseGift.findUnique({ where: { id: formId } });
    if (!exists) {
      return res.status(404).json({ message: "No encontrado" });
    }

    const { error, data } = validateFields(req.body);
    if (error) return res.status(400).json({ message: error });

    const variant = await prisma.productVariant.findUnique({ where: { id: data.productVariantId } });
    if (!variant || !variant.isActive) {
      return res.status(400).json({ message: "La variante seleccionada no existe o no está activa" });
    }

    const updated = await prisma.purchaseGift.update({ where: { id: formId }, data, include: PURCHASE_GIFT_INCLUDE });
    return res.status(200).json({ message: "Regalo actualizado", data: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const deletePurchaseGift = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const exists = await prisma.purchaseGift.findUnique({ where: { id: formId } });
    if (!exists) {
      return res.status(404).json({ message: "No encontrado" });
    }

    const hasUsages = await prisma.purchaseGiftUsage.findFirst({ where: { purchaseGiftId: formId } });
    if (hasUsages) {
      return res.status(400).json({ message: "Tiene usos registrados asociados" });
    }

    await prisma.purchaseGift.delete({ where: { id: formId } });
    return res.status(200).json({ message: "Regalo eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const allPurchaseGift = async (req, res) => {
  try {
    const all = await prisma.purchaseGift.findMany({
      include: PURCHASE_GIFT_INCLUDE,
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

const searchPurchaseGift = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json({ data: [] });

    const stems = buildSearchStems(q);

    const gifts = await prisma.purchaseGift.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { name: { contains: s } },
            { description: { contains: s } },
          ],
        })),
      },
      include: PURCHASE_GIFT_INCLUDE,
      take: 20,
    });

    return res.status(200).json({ data: gifts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al buscar" });
  }
};

// Registra el uso "oficial" del regalo que aplicó en la orden (el que cuenta
// para su usageLimit) — se debe llamar SOLO cuando el pago se confirma como
// PAID (desde el webhook), nunca al crear la orden. Simétrico a
// confirmPromotionUsage / confirmDiscountUsage.
async function confirmGiftUsage(db, order) {
  const items = await db.orderItem.findMany({
    where: { orderId: order.id, giftId: { not: null } },
    select: { giftId: true },
  });
  if (!items.length) return;

  const giftIds = new Set(items.map((i) => i.giftId));

  for (const giftId of giftIds) {
    const gift = await db.purchaseGift.findUnique({ where: { id: giftId } });
    if (!gift) continue;

    const now = new Date();
    let stillValid = gift.status === "ACTIVE" && now >= gift.startsAt && now <= gift.expiresAt;

    if (stillValid && gift.usageLimit != null) {
      const usedCount = await db.purchaseGiftUsage.count({ where: { purchaseGiftId: giftId } });
      if (usedCount >= gift.usageLimit) stillValid = false;
    }

    if (!stillValid) {
      console.warn(`Regalo ${gift.name} ya no disponible al confirmar el pago de la orden ${order.id}; no se registra el uso.`);
      continue;
    }

    await db.purchaseGiftUsage.create({ data: { purchaseGiftId: giftId, orderId: order.id } });
  }
}

module.exports = {
  createPurchaseGift,
  updatePurchaseGift,
  deletePurchaseGift,
  allPurchaseGift,
  searchPurchaseGift,
  confirmGiftUsage,
};
