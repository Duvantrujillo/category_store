const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const slugify = require('slugify')
const fs = require("fs");
const path = require("path");

const getVariantFolder = (variantId) =>
  path.join(__dirname, "../../uploads/product-variant", String(variantId));

const deletePhysicalImage = (imageUrl) => {
  if (!imageUrl) return;
  const imagePath = path.join(__dirname, "../../", imageUrl);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
};

const deleteTempFiles = (files) => {
  if (!files?.length) return;
  files.forEach(file => {
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  });
};

const createProductVariant = async (req, res) => {
  try {
    let {
      productId,
      barcode,
      price,
      stock,
      isDefault,
      isActive,
      attributes
    } = req.body;

    const files = req.files;

    productId  = Number(productId);
    price      = Number(price);
    stock      = Number(stock);
    isDefault  = isDefault === "true";
    isActive   = isActive === "true";
    attributes = attributes ? JSON.parse(attributes) : [];

    if (isNaN(productId) || productId <= 0) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El producto es obligatorio" });
    }

    if (barcode) {
      if (String(barcode).trim().startsWith('-')) {
        deleteTempFiles(files);
        return res.status(400).json({ message: "El código de barras no puede ser negativo" });
      }
      if (barcode.trim().length > 20) {
        deleteTempFiles(files);
        return res.status(400).json({ message: "El código de barras no puede superar 20 caracteres" });
      }
    }

    if (isNaN(stock)) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El stock debe ser un número válido" });
    }
    if (stock < 0) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El stock no puede ser negativo" });
    }
    if (stock > 10000) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El stock no puede ser mayor a 10.000" });
    }

    if (isNaN(price)) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El precio debe ser un número válido" });
    }
    if (price < 0) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }
    if (price > 100000000) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El precio no puede ser mayor a 100.000.000" });
    }

    const productExist = await prisma.product.findUnique({ where: { id: productId } });
    if (!productExist) {
      deleteTempFiles(files);
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (barcode) {
      const barcodeExist = await prisma.productVariant.findFirst({ where: { barcode } });
      if (barcodeExist) {
        deleteTempFiles(files);
        return res.status(409).json({ message: "Código de barras ya registrado" });
      }
    }

    if (isDefault) {
      const existingDefault = await prisma.productVariant.findFirst({
        where: { productId, isDefault: true }
      });
      if (existingDefault) {
        deleteTempFiles(files);
        return res.status(409).json({ message: "Ya existe una variante principal" });
      }
    }

    if (!attributes.length) {
      const variantSinAtributos = await prisma.productVariant.findFirst({
        where: { productId, attributes: { none: {} } }
      });
      if (variantSinAtributos) {
        deleteTempFiles(files);
        return res.status(409).json({ message: "Ya existe una variante sin atributos para este producto" });
      }
    }

    const newVariant = await prisma.productVariant.create({
      data: { productId, barcode, price, stock, isDefault, isActive }
    });

    const variantId = newVariant.id;

    let attributeValues = [];

    if (Array.isArray(attributes) && attributes.length) {
      await prisma.productVariantAttribute.createMany({
        data: attributes.map(av => ({
          productVariantId: variantId,
          attributeValueId: av.valueId
        }))
      });

      attributeValues = await prisma.attributeValue.findMany({
        where: { id: { in: attributes.map(a => a.valueId) } },
        include: { attribute: true }
      });
    }

    if (files?.length) {
      const folder = path.join(__dirname, `../../uploads/product-variant/${variantId}`);
      fs.mkdirSync(folder, { recursive: true });

      const imagesData = files.map((file, index) => {
        const newPath = path.join(folder, file.filename);
        fs.renameSync(file.path, newPath);
        return {
          productVariantId: variantId,
          imageUrl: `/uploads/product-variant/${variantId}/${file.filename}`,
          slot: index + 1
        };
      });

      await prisma.productVariantImage.createMany({ data: imagesData });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true }
    });

    const attributeParts = attributeValues.map(av =>
      av.value.toUpperCase().replace(/\s+/g, "")
    );

    const skuParts = [
      product?.brand?.name ?? "BRD",
      product?.name ?? "PRD",
      ...attributeParts,
      variantId
    ];

    const sku = slugify(skuParts.join("-"), { lower: false, strict: true });

    const finalVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { sku }
    });

    return res.status(201).json({ message: "Variante creada", data: finalVariant });

  } catch (error) {
    deleteTempFiles(req.files);
    console.error("Error en createProductVariant:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const updateProductVariant = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const files = req.files || [];

    if (isNaN(formId)) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "ID inválido" });
    }

    let {
      productId,
      sku,
      barcode,
      price,
      stock,
      isDefault,
      isActive,
      attributes,
      keptSlots,
      imageSlots,
    } = req.body;

    productId  = Number(productId);
    price      = Number(price);
    stock      = Number(stock);
    isDefault  = isDefault === "true";
    isActive   = isActive === "true";
    attributes = attributes ? JSON.parse(attributes) : [];

    if (isNaN(productId) || productId <= 0) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El producto es obligatorio" });
    }

    if (barcode) {
      if (String(barcode).trim().startsWith('-')) {
        deleteTempFiles(files);
        return res.status(400).json({ message: "El código de barras no puede ser negativo" });
      }
      if (barcode.trim().length > 20) {
        deleteTempFiles(files);
        return res.status(400).json({ message: "El código de barras no puede superar 20 caracteres" });
      }
    }

    if (isNaN(stock)) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El stock debe ser un número válido" });
    }
    if (stock < 0) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El stock no puede ser negativo" });
    }
    if (stock > 10000) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El stock no puede ser mayor a 10.000" });
    }

    if (isNaN(price)) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El precio debe ser un número válido" });
    }
    if (price < 0) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El precio no puede ser negativo" });
    }
    if (price > 100000000) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El precio no puede ser mayor a 100.000.000" });
    }

    const keptSlotsProvided = typeof keptSlots !== "undefined" && keptSlots !== null;
    const imageSlotsProvided = typeof imageSlots !== "undefined" && imageSlots !== null;

    const keptSlotNumbers = keptSlotsProvided
      ? (Array.isArray(keptSlots) ? keptSlots : JSON.parse(keptSlots)).map(Number)
      : [];

    const imageSlotNumbers = imageSlotsProvided
      ? (Array.isArray(imageSlots) ? imageSlots : JSON.parse(imageSlots)).map(Number)
      : [];

    const variantExist = await prisma.productVariant.findUnique({
      where: { id: formId },
      include: { images: true, attributes: true },
    });

    if (!variantExist) {
      deleteTempFiles(files);
      return res.status(404).json({ message: "No encontrada" });
    }

    const productExist = await prisma.product.findUnique({ where: { id: productId } });
    if (!productExist) {
      deleteTempFiles(files);
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (isDefault) {
      const existingDefault = await prisma.productVariant.findFirst({
        where: { productId, isDefault: true, NOT: { id: formId } }
      });
      if (existingDefault) {
        deleteTempFiles(files);
        return res.status(409).json({ message: "Ya existe una variante principal" });
      }
    }

    if (sku) {
      const skuExist = await prisma.productVariant.findFirst({
        where: { sku, NOT: { id: formId } }
      });
      if (skuExist) {
        deleteTempFiles(files);
        return res.status(409).json({ message: "SKU ya registrado" });
      }
    }

    if (!attributes.length) {
      const variantSinAtributos = await prisma.productVariant.findFirst({
        where: { productId, attributes: { none: {} }, NOT: { id: formId } }
      });
      if (variantSinAtributos) {
        deleteTempFiles(files);
        return res.status(409).json({ message: "Ya existe una variante sin atributos para este producto" });
      }
    }

    if (Array.isArray(attributes)) {
      await prisma.productVariantAttribute.deleteMany({ where: { productVariantId: formId } });
      if (attributes.length) {
        await prisma.productVariantAttribute.createMany({
          data: attributes.map(av => ({
            productVariantId: formId,
            attributeValueId: av.valueId
          }))
        });
      }
    }

    const folder = getVariantFolder(formId);
    fs.mkdirSync(folder, { recursive: true });

    const slotsToDelete = variantExist.images.filter((img) => {
      const shouldDeleteBecauseRemoved  = keptSlotsProvided && !keptSlotNumbers.includes(img.slot);
      const shouldDeleteBecauseReplaced = imageSlotNumbers.includes(img.slot);
      return shouldDeleteBecauseRemoved || shouldDeleteBecauseReplaced;
    });

    if (slotsToDelete.length) {
      slotsToDelete.forEach((img) => deletePhysicalImage(img.imageUrl));
      await prisma.productVariantImage.deleteMany({
        where: {
          productVariantId: formId,
          slot: { in: slotsToDelete.map((img) => img.slot) }
        }
      });
    }

    const createdImages = [];
    files.forEach((file, index) => {
      const slot = imageSlotNumbers[index] || index + 1;
      const newPath = path.join(folder, file.filename);
      fs.renameSync(file.path, newPath);
      createdImages.push({
        productVariantId: formId,
        imageUrl: `/uploads/product-variant/${formId}/${file.filename}`,
        slot
      });
    });

    if (createdImages.length) {
      await prisma.productVariantImage.createMany({ data: createdImages });
    }

    const updated = await prisma.productVariant.update({
      where: { id: formId },
      data: { productId, sku, barcode, price, stock, isDefault, isActive }
    });

    return res.status(200).json({ message: "Variante actualizada", data: updated });

  } catch (error) {
    deleteTempFiles(req.files);
    console.error("Error en updateProductVariant:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const deleteProductVariant = async (req, res) => {
  try {
    const formId = Number(req.params.id);

    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const variantExist = await prisma.productVariant.findUnique({
      where: { id: formId },
      include: { images: true, attributes: true }
    });

    if (!variantExist) {
      return res.status(404).json({ message: "No encontrada" });
    }

    const hasOrders = await prisma.orderItem.findFirst({
      where: { productVariantId: formId }
    });
    if (hasOrders) {
      return res.status(400).json({
        message: "No se puede eliminar: la variante tiene órdenes asociadas"
      });
    }

    const hasCartItems = await prisma.cartItem.findFirst({
      where: { productVariantId: formId }
    });
    if (hasCartItems) {
      return res.status(400).json({
        message: "No se puede eliminar: la variante está en carritos de compra activos"
      });
    }

    await prisma.productVariantAttribute.deleteMany({ where: { productVariantId: formId } });
    await prisma.productVariantImage.deleteMany({ where: { productVariantId: formId } });

    const folder = getVariantFolder(formId);
    if (fs.existsSync(folder)) fs.rmSync(folder, { recursive: true, force: true });

    const deleted = await prisma.productVariant.delete({ where: { id: formId } });

    return res.status(200).json({ message: "Variante eliminada", data: deleted });

  } catch (error) {
    console.error(error);
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: "No se puede eliminar: la variante tiene registros asociados en el sistema"
      });
    }
    return res.status(500).json({ message: "Error interno" });
  }
};

