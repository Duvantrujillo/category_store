const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const slugify = require('slugify')
const fs = require("fs");
const path = require("path");


const createBrand = async (req, res) => {
    try {
        const { name, description, isActive } = req.body
        const file = req.file

        if (!name) {
            return res.status(400).json({ message: 'Nombre requerido' })
        }

        if (!file) {
            return res.status(400).json({ message: 'Logo requerido' })
        }

        const customerSlug = slugify(name, { lower: true, strict: true })

        const slugExist = await prisma.brand.findUnique({
            where: { slug: customerSlug }
        })

        if (slugExist) {
            return res.status(409).json({ message: 'El nombre ya existe' })
        }

        // Convertir isActive a boolean
        let isActiveValue = isActive
        if (typeof isActiveValue === "string") {
            isActiveValue = isActiveValue === "true"
        }
        if (typeof isActiveValue !== "boolean") {
            isActiveValue = false
        }

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

        return res.status(201).json({
            message: 'Marca creada',
            data: newBrand
        })

    } catch (error) {
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
            return res.status(400).json({ message: "ID inválido" })
        }

        const brandExist = await prisma.brand.findUnique({
            where: { id: formId }
        })

        if (!brandExist) {
            return res.status(404).json({ message: "No encontrado" })
        }

        if (!name) {
            return res.status(400).json({ message: "Nombre requerido" })
        }

        // 🔹 slug
        const customerSlug = slugify(name, {
            lower: true,
            strict: true
        })

        const existSlug = await prisma.brand.findFirst({
            where: {
                slug: customerSlug,
                NOT: { id: formId }
            }
        })

        if (existSlug) {
            return res.status(400).json({ message: "El nombre ya existe" })
        }

        // 🔥 CONVERTIR BOOLEAN BIEN
        let isActiveValue = isActive

        if (typeof isActiveValue === "string") {
            isActiveValue = isActiveValue === "true"
        }

        if (typeof isActiveValue !== "boolean") {
            isActiveValue = brandExist.isActive // mantener valor anterior
        }

        // 🔥 LOGO OPCIONAL
        let logoUrl = brandExist.logoUrl

        if (file) {
            logoUrl = `/uploads/brand/${file.filename}`
        }

        if (file && brandExist.logoUrl) {

            const oldImagePath = path.join(
                __dirname,
                "../../",
                brandExist.logoUrl
            );

            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

        }

        // 🔥 UPDATE FINAL
        const updatedBrand = await prisma.brand.update({
            where: { id: formId },
            data: {
                name,
                slug: customerSlug,
                description,
                logoUrl,
                isActive: isActiveValue
            }
        })

        return res.status(200).json({
            message: "Marca actualizada",
            data: updatedBrand
        })

    } catch (error) {
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

module.exports = {
    createBrand,
    updateBrand,
    deleteBrand,
    allBrand,
    searchBrand
}