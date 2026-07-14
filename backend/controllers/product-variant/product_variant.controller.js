const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const slugify = require('slugify')
const fs = require("fs");
const path = require("path");
const { buildSearchStems } = require("../../utils/search-stems");
const { getActivePromotions, attachPromotionPricing } = require("../../utils/promotion-pricing");

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

// Valida el array `attributes` (cada uno { valueId }) antes de tocar la BD:
// que cada valueId sea un entero válido, que no se repita (violaría
// @@unique([productVariantId, attributeValueId])) y que exista de verdad en
// AttributeValue — sin esto, un valueId inventado o duplicado terminaba en
// un error de Prisma sin manejar (500 genérico) en vez de un 400 claro.
async function validateAttributesPayload(attributes) {
  if (!Array.isArray(attributes) || attributes.length === 0) return { ok: true }

  const ids = attributes.map(av => Number(av.valueId))
  if (ids.some(id => !Number.isInteger(id) || id <= 0)) {
    return { error: "Uno de los atributos seleccionados es inválido" }
  }
  if (new Set(ids).size !== ids.length) {
    return { error: "Hay atributos duplicados en la selección" }
  }

  const found = await prisma.attributeValue.count({ where: { id: { in: ids } } })
  if (found !== ids.length) {
    return { error: "Uno de los atributos seleccionados no existe" }
  }

  return { ok: true }
}

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
    if (price > 99999999.99) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El precio no puede ser mayor a $99.999.999,99" });
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

    const attributesCheck = await validateAttributesPayload(attributes);
    if (attributesCheck.error) {
      deleteTempFiles(files);
      return res.status(400).json({ message: attributesCheck.error });
    }

    // Variante + atributos en una sola transacción: si la creación de
    // atributos falla (ej. FK inesperada), la variante tampoco queda creada
    // a medias.
    const { newVariant, attributeValues } = await prisma.$transaction(async (tx) => {
      const newVariant = await tx.productVariant.create({
        data: { productId, barcode, price, stock, isDefault, isActive }
      });

      let attributeValues = [];

      if (Array.isArray(attributes) && attributes.length) {
        await tx.productVariantAttribute.createMany({
          data: attributes.map(av => ({
            productVariantId: newVariant.id,
            attributeValueId: Number(av.valueId)
          }))
        });

        attributeValues = await tx.attributeValue.findMany({
          where: { id: { in: attributes.map(a => Number(a.valueId)) } },
          include: { attribute: true }
        });
      }

      return { newVariant, attributeValues };
    });

    const variantId = newVariant.id;

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
    // Backstop real contra el TOCTOU del chequeo de barcode de arriba (dos
    // creaciones casi simultáneas con el mismo código) — la restricción
    // única en BD (barcode @unique en schema.prisma) es la que lo evita.
    if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) {
      return res.status(409).json({ message: "Código de barras ya registrado" });
    }
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
    if (price > 99999999.99) {
      deleteTempFiles(files);
      return res.status(400).json({ message: "El precio no puede ser mayor a $99.999.999,99" });
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

    const attributesCheck = await validateAttributesPayload(attributes);
    if (attributesCheck.error) {
      deleteTempFiles(files);
      return res.status(400).json({ message: attributesCheck.error });
    }

    if (Array.isArray(attributes)) {
      // deleteMany + createMany en una sola transacción: antes, si createMany
      // fallaba (valueId inválido/duplicado), el deleteMany ya había
      // confirmado y la variante quedaba sin NINGÚN atributo — ahora ambos
      // pasos se revierten juntos si algo falla.
      await prisma.$transaction([
        prisma.productVariantAttribute.deleteMany({ where: { productVariantId: formId } }),
        ...(attributes.length
          ? [prisma.productVariantAttribute.createMany({
              data: attributes.map(av => ({
                productVariantId: formId,
                attributeValueId: Number(av.valueId)
              }))
            })]
          : [])
      ]);
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
    if (error.code === 'P2002' && error.meta?.target?.includes('barcode')) {
      return res.status(409).json({ message: "Código de barras ya registrado" });
    }
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
      product: {
        select: { id: true, name: true, brand: { select: { name: true } } }
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

    // AND de stems (una condición OR por palabra): una búsqueda de varias
    // palabras encuentra resultados sin importar el orden, en vez de exigir
    // que el SKU/producto contenga la frase completa como un solo substring.
    const stems = buildSearchStems(q);

    const variants = await prisma.productVariant.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { sku:     { contains: s } },
            { barcode: { contains: s } },
            { product: { name: { contains: s } } },
          ],
        })),
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

