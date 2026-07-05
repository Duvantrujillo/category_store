const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DISCOUNT_TYPES = ["PERCENTAGE", "FIXED", "FREE_SHIPPING"];

// Relaciones de restricción incluidas al leer un cupón (para tabla/edición).
const RESTRICTIONS_INCLUDE = {
  _count: { select: { usages: true } },
  products: { select: { product: { select: { id: true, name: true } } } },
  categories: { select: { category: { select: { id: true, name: true } } } },
  brands: { select: { brand: { select: { id: true, name: true } } } },
};

// Resuelve y valida un código de cupón contra las líneas del carrito.
// `db` puede ser el cliente prisma normal (preview de solo lectura) o el
// `tx` de una transacción (al crear la orden, para que el chequeo de
// maxUses quede dentro de la misma transacción atómica).
// `cartLines`: [{ unitPrice, quantity, product: { id, categoryId, brandId } }]
async function resolveDiscount(db, rawCode, cartLines) {
  const code = String(rawCode || "").trim().toUpperCase();
  if (!code) return null;

  const discount = await db.discountCode.findUnique({
    where: { code },
    include: {
      products: { select: { productId: true, product: { select: { name: true } } } },
      categories: { select: { categoryId: true, category: { select: { name: true } } } },
      brands: { select: { brandId: true, brand: { select: { name: true } } } },
    },
  });

  if (!discount) throw new Error("INVALID_COUPON:El cupón no existe");
  if (!discount.isActive) throw new Error("INVALID_COUPON:El cupón no está activo");

  const now = new Date();
  if (now < discount.startsAt) throw new Error("INVALID_COUPON:El cupón aún no está vigente");
  if (now > discount.expiresAt) throw new Error("INVALID_COUPON:El cupón ha expirado");

  if (discount.maxUses !== null) {
    const usedCount = await db.discountCodeUsage.count({ where: { discountCodeId: discount.id } });
    if (usedCount >= discount.maxUses) throw new Error("INVALID_COUPON:El cupón alcanzó su límite de usos");
  }

  const allowedProductIds = new Set(discount.products.map((p) => p.productId));
  const allowedCategoryIds = new Set(discount.categories.map((c) => c.categoryId));
  const allowedBrandIds = new Set(discount.brands.map((b) => b.brandId));

  // Dos modos de restricción distintos:
  //  · Categoría y/o marca → "todo o nada": la compra COMPLETA debe
  //    pertenecer a esa selección, o el cupón se rechaza entero.
  //  · Solo productos puntuales (sin categoría/marca) → el cupón se puede
  //    mezclar con cualquier otro producto del carrito; simplemente aplica
  //    (y descuenta) solo esas líneas específicas, no el resto del pedido.
  const hasCategoryOrBrandRestriction = allowedCategoryIds.size > 0 || allowedBrandIds.size > 0;
  const hasProductOnlyRestriction = allowedProductIds.size > 0 && !hasCategoryOrBrandRestriction;

  let eligibleLines = cartLines;

  if (hasCategoryOrBrandRestriction) {
    const allEligible = cartLines.every((line) =>
      allowedProductIds.has(line.product.id)
      || allowedCategoryIds.has(line.product.categoryId)
      || (line.product.brandId != null && allowedBrandIds.has(line.product.brandId))
    );
    if (!allEligible) {
      const allowedNames = [
        ...discount.products.map((p) => p.product.name),
        ...discount.categories.map((c) => `categoría ${c.category.name}`),
        ...discount.brands.map((b) => `marca ${b.brand.name}`),
      ];
      throw new Error(`INVALID_COUPON:Este cupón solo aplica si toda tu compra es de: ${allowedNames.join(", ")}`);
    }
  } else if (hasProductOnlyRestriction) {
    eligibleLines = cartLines.filter((line) => allowedProductIds.has(line.product.id));
    if (eligibleLines.length === 0) {
      const allowedNames = discount.products.map((p) => p.product.name);
      throw new Error(`INVALID_COUPON:Este cupón solo aplica a: ${allowedNames.join(", ")}`);
    }
  }

  // Sin restricciones o restringido por categoría/marca → elegible = todo el
  // carrito. Restringido solo por producto → elegible = solo esos productos.
  const eligibleSubtotal = eligibleLines.reduce((acc, line) => acc + Number(line.unitPrice) * line.quantity, 0);

  const minimumPurchase = Number(discount.minimumPurchase);
  if (minimumPurchase > 0 && eligibleSubtotal < minimumPurchase) {
    throw new Error(`INVALID_COUPON:La compra mínima para este cupón es $${minimumPurchase.toLocaleString("es-CO")}`);
  }

  // El descuento se calcula sobre lo elegible: el total de la orden cuando
  // no hay restricción de producto puntual, o solo el/los producto(s)
  // cuando el cupón está atado a productos específicos.
  let discountAmount = 0;
  let freeShipping = false;

  if (discount.type === "PERCENTAGE") {
    discountAmount = Math.round(eligibleSubtotal * Number(discount.value) / 100);
  } else if (discount.type === "FIXED") {
    discountAmount = Math.min(Number(discount.value), eligibleSubtotal);
  } else if (discount.type === "FREE_SHIPPING") {
    freeShipping = true;
  }

  // Desglose por producto — para que el frontend muestre "precio tachado →
  // precio final" solo en las líneas que realmente califican. Calculado acá
  // (backend) para que el frontend no "invente" cómo se reparte.
  const eligibleVariantIds = new Set(eligibleLines.map((l) => l.variantId));
  let lineDiscounts = [];
  if (discount.type === "PERCENTAGE") {
    const pct = Number(discount.value) / 100;
    lineDiscounts = cartLines
      .filter((line) => eligibleVariantIds.has(line.variantId))
      .map((line) => ({
        variantId: line.variantId,
        lineAmount: Math.round(Number(line.unitPrice) * line.quantity * (1 - pct)),
      }));
  } else if (discount.type === "FIXED") {
    // Reparte el monto fijo proporcionalmente al peso de cada línea elegible.
    lineDiscounts = cartLines
      .filter((line) => eligibleVariantIds.has(line.variantId))
      .map((line) => {
        const lineTotal = Number(line.unitPrice) * line.quantity;
        const share = eligibleSubtotal > 0 ? lineTotal / eligibleSubtotal : 0;
        return { variantId: line.variantId, lineAmount: Math.max(0, Math.round(lineTotal - discountAmount * share)) };
      });
  }

  return { discountCode: discount, discountAmount, freeShipping, lineDiscounts };
}

