const { PrismaClient } = require("@prisma/client");
const slugify = require('slugify');
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

const deleteUploadedFile = (file) => {
  if (!file) return;
  const filePath = path.join(__dirname, "../../uploads/category", file.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

// La jerarquía admite solo 2 niveles (padre → hijo). Antes de asignar un
// parentId hay que verificar que esa categoría padre sea a su vez una
// categoría raíz (sin padre propio); de lo contrario se estaría creando
// un nieto.
const assertValidParent = async (parentId) => {
  const parent = await prisma.category.findUnique({ where: { id: parentId } });
  if (!parent) return "La categoría padre no existe";
  if (parent.parentId !== null) return "No se pueden anidar más de 2 niveles (padre e hijo)";
  return null;
};

const createCategory = async (req, res) => {
  try {
    const { parentId, name, description, isActive, sortOrder } = req.body;
    const file = req.file;

    if (!name || !name.trim()) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    if (name.trim().length > 100) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre no puede superar 30 caracteres" });
    }

    if (description && description.length > 1500) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "La descripción no puede superar 1500 caracteres" });
    }

    if (isActive === undefined || sortOrder === undefined) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Campos incompletos" });
    }

    if (!file) {
      return res.status(400).json({ message: "La imagen es obligatoria" });
    }

    const customerSlug = slugify(name, { lower: true, strict: true });

    const slugExist = await prisma.category.findUnique({ where: { slug: customerSlug } });
    if (slugExist) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre ya existe" });
    }

    const parentIdValue = parentId ? parseInt(parentId) : null;
    if (parentIdValue !== null) {
      const parentError = await assertValidParent(parentIdValue);
      if (parentError) {
        deleteUploadedFile(file);
        return res.status(400).json({ message: parentError });
      }
    }

    let isActiveValue = isActive;
    if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true";
    if (typeof isActiveValue !== "boolean") isActiveValue = true;

    const imageUrl = file ? `/uploads/category/${file.filename}` : null;

    const result = await prisma.category.create({
      data: {
        parentId: parentIdValue,
        name,
        slug: customerSlug,
        description,
        imageUrl,
        isActive: isActiveValue,
        sortOrder: parseInt(sortOrder),
      }
    });

    return res.status(201).json({ message: "Categoría creada", data: result });
  } catch (error) {
    deleteUploadedFile(req.file);
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const { parentId, name, description, isActive, sortOrder } = req.body;
    const file = req.file;

    if (!formId) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "ID requerido" });
    }

    if (!name || !name.trim()) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    if (name.trim().length > 100) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre no puede superar 30 caracteres" });
    }

    if (description && description.length > 1500) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "La descripción no puede superar 1500 caracteres" });
    }

    const categoryExist = await prisma.category.findUnique({ where: { id: formId } });
    if (!categoryExist) {
      deleteUploadedFile(file);
      return res.status(404).json({ message: "No encontrada" });
    }

    const customerSlug = slugify(name, { lower: true, strict: true });

    const slugExist = await prisma.category.findFirst({
      where: { slug: customerSlug, NOT: { id: formId } }
    });
    if (slugExist) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El nombre ya existe" });
    }

    const parentIdValue = parentId ? parseInt(parentId) : null;
    if (parentIdValue !== null) {
      if (parentIdValue === formId) {
        deleteUploadedFile(file);
        return res.status(400).json({ message: "Una categoría no puede ser su propio padre" });
      }

      const parentError = await assertValidParent(parentIdValue);
      if (parentError) {
        deleteUploadedFile(file);
        return res.status(400).json({ message: parentError });
      }

      // Si esta categoría ya tiene hijos propios, convertirla en hija de otra
      // crearía nietos (sus hijos actuales pasarían a un 3er nivel).
      const hasChildren = await prisma.category.findFirst({ where: { parentId: formId } });
      if (hasChildren) {
        deleteUploadedFile(file);
        return res.status(400).json({ message: "Esta categoría tiene subcategorías propias; no puede convertirse en hija de otra" });
      }
    }

    let isActiveValue = isActive;
    if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true";
    if (typeof isActiveValue !== "boolean") isActiveValue = categoryExist.isActive;

    let newImageUrl = undefined;
    if (file) {
      if (categoryExist.imageUrl) {
        const oldPath = path.join(__dirname, "../../", categoryExist.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      newImageUrl = `/uploads/category/${file.filename}`;
    }

    const baseData = {
      parentId: parentIdValue,
      name,
      slug: customerSlug,
      description,
      isActive: isActiveValue,
      sortOrder: Number(sortOrder) || 0,
    };

    if (newImageUrl !== undefined) baseData.imageUrl = newImageUrl;

    const updated = await prisma.category.update({ where: { id: formId }, data: baseData });

    return res.status(200).json({ message: "Categoría actualizada", data: updated });
  } catch (error) {
    deleteUploadedFile(req.file);
    console.error(error);
    if (error.code === 'P2002') return res.status(400).json({ message: "El nombre ya existe" });
    return res.status(500).json({ message: "Error interno" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const formId = Number(req.params.id);

    const categoryExist = await prisma.category.findUnique({ where: { id: formId } });
    if (!categoryExist) return res.status(404).json({ message: "No encontrada" });

    const hasRelatedProducts = await prisma.product.findFirst({ where: { categoryId: formId } });
    if (hasRelatedProducts) return res.status(400).json({ message: "Tiene productos asociados" });

    const hasDiscountCode = await prisma.discountCodeCategory.findFirst({ where: { categoryId: formId } });
    if (hasDiscountCode) return res.status(400).json({ message: "Tiene cupones de descuento asociados" });

    // Eliminar imagen física
    if (categoryExist.imageUrl) {
      const imgPath = path.join(__dirname, "../../", categoryExist.imageUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    const deleted = await prisma.category.delete({ where: { id: formId } });
    return res.status(200).json({ message: "Categoría eliminada", data: deleted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

const allCategory = async (req, res) => {
  try {
    const all = await prisma.category.findMany({
      include: { parent: true },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }]
    });

    if (!all || all.length === 0) {
      return res.status(404).json({ message: "No hay registros aún" });
    }

    return res.status(200).json({ data: all });
  } catch (error) {
    return res.status(500).json({ message: "Error interno" });
  }
};

const activeCategory = async (req, res) => {
  try {
    const active = await prisma.category.findMany({
      include: { parent: true },
      where: { isActive: true, children: { none: {} } },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }]
    });
    return res.status(200).json({ data: active });
  } catch (error) {
    return res.status(500).json({ message: "Error interno" });
  }
};

const searchCategory = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json({ data: [] });

    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { description: { contains: q } },
        ],
      },
      include: { parent: true },
      take: 20,
    });

    return res.status(200).json({ data: categories });
  } catch (error) {
    return res.status(500).json({ message: "Error interno" });
  }
};

const getPublicCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      select: {
        id: true, name: true, slug: true, imageUrl: true, sortOrder: true,
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, imageUrl: true, sortOrder: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return res.status(200).json({ data: categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

module.exports = { createCategory, updateCategory, deleteCategory, activeCategory, allCategory, searchCategory, getPublicCategories };
