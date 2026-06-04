const { ClientPrisma, PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const slugify = require('slugify')
const fs = require("fs");
const path = require("path");

const getVariantFolder = (variantId) =>
  path.join(__dirname, "../../uploads/product-variant", String(variantId));

const deletePhysicalImage = (imageUrl) => {
  const imagePath = path.join(__dirname, "../../", imageUrl);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
};

//sku va a lo ultimo
//producto variante
//producto variante y attributos
//imagen de la variante

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

    // 🔥 1. CONVERTIR TIPOS (IMPORTANTE)
    productId = Number(productId);
    price = Number(price);
    stock = Number(stock);
    isDefault = isDefault === "true";
    isActive = isActive === "true";
    attributes = attributes ? JSON.parse(attributes) : [];

    // 2️⃣ Validar barcode
    if (barcode) {
      const barcodeExist = await prisma.productVariant.findFirst({
        where: { barcode }
      });

      if (barcodeExist) {
        return res.status(409).json({
          message: "El código de barras ya existe"
        });
      }
    }

    // 3️⃣ Crear variante primero
    const newVariant = await prisma.productVariant.create({
      data: {
        productId,
        barcode,
        price,
        stock,
        isDefault,
        isActive
      }
    });

    const variantId = newVariant.id;

    // 4️⃣ Guardar atributos
    let attributeValues = [];

    if (attributes?.length) {
      const existingValues = await prisma.attributeValue.findMany({
        where: {
          id: {
            in: attributes.map(a => a.valueId)
          }
        },
        include: {
          attribute: true
        }
      });

      attributeValues = existingValues;

      const dataToInsert = existingValues.map(av => ({
        productVariantId: variantId,
        attributeValueId: av.id
      }));

      await prisma.productVariantAttribute.createMany({
        data: dataToInsert
      });
    }

    // 5️⃣ Guardar imágenes
    if (files?.length) {
      const folder = path.join(
        __dirname,
        `../../uploads/product-variant/${variantId}`
      );

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

      await prisma.productVariantImage.createMany({
        data: imagesData
      });
    }

    // 6️⃣ GENERAR SKU
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true }
    });

    const attributeParts = attributeValues.map(av =>
      av.value
        .toUpperCase()
        .replace(/\s+/g, "")
    );

    const skuParts = [
      product?.brand?.name ?? "BRD",
      product?.name ?? "PRD",
      ...attributeParts,
      variantId
    ];

    const sku = slugify(skuParts.join("-"), {
      lower: false,
      strict: true
    });

    // 7️⃣ Guardar SKU final
    const finalVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: { sku }
    });

    return res.status(201).json({
      message: "Variante creada correctamente",
      data: finalVariant
    });

  } catch (error) {
    console.error("🔥 ERROR:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

const updateProductVariant = async (req, res) => {
  try {
    const formId = Number(req.params.id);

    if (isNaN(formId)) {
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

    const files = req.files || [];

    productId = Number(productId);
    price = Number(price);
    stock = Number(stock);
    isDefault = isDefault === "true";
    isActive = isActive === "true";
    attributes = attributes ? JSON.parse(attributes) : [];

    const keptSlotsProvided = typeof keptSlots !== "undefined" && keptSlots !== null;
    const imageSlotsProvided = typeof imageSlots !== "undefined" && imageSlots !== null;

    const keptSlotNumbers = keptSlotsProvided
      ? (Array.isArray(keptSlots) ? keptSlots : JSON.parse(keptSlots)).map(Number)
      : [];

    const imageSlotNumbers = imageSlotsProvided
      ? (Array.isArray(imageSlots) ? imageSlots : JSON.parse(imageSlots)).map(Number)
      : [];

    // 1. verificar existencia
    const variantExist = await prisma.productVariant.findUnique({
      where: { id: formId },
      include: {
        images: true,
        attributes: true,
      },
    });

    if (!variantExist) {
      return res.status(404).json({ message: "La variante no existe" });
    }

    // 2. validar producto
    const productExist = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!productExist) {
      return res.status(404).json({ message: "El producto no existe" });
    }

    // 3. validar duplicado SKU
    if (sku) {
      const skuExist = await prisma.productVariant.findFirst({
        where: {
          sku,
          NOT: { id: formId }
        }
      });

      if (skuExist) {
        return res.status(409).json({ message: "El SKU ya existe" });
      }
    }

    // 4. actualizar atributos
    if (Array.isArray(attributes)) {
      await prisma.productVariantAttribute.deleteMany({
        where: { productVariantId: formId }
      });

      if (attributes.length) {
        const dataToInsert = attributes.map(av => ({
          productVariantId: formId,
          attributeValueId: av.valueId
        }));

        await prisma.productVariantAttribute.createMany({
          data: dataToInsert
        });
      }
    }

    // 5. manejar imágenes: eliminar las que se quiten y reemplazar las actualizadas
    const folder = getVariantFolder(formId);
    fs.mkdirSync(folder, { recursive: true });

    const slotsToDelete = variantExist.images.filter((img) => {
      const shouldDeleteBecauseRemoved = keptSlotsProvided && !keptSlotNumbers.includes(img.slot);
      const shouldDeleteBecauseReplaced = imageSlotNumbers.includes(img.slot);
      return shouldDeleteBecauseRemoved || shouldDeleteBecauseReplaced;
    });

    if (slotsToDelete.length) {
      const slotsToDeleteIds = slotsToDelete.map((img) => img.slot);

      slotsToDelete.forEach((img) => {
        deletePhysicalImage(img.imageUrl);
      });

      await prisma.productVariantImage.deleteMany({
        where: {
          productVariantId: formId,
          slot: { in: slotsToDeleteIds }
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
      await prisma.productVariantImage.createMany({
        data: createdImages
      });
    }

    // 6. update final
    const updated = await prisma.productVariant.update({
      where: { id: formId },
      data: {
        productId,
        sku,
        barcode,
        price,
        stock,
        isDefault,
        isActive
      }
    });

    return res.status(200).json({
      message: "Variante actualizada correctamente",
      data: updated
    });

  } catch (error) {
    console.error("Error en updateProductVariant:", error);
    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};
const deleteProductVariant = async (req, res) => {
  try {
    const formId = Number(req.params.id);

    if (isNaN(formId)) {
      return res.status(400).json({
        message: "el ID debe ser numérico"
      });
    }

    const variantExist = await prisma.productVariant.findUnique({
      where: {
        id: formId
      },
      include: {
        images: true,
      }
    });

    if (!variantExist) {
      return res.status(404).json({
        message: "el registro no existe"
      });
    }

    const folder = getVariantFolder(formId);

    if (fs.existsSync(folder)) {
      fs.rmSync(folder, { recursive: true, force: true });
    }

    const deletedProductVariant = await prisma.productVariant.delete({
      where: {
        id: formId
      }
    });

    return res.status(200).json({
      message: "el registro fue eliminado exitosamente",
      data: deletedProductVariant
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "error interno del servidor"
    });
  }
};

const allProductVariant = async (req, res) => {
  const all = await prisma.productVariant.findMany({
    include: {
      images: true,
      attributes: true,
    },
  })

  if (all.length === 0) {
    return res.status(200).json({ message: "no hay registros aun" })
  }

  return res.status(200).json({ data: all })
}

module.exports = {
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  allProductVariant
}