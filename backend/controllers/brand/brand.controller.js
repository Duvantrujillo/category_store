const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const slugify = require('slugify')
const fs = require("fs");
const path = require("path");


const deleteUploadedFile = (file, folder = 'brand') => {
    if (!file) return;
    const filePath = path.join(__dirname, `../../uploads/${folder}`, file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

const createBrand = async (req, res) => {
    try {
        const { name, description, isActive } = req.body
        const file = req.file

        if (!name || !name.trim()) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: 'El nombre es obligatorio' })
        }

        if (name.trim().length > 25) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: 'El nombre no puede superar 25 caracteres' })
        }

        if (description && description.length > 800) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: 'La descripción no puede superar 800 caracteres' })
        }

        if (!file) {
            return res.status(400).json({ message: 'Logo requerido' })
        }

        const customerSlug = slugify(name, { lower: true, strict: true })

        const slugExist = await prisma.brand.findUnique({
            where: { slug: customerSlug }
        })

        if (slugExist) {
            deleteUploadedFile(file)
            return res.status(409).json({ message: 'El nombre ya existe' })
        }

        let isActiveValue = isActive
        if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true"
        if (typeof isActiveValue !== "boolean") isActiveValue = false

        const logoUrl = `/uploads/brand/${file.filename}`

        const newBrand = await prisma.brand.create({
            data: {
                name,
                slug: customerSlug,
                description,
                logoUrl,
                isActive: isActiveValue
            }
        })

        return res.status(201).json({ message: 'Marca creada', data: newBrand })

    } catch (error) {
        deleteUploadedFile(req.file)
        console.error('Error en createBrand:', error)
        return res.status(500).json({ message: 'Error interno' })
    }
}

const updateBrand = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const { name, description, isActive } = req.body
        const file = req.file

        if (isNaN(formId)) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: "ID inválido" })
        }

        const brandExist = await prisma.brand.findUnique({ where: { id: formId } })

        if (!brandExist) {
            deleteUploadedFile(file)
            return res.status(404).json({ message: "No encontrado" })
        }

        if (!name || !name.trim()) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: "El nombre es obligatorio" })
        }

        if (name.trim().length > 25) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: "El nombre no puede superar 25 caracteres" })
        }

        if (description && description.length > 800) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: "La descripción no puede superar 800 caracteres" })
        }

        const customerSlug = slugify(name, { lower: true, strict: true })

        const existSlug = await prisma.brand.findFirst({
            where: { slug: customerSlug, NOT: { id: formId } }
        })

        if (existSlug) {
            deleteUploadedFile(file)
            return res.status(400).json({ message: "El nombre ya existe" })
        }

        let isActiveValue = isActive
        if (typeof isActiveValue === "string") isActiveValue = isActiveValue === "true"
        if (typeof isActiveValue !== "boolean") isActiveValue = brandExist.isActive

        let logoUrl = brandExist.logoUrl

        if (file) {
            if (brandExist.logoUrl) {
                const oldImagePath = path.join(__dirname, "../../", brandExist.logoUrl)
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath)
            }
            logoUrl = `/uploads/brand/${file.filename}`
        }

        const updatedBrand = await prisma.brand.update({
            where: { id: formId },
            data: { name, slug: customerSlug, description, logoUrl, isActive: isActiveValue }
        })

        return res.status(200).json({ message: "Marca actualizada", data: updatedBrand })

    } catch (error) {
        deleteUploadedFile(req.file)
        console.error("Error en updateBrand:", error)
        return res.status(500).json({ message: "Error interno" })
    }
}
const deleteBrand = async (req, res) => {
    try {

        const formId = Number(req.params.id);

        if (isNaN(formId)) {
            return res.status(400).json({
                message: "ID inválido"
            });
        }

        const brandExist = await prisma.brand.findUnique({
            where: {
                id: formId
            }
        });

        if (!brandExist) {
            return res.status(404).json({
                message: "No encontrado"
            });
        }


        const productExist = await prisma.product.findFirst({
            where: {
                brandId: formId
            }
        })

        if (productExist) {
            return res.status(400).json({
                message: "Tiene productos asociados"
            });
        }

        const discountCodeExist = await prisma.discountCodeBrand.findFirst({
            where: {
                brandId: formId
            }
        })

        if (discountCodeExist) {
            return res.status(400).json({
                message: "Tiene cupones de descuento asociados"
            });
        }

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR LOGO FÍSICO
        |--------------------------------------------------------------------------
        */

        if (brandExist.logoUrl) {

            const imagePath = path.join(
                __dirname,
                "../../",
                brandExist.logoUrl
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }

        }

        /*
        |--------------------------------------------------------------------------
        | ELIMINAR REGISTRO
        |--------------------------------------------------------------------------
        */

        const registerDelete =
            await prisma.brand.delete({
                where: {
                    id: formId
                }
            });

        return res.status(200).json({
            message: "Marca eliminada",
            data: registerDelete
        });

    } catch (error) {

        console.error(
            "Error al eliminar:",
            error
        );

        return res.status(500).json({
            message:
                "Error interno"
        });

    }
}

const allBrand = async (req, res) => {
    try {

        const all = await prisma.brand.findMany({
            orderBy: [
                { updatedAt: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        if (all.length === 0) {
            return res.status(200).json({ message: 'no existen registros aun' })
        }

        return res.status(200).json({ data: all })
    } catch (error) {
        return res.status(500).json({ message: 'Error interno' })
    }
}

const searchBrand = async (req, res) => {
  try {

    const q = (req.query.q || "").trim();

    if (!q) {
      return res.status(200).json({
        data: [],
      });
    }

    const brands = await prisma.brand.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
            },
          },
          {
            slug: {
              contains: q,
            },
          },
        ],
      },

      take: 20,
    });

    return res.status(200).json({
      data: brands,
    });

  } catch (error) {

    console.error(
      "Error searching brands:",
      error
    );

    return res.status(500).json({
      message: "Error al buscar",
    });

  }
};

const getPublicBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, logoUrl: true },
      orderBy: { name: "asc" },
    });
    return res.status(200).json({ data: brands });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    allBrand,
    searchBrand,
    getPublicBrands,
}