// Registra el uso "oficial" del cupón (el que cuenta para maxUses) — se debe
// llamar SOLO cuando el pago de la orden se confirma como PAID (desde el
// webhook), nunca al crear la orden. El pedido ya fue creado con el
// descuento aplicado a su `total`/`discountAmount`, pero eso no consume el
// cupo del cupón hasta este momento.
//
// Si para cuando se confirma el pago el cupón ya no es válido (se agotó por
// otras órdenes que se pagaron primero, expiró o se desactivó), no se
// registra el uso: el pedido ya fue cobrado a ese precio y eso no se
// revierte, pero el cupón no se cuenta de más para futuras compras.
// `db` es el `tx` de la transacción del webhook.
async function confirmDiscountUsage(db, order) {
  if (!order.discountCodeId) return;

  const discountCode = await db.discountCode.findUnique({ where: { id: order.discountCodeId } });
  if (!discountCode) return;

  const now = new Date();
  let stillValid = discountCode.isActive && now >= discountCode.startsAt && now <= discountCode.expiresAt;

  if (stillValid && discountCode.maxUses !== null) {
    const usedCount = await db.discountCodeUsage.count({ where: { discountCodeId: discountCode.id } });
    if (usedCount >= discountCode.maxUses) stillValid = false;
  }

  if (!stillValid) {
    console.warn(`Cupón ${discountCode.code} ya no disponible al confirmar el pago de la orden ${order.id}; no se registra el uso.`);
    return;
  }

  await db.discountCodeUsage.create({
    data: {
      discountCodeId: discountCode.id,
      orderId: order.id,
      amount: order.discountAmount,
    },
  });
}

