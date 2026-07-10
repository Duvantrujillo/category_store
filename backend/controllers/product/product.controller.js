const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const slugify = require('slugify')
const fs = require('fs');
const path = require('path');
const { buildSearchStems } = require('../../utils/search-stems');
const { getActivePromotions, attachPromotionPricing } = require('../../utils/promotion-pricing');

const deleteUploadedFile = (file) => {
  if (!file) return;
  const filePath = path.join(__dirname, '../../uploads/product', file.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const deleteStoredImage = (imageUrl) => {
  if (!imageUrl) return;
  const filePath = path.join(__dirname, '../../', imageUrl);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// Debe coincidir con el enum ProductStatus de schema.prisma. Sin este
// whitelist, un valor inválido (typo, string vacío) llegaba directo a
// Prisma y volaba como una excepción de validación no manejada (500).
const ALLOWED_STATUS = new Set(['ACTIVE', 'INACTIVE', 'DRAFT']);

const createProduct = async (req, res) => {
  try {
    const { categoryId, brandId, name, description, status } = req.body;
    const file = req.file;

    if (!name || !name.trim()) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }
    if (name.trim().length > 50) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre no puede superar 50 caracteres" });
    }
    if (description && description.length > 3000) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "La descripción no puede superar 3000 caracteres" });
    }
    if (!categoryId) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "La categoría es obligatoria" });
    }

    if (status && !ALLOWED_STATUS.has(status)) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: `Estado inválido. Permitidos: ${[...ALLOWED_STATUS].join(', ')}` });
    }

    const categoryIdNumb = Number(categoryId);
    if (!Number.isInteger(categoryIdNumb) || categoryIdNumb <= 0) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "categoryId inválido" });
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryIdNumb } });
    if (!categoryExists) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Categoría no encontrada" });
    }
    const hasChildren = await prisma.category.findFirst({
      where: { parentId: categoryIdNumb },
      select: { id: true },
    });
    if (hasChildren) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Solo se pueden asignar productos a categorías hija" });
    }

    // Marca es opcional
    let brandIdNumb = null;
    let brandName   = '';
    if (brandId) {
      brandIdNumb = Number(brandId);
      if (!Number.isInteger(brandIdNumb) || brandIdNumb <= 0) {
        deleteUploadedFile(file);
        return res.status(400).json({ message: "brandId inválido" });
      }
      const brandExists = await prisma.brand.findUnique({ where: { id: brandIdNumb } });
      if (!brandExists) {
        deleteUploadedFile(file);
        return res.status(400).json({ message: "Marca no encontrada" });
      }
      brandName = brandExists.name;
    }

    const slugBase = brandName ? `${name.trim()} ${brandName}` : name.trim();
    const slug     = slugify(slugBase, { strict: true, lower: true });

    const slugExist = await prisma.product.findUnique({ where: { slug } });
    if (slugExist) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre ya existe" });
    }

    const mainImage = file ? `/uploads/product/${file.filename}` : null;

    const newProduct = await prisma.product.create({
      data: { categoryId: categoryIdNumb, brandId: brandIdNumb, name, slug, description, mainImage, status },
    });

    return res.status(201).json({ message: "Producto creado", data: newProduct });
  } catch (error) {
    deleteUploadedFile(req.file);
    console.error("Error en createProduct:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};




const updateProduct = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const file = req.file;

    if (isNaN(formId)) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "ID inválido" });
    }

    const { categoryId, brandId, name, description, status } = req.body;

    if (!name || !name.trim()) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    if (name.trim().length > 50) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre no puede superar 50 caracteres" });
    }

    if (description && description.length > 3000) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "La descripción no puede superar 3000 caracteres" });
    }

    if (!categoryId) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "La categoría es obligatoria" });
    }

    if (status && !ALLOWED_STATUS.has(status)) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: `Estado inválido. Permitidos: ${[...ALLOWED_STATUS].join(', ')}` });
    }

    const categoryIdNumb = Number(categoryId);
    if (!Number.isInteger(categoryIdNumb) || categoryIdNumb <= 0) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "categoryId inválido" });
    }

    const productExist = await prisma.product.findUnique({ where: { id: formId } });
    if (!productExist) {
      deleteUploadedFile(file);
      return res.status(404).json({ message: "No encontrado" });
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryIdNumb } });
    if (!categoryExists) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Categoría no encontrada" });
    }
    const hasChildren = await prisma.category.findFirst({
      where: { parentId: categoryIdNumb },
      select: { id: true },
    });
    if (hasChildren) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Solo se pueden asignar productos a categorías hija" });
    }

    // Marca es opcional
    let brandIdNumb = null;
    let brandName   = '';
    if (brandId) {
      brandIdNumb = Number(brandId);
      if (!Number.isInteger(brandIdNumb) || brandIdNumb <= 0) {
        deleteUploadedFile(file);
        return res.status(400).json({ message: "brandId inválido" });
      }
      const brandExists = await prisma.brand.findUnique({ where: { id: brandIdNumb } });
      if (!brandExists) {
        deleteUploadedFile(file);
        return res.status(400).json({ message: "Marca no encontrada" });
      }
      brandName = brandExists.name;
    }

    const slugBase = brandName ? `${name.trim()} ${brandName}` : name.trim();
    const slug     = slugify(slugBase, { strict: true, lower: true });

    const slugExist = await prisma.product.findFirst({
      where: { slug, NOT: { id: formId } },
    });
    if (slugExist) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre ya existe" });
    }

    let mainImage = productExist.mainImage;

    if (file) {
      deleteStoredImage(productExist.mainImage);
      mainImage = `/uploads/product/${file.filename}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: formId },
      data: { categoryId: categoryIdNumb, brandId: brandIdNumb, name, slug, description, mainImage, status },
    });


    return res.status(200).json({ message: "Producto actualizado", data: updatedProduct });
  } catch (error) {
    deleteUploadedFile(req.file);
    console.error("Error en updateProduct:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};



const deleteProduct = async (req, res) => {
  try {
    const formId = Number(req.params.id);

    if (isNaN(formId)) {
      return res.status(400).json({
        message: "ID inválido"
      });
    }

    const productExist = await prisma.product.findUnique({
      where: { id: formId }
    });

    if (!productExist) {
      return res.status(404).json({
        message: "No encontrado"
      });
    }

    // 🔥 VALIDAR SI TIENE VARIANTES
    const count = await prisma.productVariant.count({
      where: { productId: formId }
    });

    if (count > 0) {
      return res.status(400).json({
        message: "Tiene variantes asociadas"
      });
    }

    // 🔥 VALIDAR SI ESTÁ RESTRINGIDO A ALGÚN CUPÓN DE DESCUENTO
    const hasDiscountCode = await prisma.discountCodeProduct.findFirst({
      where: { productId: formId }
    });

    if (hasDiscountCode) {
      return res.status(400).json({
        message: "Tiene cupones de descuento asociados"
      });
    }

    // 🧹 eliminar imagen si existe
    if (productExist.mainImage) {
      const imagePath = path.join(
        __dirname,
        "../../",
        productExist.mainImage
      );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // 🗑️ eliminar producto
    const deletedProduct = await prisma.product.delete({
      where: { id: formId }
    });

    return res.status(200).json({
      message: "Producto eliminado",
      data: deletedProduct
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error interno"
    });
  }
};



const allProduct = async (req, res) => {
  try {
    const all = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    if (all.length === 0) {
      return res.status(404).json({
        message: "No hay registros disponibles",
      });
    }

    return res.status(200).json({
      data: all,
    });
  } catch (error) {
    console.log(error); // 🔥 importante para ver el error real

    return res.status(500).json({
      message: "Error interno",
    });
  }
};

const searchProduct = async (req, res) => {
  try {

    const q = (req.query.q || "").trim();

    if (!q) {
      const active = await prisma.product.findMany({
        where: { status: 'ACTIVE' },
        include: { category: true, brand: true, variants: true },
        orderBy: { name: 'asc' },
        take: 20,
      });
      return res.status(200).json({ data: active });
    }

    // AND de stems: cada palabra de la búsqueda debe aparecer en ALGÚN campo
    // (nombre, slug, categoría o marca), sin importar el orden — así "porton
    // rojo" encuentra "Portón Rojo" igual que buscar solo "porton".
    const stems = buildSearchStems(q);

    const products = await prisma.product.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { name:     { contains: s } },
            { slug:     { contains: s } },
            { category: { name: { contains: s } } },
            { brand:    { name: { contains: s } } },
          ],
        })),
      },
      include: { category: true, brand: true, variants: true },
      take: 20,
    });

    return res.status(200).json({ data: products });

  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({ message: "Error al buscar" });
  }
};

const getPublicProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: {
        category: true,
        brand: true,
        variants: {
          where: { isActive: true },
          include: {
            images: { orderBy: { slot: 'asc' } },
            attributes: {
              include: {
                attributeValue: { include: { attribute: true } },
              },
            },
          },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    if (!product.variants.length) return res.status(404).json({ message: 'Producto sin variantes activas' });

    // Pre-computa las opciones de atributos para que el frontend no tenga que procesarlas
    const attributeOptions = {};
    product.variants.forEach((v) => {
      v.attributes.forEach((a) => {
        const name  = a.attributeValue?.attribute?.name;
        const value = a.attributeValue?.value;
        if (!name || !value) return;
        if (!attributeOptions[name]) attributeOptions[name] = [];
        if (!attributeOptions[name].includes(value)) attributeOptions[name].push(value);
      });
    });

    const activePromotions = await getActivePromotions();
    const variantsWithPricing = attachPromotionPricing(product.variants, activePromotions, {
      productId: product.id,
      categoryId: product.categoryId,
      brandId: product.brandId,
    });

    return res.json({ ...product, variants: variantsWithPricing, attributeOptions });
  } catch (error) {
    console.error('Error en getPublicProductBySlug:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  allProduct,
  searchProduct,
  getPublicProductBySlug,
}