const allProductVariant = async (req, res) => {
  const all = await prisma.productVariant.findMany({
    include: {
      images: true,
      attributes: {
        include: {
          attributeValue: {
            include: { attribute: true }
          }
        }
      },
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }]
  });

  if (all.length === 0) {
    return res.status(200).json({ message: "no hay registros aun" });
  }

  return res.status(200).json({ data: all });
};

const searchSkuBarcode = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q) return res.status(200).json({ data: [] });

    const variants = await prisma.productVariant.findMany({
      where: {
        OR: [
          { sku:     { contains: q } },
          { barcode: { contains: q } },
        ],
      },
      include: {
        images: true,
        attributes: {
          include: {
            attributeValue: {
              include: { attribute: true }
            }
          }
        },
        product: true,
      },
      take: 20,
    });

    return res.status(200).json({ data: variants });
  } catch (error) {
    console.error("Error searching variants:", error);
    return res.status(500).json({ message: "Error al buscar" });
  }
};

// ── helpers de búsqueda ──────────────────────────────────────────────────────
function normSearch(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function stemES(word) {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s"))  return word.slice(0, -1);
  return word;
}
function buildSearchStems(query) {
  return query.trim().split(/\s+/).filter(Boolean).map((w) => stemES(normSearch(w)));
}
// ─────────────────────────────────────────────────────────────────────────────

const getPublicVariants = async (req, res) => {
  try {
    const rawQ     = (req.query.q || "").trim();
    const catParam = req.query.categoryIds;

    // IDs de categorías (coma-separados)
    let categoryIds = null;
    if (catParam) {
      const ids = catParam.split(",").map(Number).filter((id) => !isNaN(id) && id > 0);
      if (ids.length) categoryIds = ids;
    }

    // Cada raíz de la búsqueda debe coincidir con al menos un campo
    const stemConditions = rawQ
      ? buildSearchStems(rawQ).map((s) => ({
          OR: [
            { product: { name:     { contains: s } } },
            { product: { brand:    { name: { contains: s } } } },
            { product: { category: { name: { contains: s } } } },
            { sku: { contains: s } },
            { attributes: { some: { attributeValue: { value: { contains: s } } } } },
          ],
        }))
      : [];

    const where = {
      isActive: true,
      product: {
        status: "ACTIVE",
        ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
      },
      ...(stemConditions.length ? { AND: stemConditions } : {}),
    };

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        images: true,
        attributes: {
          include: {
            attributeValue: {
              include: { attribute: true },
            },
          },
        },
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return res.status(200).json({ data: variants });
  } catch (error) {
    console.error("Error en getPublicVariants:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const getPublicVariantById = async (req, res) => {
  try {
    const { id } = req.params
    const variant = await prisma.productVariant.findFirst({
      where: { id: Number(id), isActive: true, product: { status: "ACTIVE" } },
      include: {
        images: true,
        attributes: {
          include: { attributeValue: { include: { attribute: true } } },
        },
        product: { include: { brand: true, category: true } },
      },
    })
    if (!variant) return res.status(404).json({ message: "No encontrado" })
    return res.json(variant)
  } catch (error) {
    console.error("Error en getPublicVariantById:", error)
    return res.status(500).json({ message: "Error interno" })
  }
}

const getTopSellers = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const grouped = await prisma.orderItem.groupBy({
      by: ["productVariantId"],
      where: {
        order: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { in: ["PAID", "PENDING"] },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 3,
    });

    const ids = grouped.map((g) => g.productVariantId);
    return res.status(200).json({ data: ids });
  } catch (error) {
    console.error("Error en getTopSellers:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const RELATED_INCLUDE = {
  images: { orderBy: { slot: "asc" }, take: 2 },
  attributes: {
    include: { attributeValue: { include: { attribute: true } } },
  },
  product: { include: { brand: true, category: true } },
};

const getPublicSuggestions = async (req, res) => {
  try {
    const rawQ = (req.query.q || "").trim();
    if (!rawQ || rawQ.length < 2) return res.status(200).json({ data: [] });

    const stemConditions = buildSearchStems(rawQ).map((s) => ({
      OR: [
        { product: { name:     { contains: s } } },
        { product: { brand:    { name: { contains: s } } } },
        { product: { category: { name: { contains: s } } } },
        { sku: { contains: s } },
        { attributes: { some: { attributeValue: { value: { contains: s } } } } },
      ],
    }));

    const variants = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        product: { status: "ACTIVE" },
        AND: stemConditions,
      },
      select: {
        id: true,
        price: true,
        images: {
          select: { imageUrl: true, slot: true },
          orderBy: { slot: "asc" },
          take: 2,
        },
        product: {
          select: {
            name: true,
            brand: { select: { name: true } },
          },
        },
      },
      take: 6,
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return res.status(200).json({ data: variants });
  } catch (error) {
    console.error("Error en getPublicSuggestions:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const getRelatedVariants = async (req, res) => {
  try {
    const variantId = Number(req.query.variantId);
    const limit     = Math.min(Number(req.query.limit || 24), 48);

    if (!variantId || isNaN(variantId)) {
      return res.status(400).json({ message: "variantId requerido" });
    }

    const current = await prisma.productVariant.findFirst({
      where: { id: variantId },
      select: { product: { select: { brandId: true, categoryId: true } } },
    });

    const brandId    = current?.product?.brandId    ?? null;
    const categoryId = current?.product?.categoryId ?? null;

    const brandCatOR = [
      ...(brandId    ? [{ brandId }]    : []),
      ...(categoryId ? [{ categoryId }] : []),
    ];

    // 1. Productos de la misma marca o categoría
    const related = brandCatOR.length
      ? await prisma.productVariant.findMany({
          where: {
            isActive: true,
            NOT: { id: variantId },
            product: { status: "ACTIVE", OR: brandCatOR },
          },
          include: RELATED_INCLUDE,
          orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        })
      : [];

    // Ordenar: marca (2 pts) > categoría (1 pt)
    const score = (v) =>
      (brandId    && v.product.brandId    === brandId    ? 2 : 0) +
      (categoryId && v.product.categoryId === categoryId ? 1 : 0);
    related.sort((a, b) => score(b) - score(a));

    if (related.length >= limit) {
      return res.status(200).json({ data: related.slice(0, limit) });
    }

    // 2. Rellenar con otros productos si faltan
    const needed     = limit - related.length;
    const excludeIds = [variantId, ...related.map((v) => v.id)];

    const fillers = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        NOT: { id: { in: excludeIds } },
        product: { status: "ACTIVE" },
      },
      include: RELATED_INCLUDE,
      take: needed,
      orderBy: [{ updatedAt: "desc" }],
    });

    return res.status(200).json({ data: [...related, ...fillers] });
  } catch (error) {
    console.error("Error en getRelatedVariants:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  allProductVariant,
  searchSkuBarcode,
  getPublicVariants,
  getPublicVariantById,
  getTopSellers,
  getPublicSuggestions,
  getRelatedVariants,
}