// Preview público: valida un cupón contra el carrito actual sin crear orden.
const validateDiscountCode = async (req, res) => {
  try {
    const { code, items } = req.body;

    if (!code || !String(code).trim()) {
      return res.status(400).json({ message: "Ingresa un código de cupón" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    const variantIds = items
      .map((i) => parseInt(i.productVariantId, 10))
      .filter((n) => Number.isInteger(n) && n > 0);

    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true },
      select: { id: true, price: true, product: { select: { id: true, categoryId: true, brandId: true } } },
    });
    const variantMap = Object.fromEntries(variants.map((v) => [v.id, v]));

    const cartLines = items
      .map((i) => {
        const variant = variantMap[parseInt(i.productVariantId, 10)];
        const quantity = parseInt(i.quantity, 10);
        if (!variant || !Number.isInteger(quantity) || quantity <= 0) return null;
        return { variantId: variant.id, unitPrice: variant.price, quantity, product: variant.product };
      })
      .filter(Boolean);

    if (!cartLines.length) {
      return res.status(400).json({ message: "El carrito está vacío" });
    }

    const result = await resolveDiscount(prisma, code, cartLines);

    return res.status(200).json({
      data: {
        code: result.discountCode.code,
        type: result.discountCode.type,
        discountAmount: result.discountAmount,
        freeShipping: result.freeShipping,
        lineDiscounts: result.lineDiscounts,
      },
    });
  } catch (error) {
    if (error.message?.startsWith("INVALID_COUPON:")) {
      return res.status(400).json({ message: error.message.slice("INVALID_COUPON:".length) });
    }
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Normaliza un array de ids que llega del body (productIds/categoryIds/brandIds).
function parseIdArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(
    value.map((v) => parseInt(v, 10)).filter((n) => Number.isInteger(n) && n > 0)
  )];
}

// Valida que los ids de productos/categorías/marcas efectivamente existan.
async function validateRestrictions({ productIds, categoryIds, brandIds }) {
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

  return null;
}

