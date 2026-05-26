const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const createProduct = async (req, res) => {

    try {
        const { categoryId, brandId, name, slug, shortDescription, description, status, isActive } = req.body;

        if (!categoryId || !name || !slug) {
            return res.status(400).json({
                message: "el nombre no debe estar vacío y debes elegir una categoría"
            });
        }

        const slugExist = await prisma.product.findUnique({
            where: { slug }
        });

        if (slugExist) {
            return res.status(409).json({
                message: "el slug ya existe"
            });
        }

        const newProduct = await prisma.product.create({
            data: {
                categoryId,
                brandId,
                name,
                slug,
                shortDescription,
                description,
                status,
                isActive
            }
        });

        return res.status(201).json({
            message: "registro exitoso",
            data: newProduct
        });

    } catch (error) {

        return res.status(500).json({ menubar: "error interno del servidor" })

    }
};
const updateProduct = async (req, res) => {
    try {
        const formId = Number(req.params.id);

        if (isNaN(formId)) {
            return res.status(400).json({ message: "El id debe ser número" });
        }

        const {
            categoryId,
            brandId,
            name,
            slug,
            shortDescription,
            description,
            status,
            isActive
        } = req.body;

        const productExist = await prisma.product.findUnique({
            where: { id: formId }
        });

        if (!productExist) {
            return res.status(404).json({ message: "El registro no existe" });
        }

        if (!categoryId || !name || !slug) {
            return res.status(400).json({
                message: "categoryId, name y slug son obligatorios"
            });
        }

        const slugExist = await prisma.product.findFirst({
            where: {
                slug,
                NOT: { id: formId }
            }
        });

        if (slugExist) {
            return res.status(409).json({ message: "El slug ya existe" });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: formId },
            data: {
                categoryId,
                brandId,
                name,
                slug,
                shortDescription,
                description,
                status,
                isActive
            }
        });

        return res.status(200).json({
            message: "Registro actualizado correctamente",
            data: updatedProduct
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};
const deleteProduct = async (req, res) => {
  try {
    const formId = Number(req.params.id);

    if (isNaN(formId)) {
      return res.status(400).json({
        message: "El ID debe ser numérico"
      });
    }

    const productExist = await prisma.product.findUnique({
      where: { id: formId }
    });

    if (!productExist) {
      return res.status(404).json({
        message: "El registro no existe"
      });
    }

    const deletedProduct = await prisma.product.delete({
      where: { id: formId }
    });

    return res.status(200).json({
      message: "Registro eliminado exitosamente",
      data: deletedProduct
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
};


module.exports ={
    createProduct,
    updateProduct,
    deleteProduct
}