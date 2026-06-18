const { PrismaClient } = require("@prisma/client");
const slugify = require('slugify');
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

const createCategory = async (req, res) => {
  try {
    const { parentId, name, description, isActive, sortOrder } = req.body;
    const file = req.file;

    if (!name) {
      return res.status(400).json({ error: "Nombre requerido" });
    }

    if (isActive === undefined || sortOrder === undefined) {
      return res.status(400).json({ error: "Campos incompletos" });
    }

    const customerSlug = slugify(name, { lower: true, strict: true });

    const slugExist = await prisma.category.findUnique({ where: { slug: customerSlug } });
    if (slugExist) {
      return res.status(400).json({ message: "El nombre ya existe" });
    }

    let isActiveValue = isActive;
    if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true";
    if (typeof isActiveValue !== "boolean") isActiveValue = true;

    const imageUrl = file ? `/uploads/category/${file.filename}` : null;

    const result = await prisma.category.create({
      data: {
        parentId: parentId ? parseInt(parentId) : null,
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
    console.error(error);
    return res.status(500).json({ error: "Error interno" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const { parentId, name, description, isActive, sortOrder } = req.body;
    const file = req.file;

    if (!formId) return res.status(400).json({ message: "ID requerido" });

    if (!name) return res.status(400).json({ message: "Nombre requerido" });

    const categoryExist = await prisma.category.findUnique({ where: { id: formId } });
    if (!categoryExist) return res.status(404).json({ message: "No encontrada" });

    const customerSlug = slugify(name, { lower: true, strict: true });

    const slugExist = await prisma.category.findFirst({
      where: { slug: customerSlug, NOT: { id: formId } }
    });
    if (slugExist) return res.status(400).json({ message: "El nombre ya existe" });

    let isActiveValue = isActive;
    if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true";
    if (typeof isActiveValue !== "boolean") isActiveValue = categoryExist.isActive;

    let newImageUrl = undefined;
    if (file) {
      // Eliminar imagen anterior
      if (categoryExist.imageUrl) {
        const oldPath = path.join(__dirname, "../../", categoryExist.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      newImageUrl = `/uploads/category/${file.filename}`;
    }

    const baseData = {
      parentId: parentId ? parseInt(parentId) : null,
      name,
      slug: customerSlug,
      description,
      isActive: isActiveValue,
      sortOrder: Number(sortOrder) || 0,
    };

    // imageUrl se incluye solo si ya está en el schema del cliente de Prisma
    if (newImageUrl !== undefined) {
      try { baseData.imageUrl = newImageUrl; } catch {}
    }

    let updated;
    try {
      updated = await prisma.category.update({ where: { id: formId }, data: baseData });
    } catch (prismaErr) {
      // Si falla por imageUrl (columna no migrada aún), reintenta sin ese campo
      if (prismaErr.message?.includes('imageUrl')) {
        const { imageUrl: _removed, ...safeData } = baseData;
        updated = await prisma.category.update({ where: { id: formId }, data: safeData });
      } else {
        throw prismaErr;
      }
    }

    return res.status(200).json({ message: "Categoría actualizada", data: updated });
  } catch (error) {
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

    // Eliminar imagen física
    if (categoryExist.imageUrl) {
      const imgPath = path.join(__dirname, "../../", categoryExist.imageUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    const deleted = await prisma.category.delete({ where: { id: formId } });
    return res.status(200).json({ message: "Categoría eliminada", data: deleted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno" });
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
      where: { isActive: true },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }]
    });
    return res.status(200).json({ data: active });
  } catch (error) {
    return res.status(500).json({ error: "Error interno" });
  }
};

module.exports = { createCategory, updateCategory, deleteCategory, activeCategory, allCategory };