// Deduplica variantes por producto (una por producto; ya vienen ordenadas con
// isDefault primero). Si la variante que le tocaría a un producto (isDefault
// o la más reciente) está agotada pero otra variante del mismo producto sí
// tiene stock, se muestra esa en su lugar — un producto solo debe salir como
// agotado cuando NINGUNA de sus variantes tiene stock.
// `seen` puede compartirse entre varias tandas (ej. resultados + relleno)
// para no repetir un producto ya usado en la anterior.
function dedupeByProduct(variants, { limit = Infinity, seen = new Set() } = {}) {
  const firstOverall = new Map(); // productId -> primera variante vista (fallback si ninguna tiene stock)
  const firstInStock = new Map(); // productId -> primera variante vista CON stock disponible
  const order = [];               // orden de aparición de cada producto nuevo

  for (const v of variants) {
    if (seen.has(v.productId)) continue;
    if (!firstOverall.has(v.productId)) {
      firstOverall.set(v.productId, v);
      order.push(v.productId);
    }
    // Disponible = stock - reservedStock: si un pedido pendiente (incluso uno
    // que alguien abandonó sin pagar) ya reservó todo el stock, esta variante
    // no cuenta como "con stock" solo porque la columna stock sea > 0.
    const available = Number(v.stock) - Number(v.reservedStock ?? 0);
    if (!firstInStock.has(v.productId) && available > 0) {
      firstInStock.set(v.productId, v);
    }
  }

  const result = [];
  for (const productId of order) {
    seen.add(productId);
    result.push(firstInStock.get(productId) ?? firstOverall.get(productId));
    if (result.length >= limit) break;
  }
  return result;
}
// ─────────────────────────────────────────────────────────────────────────────

const PUBLIC_VARIANTS_ORDER_BY = {
  price_asc:  [{ price: "asc" }],
  price_desc: [{ price: "desc" }],
  newest:     [{ createdAt: "desc" }],
};

