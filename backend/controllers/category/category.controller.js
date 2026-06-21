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

const createCategory = async (req, res) => {
  try {
    const { parentId, name, description, isActive, sortOrder } = req.body;
    const file = req.file;

    if (!name || !name.trim()) {
      deleteUploadedFile(file);
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (name.trim().length > 30) {
      deleteUploadedFile(file);
      return res.status(400).json({ error: "El nombre no puede superar 30 caracteres" });
    }

    if (description && description.length > 1500) {
      deleteUploadedFile(file);
      return res.status(400).json({ error: "La descripción no puede superar 1500 caracteres" });
    }

    if (isActive === undefined || sortOrder === undefined) {
      deleteUploadedFile(file);
      return res.status(400).json({ error: "Campos incompletos" });
    }

    const customerSlug = slugify(name, { lower: true, strict: true });

    const slugExist = await prisma.category.findUnique({ where: { slug: customerSlug } });
    if (slugExist) {
      deleteUploadedFile(file);
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
    deleteUploadedFile(req.file);
    console.error(error);
    return res.status(500).json({ error: "Error interno" });
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

    if (name.trim().length > 30) {
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
      parentId: parentId ? parseInt(parentId) : null,
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

module.exports = { createCategory, updateCategory, deleteCategory, activeCategory, allCategory, searchCategory };