// Valida los campos comunes a create/update. Devuelve { error } si algo no
// es válido, o { data } con los valores ya normalizados/parseados.
function validateFields(body) {
  const { code, description, type, value, minimumPurchase, maxUses, startsAt, expiresAt } = body;

  if (!code || !code.trim()) {
    return { error: "El código es obligatorio" };
  }

  const normalizedCode = code.trim().toUpperCase();

  if (normalizedCode.length > 30) {
    return { error: "El código no puede superar 30 caracteres" };
  }

  if (!/^[A-Z0-9_-]+$/.test(normalizedCode)) {
    return { error: "El código solo puede contener letras, números, guiones y guiones bajos" };
  }

  if (description && description.length > 500) {
    return { error: "La descripción no puede superar 500 caracteres" };
  }

  if (!type || !DISCOUNT_TYPES.includes(type)) {
    return { error: "El tipo de descuento no es válido" };
  }

  const numericValue = Number(value);
  if (value === undefined || value === null || value === "" || isNaN(numericValue)) {
    return { error: "El valor del descuento es obligatorio" };
  }

  if (type === "PERCENTAGE" && (numericValue <= 0 || numericValue > 100)) {
    return { error: "El porcentaje debe estar entre 1 y 100" };
  }

  if (type === "FIXED" && numericValue <= 0) {
    return { error: "El valor fijo debe ser mayor a 0" };
  }

  // Envío gratis no usa "valor" — se ignora lo que mande el cliente y se
  // fuerza a 0, para que nunca quede un número arrastrado de otro tipo.
  const finalValue = type === "FREE_SHIPPING" ? 0 : numericValue;

  let numericMinPurchase = 0;
  if (minimumPurchase !== undefined && minimumPurchase !== null && minimumPurchase !== "") {
    numericMinPurchase = Number(minimumPurchase);
    if (isNaN(numericMinPurchase) || numericMinPurchase < 0) {
      return { error: "La compra mínima no puede ser negativa" };
    }
  }

  let numericMaxUses = null;
  if (maxUses !== undefined && maxUses !== null && maxUses !== "") {
    numericMaxUses = parseInt(maxUses, 10);
    if (isNaN(numericMaxUses) || numericMaxUses <= 0) {
      return { error: "El máximo de usos debe ser un número mayor a 0" };
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

  return {
    data: {
      code: normalizedCode,
      description: description?.trim() || null,
      type,
      value: finalValue,
      minimumPurchase: numericMinPurchase,
      maxUses: numericMaxUses,
      startsAt: start,
      expiresAt: end,
    },
  };
}

const createDiscountCode = async (req, res) => {
  try {
    const { isActive } = req.body;

    const { error, data } = validateFields(req.body);
    if (error) return res.status(400).json({ message: error });

    const codeExist = await prisma.discountCode.findUnique({ where: { code: data.code } });
    if (codeExist) {
      return res.status(400).json({ message: "El código ya existe" });
    }

    const productIds = parseIdArray(req.body.productIds);
    const categoryIds = parseIdArray(req.body.categoryIds);
    const brandIds = parseIdArray(req.body.brandIds);

    const restrictionsError = await validateRestrictions({ productIds, categoryIds, brandIds });
    if (restrictionsError) return res.status(400).json({ message: restrictionsError });

    let isActiveValue = isActive;
    if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true";
    if (typeof isActiveValue !== "boolean") isActiveValue = true;

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.discountCode.create({
        data: { ...data, isActive: isActiveValue },
      });

      if (productIds.length) {
        await tx.discountCodeProduct.createMany({
          data: productIds.map((productId) => ({ discountCodeId: created.id, productId })),
        });
      }
      if (categoryIds.length) {
        await tx.discountCodeCategory.createMany({
          data: categoryIds.map((categoryId) => ({ discountCodeId: created.id, categoryId })),
        });
      }
      if (brandIds.length) {
        await tx.discountCodeBrand.createMany({
          data: brandIds.map((brandId) => ({ discountCodeId: created.id, brandId })),
        });
      }

      return created;
    });

    return res.status(201).json({ message: "Cupón creado", data: result });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "El código ya existe" });
    }
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const updateDiscountCode = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const { isActive } = req.body;

    const discountCodeExist = await prisma.discountCode.findUnique({ where: { id: formId } });
    if (!discountCodeExist) {
      return res.status(404).json({ message: "No encontrado" });
    }

    const { error, data } = validateFields(req.body);
    if (error) return res.status(400).json({ message: error });

    const codeExist = await prisma.discountCode.findFirst({
      where: { code: data.code, NOT: { id: formId } },
    });
    if (codeExist) {
      return res.status(400).json({ message: "El código ya existe" });
    }

    const productIds = parseIdArray(req.body.productIds);
    const categoryIds = parseIdArray(req.body.categoryIds);
    const brandIds = parseIdArray(req.body.brandIds);

    const restrictionsError = await validateRestrictions({ productIds, categoryIds, brandIds });
    if (restrictionsError) return res.status(400).json({ message: restrictionsError });

    let isActiveValue = isActive;
    if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true";
    if (typeof isActiveValue !== "boolean") isActiveValue = discountCodeExist.isActive;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.discountCode.update({
        where: { id: formId },
        data: { ...data, isActive: isActiveValue },
      });

      // Reemplaza la selección completa de restricciones por la nueva.
      await tx.discountCodeProduct.deleteMany({ where: { discountCodeId: formId } });
      await tx.discountCodeCategory.deleteMany({ where: { discountCodeId: formId } });
      await tx.discountCodeBrand.deleteMany({ where: { discountCodeId: formId } });

      if (productIds.length) {
        await tx.discountCodeProduct.createMany({
          data: productIds.map((productId) => ({ discountCodeId: formId, productId })),
        });
      }
      if (categoryIds.length) {
        await tx.discountCodeCategory.createMany({
          data: categoryIds.map((categoryId) => ({ discountCodeId: formId, categoryId })),
        });
      }
      if (brandIds.length) {
        await tx.discountCodeBrand.createMany({
          data: brandIds.map((brandId) => ({ discountCodeId: formId, brandId })),
        });
      }

      return result;
    });

    return res.status(200).json({ message: "Cupón actualizado", data: updated });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "El código ya existe" });
    }
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const deleteDiscountCode = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const discountCodeExist = await prisma.discountCode.findUnique({ where: { id: formId } });
    if (!discountCodeExist) {
      return res.status(404).json({ message: "No encontrado" });
    }

    const hasUsages = await prisma.discountCodeUsage.findFirst({ where: { discountCodeId: formId } });
    if (hasUsages) {
      return res.status(400).json({ message: "Tiene usos registrados asociados" });
    }

    await prisma.discountCode.delete({ where: { id: formId } });

    return res.status(200).json({ message: "Cupón eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const allDiscountCode = async (req, res) => {
  try {
    const all = await prisma.discountCode.findMany({
      include: RESTRICTIONS_INCLUDE,
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

const searchDiscountCode = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json({ data: [] });

    const discountCodes = await prisma.discountCode.findMany({
      where: {
        OR: [
          { code: { contains: q.toUpperCase() } },
          { description: { contains: q } },
        ],
      },
      include: RESTRICTIONS_INCLUDE,
      take: 20,
    });

    return res.status(200).json({ data: discountCodes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al buscar" });
  }
};

module.exports = {
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  allDiscountCode,
  searchDiscountCode,
  validateDiscountCode,
  resolveDiscount,
  confirmDiscountUsage,
};