const getPublicVariants = async (req, res) => {
  try {
    const rawQ     = (req.query.q || "").trim();
    const catParam = req.query.categoryIds;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
    const sortBy   = req.query.sortBy;

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
      ...((minPrice !== undefined && !isNaN(minPrice)) || (maxPrice !== undefined && !isNaN(maxPrice))
        ? { price: {
            ...(minPrice !== undefined && !isNaN(minPrice) && { gte: minPrice }),
            ...(maxPrice !== undefined && !isNaN(maxPrice) && { lte: maxPrice }),
          } }
        : {}),
    };

    // Sin sortBy explícito: se mantiene el orden original (default primero,
    // más reciente después) — no rompe la vista curada por defecto.
    const orderBy = PUBLIC_VARIANTS_ORDER_BY[sortBy] ?? [{ isDefault: "desc" }, { updatedAt: "desc" }];

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
      orderBy,
    });

    // Un único resultado por producto: la variante isDefault (o la primera activa)
    const deduped = dedupeByProduct(variants);

    const activePromotions = await getActivePromotions();
    const withPricing = attachPromotionPricing(deduped, activePromotions);

    return res.status(200).json({ data: withPricing });
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

    const activePromotions = await getActivePromotions();
    const withPricing = attachPromotionPricing(variant, activePromotions);

    return res.json(withPricing)
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
          status: "PAID",
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
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
        productId: true,
        price: true,
        isDefault: true,
        images: {
          select: { imageUrl: true, slot: true },
          orderBy: { slot: "asc" },
          take: 2,
        },
        product: {
          select: {
            name: true,
            slug: true,
            brandId: true,
            categoryId: true,
            brand: { select: { name: true } },
          },
        },
      },
      take: 30,
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    // Un resultado por producto
    const deduped = dedupeByProduct(variants, { limit: 6 });

    const activePromotions = await getActivePromotions();
    const withPricing = attachPromotionPricing(deduped, activePromotions);

    return res.status(200).json({ data: withPricing });
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
      select: { productId: true, product: { select: { brandId: true, categoryId: true } } },
    });

    const currentProductId = current?.productId     ?? null;
    const brandId          = current?.product?.brandId    ?? null;
    const categoryId       = current?.product?.categoryId ?? null;

    const brandCatOR = [
      ...(brandId    ? [{ brandId }]    : []),
      ...(categoryId ? [{ categoryId }] : []),
    ];

    // 1. Variantes de productos relacionados (misma marca o categoría)
    const related = brandCatOR.length
      ? await prisma.productVariant.findMany({
          where: {
            isActive: true,
            ...(currentProductId ? { NOT: { productId: currentProductId } } : { NOT: { id: variantId } }),
            product: { status: "ACTIVE", OR: brandCatOR },
          },
          include: RELATED_INCLUDE,
          orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        })
      : [];

    // Deduplica: un resultado por producto (isDefault ya viene primero)
    const seenProducts = new Set(currentProductId ? [currentProductId] : []);
    const dedupedRelated = dedupeByProduct(related, { seen: seenProducts });

    // Ordenar: marca (2 pts) > categoría (1 pt)
    const score = (v) =>
      (brandId    && v.product.brandId    === brandId    ? 2 : 0) +
      (categoryId && v.product.categoryId === categoryId ? 1 : 0);
    dedupedRelated.sort((a, b) => score(b) - score(a));

    const activePromotions = await getActivePromotions();

    if (dedupedRelated.length >= limit) {
      return res.status(200).json({ data: attachPromotionPricing(dedupedRelated.slice(0, limit), activePromotions) });
    }

    // 2. Rellenar con otros productos si faltan
    const needed         = limit - dedupedRelated.length;
    const excludeProdIds = [...seenProducts];

    const fillers = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        NOT: { productId: { in: excludeProdIds } },
        product: { status: "ACTIVE" },
      },
      include: RELATED_INCLUDE,
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    // Deduplica fillers también
    const dedupedFillers = dedupeByProduct(fillers, { limit: needed, seen: seenProducts });

    return res.status(200).json({ data: attachPromotionPricing([...dedupedRelated, ...dedupedFillers], activePromotions) });
  } catch (error) {
    console.error("Error en getRelatedVariants:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

// GET /bundle/public/related-products?bundleId=X&limit=Y
// Productos relacionados a los que COMPONEN un combo (misma marca o
// categoría de cualquiera de sus productos) — se usa como respaldo cuando un
// combo no tiene otros combos relacionados, para que la sección de "descubre
// más" en el detalle del combo nunca quede vacía.
const getRelatedProductsForBundle = async (req, res) => {
  try {
    const bundleId = Number(req.query.bundleId);
    const limit     = Math.min(Number(req.query.limit || 24), 48);

    if (!bundleId || isNaN(bundleId)) {
      return res.status(400).json({ message: "bundleId requerido" });
    }

    const bundle = await prisma.productBundle.findUnique({
      where: { id: bundleId },
      select: {
        items: { select: { productId: true, product: { select: { brandId: true, categoryId: true } } } },
      },
    });
    if (!bundle) return res.status(404).json({ message: "Combo no encontrado" });

    const componentProductIds = bundle.items.map((i) => i.productId);
    const brandIds    = [...new Set(bundle.items.map((i) => i.product.brandId).filter(Boolean))];
    const categoryIds = [...new Set(bundle.items.map((i) => i.product.categoryId).filter(Boolean))];

    const brandCatOR = [
      ...(brandIds.length    ? [{ brandId:    { in: brandIds } }]    : []),
      ...(categoryIds.length ? [{ categoryId: { in: categoryIds } }] : []),
    ];

    // 1. Variantes de productos relacionados a cualquiera de los componentes
    const related = brandCatOR.length
      ? await prisma.productVariant.findMany({
          where: {
            isActive: true,
            NOT: { productId: { in: componentProductIds } },
            product: { status: "ACTIVE", OR: brandCatOR },
          },
          include: RELATED_INCLUDE,
          orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        })
      : [];

    const seenProducts = new Set(componentProductIds);
    const dedupedRelated = dedupeByProduct(related, { seen: seenProducts });

    // Ordenar: marca (2 pts) > categoría (1 pt), sumando contra cualquier componente
    const score = (v) =>
      (brandIds.includes(v.product.brandId)       ? 2 : 0) +
      (categoryIds.includes(v.product.categoryId) ? 1 : 0);
    dedupedRelated.sort((a, b) => score(b) - score(a));

    const activePromotions = await getActivePromotions();

    if (dedupedRelated.length >= limit) {
      return res.status(200).json({ data: attachPromotionPricing(dedupedRelated.slice(0, limit), activePromotions) });
    }

    // 2. Rellenar con otros productos si faltan — así la sección nunca queda vacía
    const needed         = limit - dedupedRelated.length;
    const excludeProdIds = [...seenProducts];

    const fillers = await prisma.productVariant.findMany({
      where: {
        isActive: true,
        NOT: { productId: { in: excludeProdIds } },
        product: { status: "ACTIVE" },
      },
      include: RELATED_INCLUDE,
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    const dedupedFillers = dedupeByProduct(fillers, { limit: needed, seen: seenProducts });

    return res.status(200).json({ data: attachPromotionPricing([...dedupedRelated, ...dedupedFillers], activePromotions) });
  } catch (error) {
    console.error("Error en getRelatedProductsForBundle:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

// ── getPublicShowcase ─────────────────────────────────────────────────────────
// Filas curadas para el home ("Más de {marca}", "Explora {categoría}"). La
// selección de qué marcas/categorías destacar (las que más productos activos
// tienen) y el armado de cada grupo vive en el backend: el frontend solo
// renderiza lo que aquí se le entrega, para no duplicar lógica de negocio ni
// dar una experiencia distinta según quién consuma la API.
const SHOWCASE_MIN_PRODUCTS   = 2;  // no destacar marcas/categorías casi vacías
const SHOWCASE_ITEMS_PER_GROUP = 8;
// Más candidatos que filas finales: el conteo de `having` es por productos
// ACTIVE, no por productos con variantes isActive, así que algún candidato
// puede quedar sin stock real y descartarse — este margen evita perder el
// cupo cuando eso pasa.
const SHOWCASE_CANDIDATES      = 5;  // top N candidatos por tipo (marca / categoría)
const SHOWCASE_MAX_GROUPS      = 5;  // total de filas a devolver, ya intercaladas (incluye "Más vendidos")

const SHOWCASE_SELECT = {
  id: true,
  productId: true,
  price: true,
  isDefault: true,
  stock: true,
  reservedStock: true,
  images: { select: { imageUrl: true, slot: true }, orderBy: { slot: "asc" }, take: 2 },
  product: {
    select: { id: true, name: true, slug: true, brandId: true, categoryId: true, brand: { select: { name: true } } },
  },
};

async function fetchGroupVariants(where, activePromotions) {
  const variants = await prisma.productVariant.findMany({
    where: { isActive: true, product: { status: "ACTIVE", ...where } },
    select: SHOWCASE_SELECT,
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    // Tope de seguridad: de sobra para deduplicar a SHOWCASE_ITEMS_PER_GROUP
    // sin traer el catálogo completo de una marca/categoría muy grande.
    take: SHOWCASE_ITEMS_PER_GROUP * 5,
  });

  const deduped = dedupeByProduct(variants, { limit: SHOWCASE_ITEMS_PER_GROUP });
  return attachPromotionPricing(deduped, activePromotions);
}

// Fila "Más vendidos" — misma ventana de tiempo (mes en curso) y criterio
// (cantidad vendida en órdenes PAID) que usa el badge de getTopSellers,
// pero trayendo la data completa de la variante para armar una fila entera.
async function fetchTopSellerGroupVariants(activePromotions) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const grouped = await prisma.orderItem.groupBy({
    by: ["productVariantId"],
    where: {
      order: {
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        status: "PAID",
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: SHOWCASE_ITEMS_PER_GROUP * 3,
  });

  const variantIds = grouped.map((g) => g.productVariantId);
  if (!variantIds.length) return [];

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true, product: { status: "ACTIVE" } },
    select: SHOWCASE_SELECT,
  });

  // Reordenar según el ranking de ventas — `WHERE id IN (...)` no lo preserva.
  const rank = new Map(variantIds.map((id, i) => [id, i]));
  variants.sort((a, b) => rank.get(a.id) - rank.get(b.id));

  const deduped = dedupeByProduct(variants, { limit: SHOWCASE_ITEMS_PER_GROUP });
  return attachPromotionPricing(deduped, activePromotions);
}

const getPublicShowcase = async (req, res) => {
  try {
    const activePromotions = await getActivePromotions();
    const topSellerVariants = await fetchTopSellerGroupVariants(activePromotions);
    const topSellerGroup = topSellerVariants.length >= SHOWCASE_MIN_PRODUCTS
      ? { type: "topSellers", id: "top-sellers", title: "Los más vendidos", variants: topSellerVariants }
      : null;

    const [topBrands, topCategories] = await Promise.all([
      prisma.product.groupBy({
        by: ["brandId"],
        where: { status: "ACTIVE", brandId: { not: null } },
        _count: { id: true },
        having: { id: { _count: { gte: SHOWCASE_MIN_PRODUCTS } } },
        orderBy: { _count: { id: "desc" } },
        take: SHOWCASE_CANDIDATES,
      }),
      prisma.product.groupBy({
        by: ["categoryId"],
        where: { status: "ACTIVE" },
        _count: { id: true },
        having: { id: { _count: { gte: SHOWCASE_MIN_PRODUCTS } } },
        orderBy: { _count: { id: "desc" } },
        take: SHOWCASE_CANDIDATES,
      }),
    ]);

    // isActive se filtra acá (consulta simple sobre el propio modelo) y no
    // arriba dentro del groupBy — una marca/categoría desactivada nunca
    // aparece en brandRows/categoryRows y queda descartada más abajo.
    const [brandRows, categoryRows] = await Promise.all([
      prisma.brand.findMany({
        where: { id: { in: topBrands.map((b) => b.brandId) }, isActive: true },
        select: { id: true, name: true },
      }),
      prisma.category.findMany({
        where: { id: { in: topCategories.map((c) => c.categoryId) }, isActive: true },
        select: { id: true, name: true },
      }),
    ]);

    // `WHERE id IN (...)` no garantiza el orden de la lista — se reordena
    // según el ranking de popularidad ya calculado por el groupBy de arriba.
    const brandById    = new Map(brandRows.map((b) => [b.id, b]));
    const categoryById = new Map(categoryRows.map((c) => [c.id, c]));
    const brands     = topBrands.map((b) => brandById.get(b.brandId)).filter(Boolean);
    const categories = topCategories.map((c) => categoryById.get(c.categoryId)).filter(Boolean);

    const [brandGroups, categoryGroups] = await Promise.all([
      Promise.all(brands.map(async (b) => ({
        type: "brand",
        id: b.id,
        title: `Más de ${b.name}`,
        variants: await fetchGroupVariants({ brandId: b.id }, activePromotions),
      }))),
      Promise.all(categories.map(async (c) => ({
        type: "category",
        id: c.id,
        title: `Explora ${c.name}`,
        variants: await fetchGroupVariants({ categoryId: c.id }, activePromotions),
      }))),
    ]);

    // Intercalar marca/categoría para variedad visual, descartando grupos
    // que tras deduplicar por producto quedaron demasiado cortos.
    const usable = (g) => g.variants.length >= SHOWCASE_MIN_PRODUCTS;
    const interleaved = [];
    const maxLen = Math.max(brandGroups.length, categoryGroups.length);
    for (let i = 0; i < maxLen; i++) {
      if (brandGroups[i] && usable(brandGroups[i]))       interleaved.push(brandGroups[i]);
      if (categoryGroups[i] && usable(categoryGroups[i])) interleaved.push(categoryGroups[i]);
    }

    // "Más vendidos" siempre va primero cuando hay suficientes ventas este mes
    const groups = topSellerGroup ? [topSellerGroup, ...interleaved] : interleaved;

    return res.status(200).json({ data: groups.slice(0, SHOWCASE_MAX_GROUPS) });
  } catch (error) {
    console.error("Error en getPublicShowcase:", error);
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
  getRelatedProductsForBundle,
  getPublicShowcase,
}
