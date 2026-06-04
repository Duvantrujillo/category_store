const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const slugify = require('slugify')
const fs = require('fs');
const path = require('path');

const createProduct = async (req, res) => {
  try {
    const {
      categoryId,
      brandId,
      name,
      shortDescription,
      description,
      status
    } = req.body;

    const file = req.file;

    const categoryIdNumb = Number(categoryId);
    const brandIdNumb = brandId ? Number(brandId) : null;

    if (!Number.isInteger(categoryIdNumb)) {
      return res.status(400).json({ message: "categoryId inválido" });
    }

    if (!name) {
      return res.status(400).json({ message: "Nombre requerido" });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryIdNumb },
    });

    if (!categoryExists) {
      return res.status(400).json({ message: "Categoría no existe" });
    }

    if (brandIdNumb) {
      const brandExists = await prisma.brand.findUnique({
        where: { id: brandIdNumb },
      });

      if (!brandExists) {
        return res.status(400).json({ message: "Marca no existe" });
      }
    }

    const slug = slugify(name, { strict: true, lower: true });

    const mainImage = file
      ? `/uploads/product/${file.filename}`
      : null;

    const newProduct = await prisma.product.create({
      data: {
        categoryId: categoryIdNumb,
        brandId: brandIdNumb,
        name,
        slug,
        shortDescription,
        description,
        mainImage,
        status
      },
    });

    return res.status(201).json({
      message: "Registro exitoso",
      data: newProduct,
    });
  } catch (error) {
    console.log("🔥 ERROR CREATE PRODUCT:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};




const updateProduct = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    const file = req.file;

    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const {
      categoryId,
      brandId,
      name,
      shortDescription,
      description,
      status,
    } = req.body;

    const categoryIdNumb = Number(categoryId);
    const brandIdNumb = brandId ? Number(brandId) : null;

    const productExist = await prisma.product.findUnique({
      where: { id: formId },
    });

    if (!productExist) {
      return res.status(404).json({ message: "No existe" });
    }

    if (!Number.isInteger(categoryIdNumb) || !name) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryIdNumb },
    });

    if (!categoryExists) {
      return res.status(400).json({ message: "Categoría no existe" });
    }

    if (brandIdNumb) {
      const brandExists = await prisma.brand.findUnique({
        where: { id: brandIdNumb },
      });

      if (!brandExists) {
        return res.status(400).json({ message: "Marca no existe" });
      }
    }

    const slug = slugify(name, { strict: true, lower: true });

    let mainImage = productExist.mainImage;

    if (file) {
      mainImage = `/uploads/product/${file.filename}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: formId },
      data: {
        categoryId: categoryIdNumb,
        brandId: brandIdNumb,
        name,
        slug,
        shortDescription,
        description,
        mainImage,
        status,
      },
    });

    return res.status(200).json({
      message: "Actualizado correctamente",
      data: updatedProduct,
    });
  } catch (error) {
    console.log("🔥 UPDATE ERROR:", error);

    return res.status(500).json({
      message: error.message,
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


    const deletedProduct = await prisma.product.delete({
      where: { id: formId }
    });

    return res.status(200).json({
      message: "Registro eliminado exitosamente",
      data: deletedProduct
    });

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Error interno del servidor"
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
      message: "Error interno del servidor",
    });
  }
};


module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  allProduct
}