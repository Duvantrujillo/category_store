const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs    = require("fs");
const path  = require("path");

const deleteUploadedFile = (file) => {
  if (!file) return;
  const filePath = path.join(__dirname, "../../uploads/banner", file.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

/* ── Crear banner ── */
const createBanner = async (req, res) => {
  try {
    const { title, link, startDate, endDate, isActive, position } = req.body;
    const file = req.file;

    if (!title || !title.trim()) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El título es obligatorio" });
    }
    if (title.trim().length > 40) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El título no puede superar 40 caracteres" });
    }
    if (link && link.trim().length > 2048) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El enlace no puede superar 2048 caracteres" });
    }
    if (!file) {
      return res.status(400).json({ message: "La imagen es obligatoria" });
    }
    if (!startDate || !endDate) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Las fechas son obligatorias" });
    }
    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Formato de fecha inválido" });
    }
    if (start >= end) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "La fecha de fin debe ser posterior a la de inicio" });
    }

    let isActiveValue = isActive;
    if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true";
    if (typeof isActiveValue !== "boolean") isActiveValue = true;

    const banner = await prisma.banner.create({
      data: {
        title:     title.trim(),
        imageUrl:  `/uploads/banner/${file.filename}`,
        link:      link?.trim() || null,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        isActive:  isActiveValue,
        position:  Number(position) || 0,
      },
    });

    return res.status(201).json({ message: "Banner creado", data: banner });
  } catch (error) {
    deleteUploadedFile(req.file);
    console.error("Error en createBanner:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

/* ── Actualizar banner ── */
const updateBanner = async (req, res) => {
  try {
    const id   = Number(req.params.id);
    const file = req.file;
    const { title, link, startDate, endDate, isActive, position } = req.body;

    if (isNaN(id)) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "ID inválido" });
    }

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      deleteUploadedFile(file);
      return res.status(404).json({ message: "Banner no encontrado" });
    }

    if (!title || !title.trim()) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El título es obligatorio" });
    }
    if (title.trim().length > 40) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El título no puede superar 40 caracteres" });
    }
    if (link && link.trim().length > 2048) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "El enlace no puede superar 2048 caracteres" });
    }
    if (!startDate || !endDate) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Las fechas son obligatorias" });
    }
    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "Formato de fecha inválido" });
    }
    if (start >= end) {
      deleteUploadedFile(file);
      return res.status(400).json({ message: "La fecha de fin debe ser posterior a la de inicio" });
    }

    let isActiveValue = isActive;
    if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true";
    if (typeof isActiveValue !== "boolean") isActiveValue = existing.isActive;

    let imageUrl = existing.imageUrl;
    if (file) {
      const oldPath = path.join(__dirname, "../../", existing.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      imageUrl = `/uploads/banner/${file.filename}`;
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        title:     title.trim(),
        imageUrl,
        link:      link?.trim() || null,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        isActive:  isActiveValue,
        position:  Number(position) || 0,
      },
    });

    return res.status(200).json({ message: "Banner actualizado", data: updated });
  } catch (error) {
    deleteUploadedFile(req.file);
    console.error("Error en updateBanner:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

/* ── Eliminar banner ── */
const deleteBanner = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Banner no encontrado" });

    if (existing.imageUrl) {
      const imgPath = path.join(__dirname, "../../", existing.imageUrl);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.banner.delete({ where: { id } });

    return res.status(200).json({ message: "Banner eliminado" });
  } catch (error) {
    console.error("Error en deleteBanner:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

/* ── Listar todos (admin) ── */
const allBanners = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    });
    return res.status(200).json({ data: banners });
  } catch (error) {
    console.error("Error en allBanners:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

/* ── Listar activos por fecha (público / hero) ── */
const publicBanners = async (req, res) => {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive:  true,
        startDate: { lte: now },
        endDate:   { gte: now },
      },
      orderBy: { position: "asc" },
    });
    return res.status(200).json({ data: banners });
  } catch (error) {
    console.error("Error en publicBanners:", error);
    return res.status(500).json({ message: "Error interno" });
  }
};

module.exports = { createBanner, updateBanner, deleteBanner, allBanners, publicBanners };
