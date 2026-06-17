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
      return res.status(400).json({ message: "Categoría no encontrada" });
    }
    const hasChildren = await prisma.category.findFirst({
  where: {
    parentId: categoryIdNumb,
  },
  select: { id: true },
});

if (hasChildren) {
  return res.status(400).json({
    message: "Solo se pueden asignar productos a categorías hija",
  });
}

    if (brandIdNumb) {
      const brandExists = await prisma.brand.findUnique({
        where: { id: brandIdNumb },
      });

      if (!brandExists) {
        return res.status(400).json({ message: "Marca no encontrada" });
      }
    }

    let brandName = '';

if (brandIdNumb) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandIdNumb },
    select: { name: true }
  });

  brandName = brand?.name || '';
}

const slugBase = `${name} ${brandName}`.trim();

const slug = slugify(slugBase, {
  strict: true,
  lower: true
});
const slugExist = await prisma.product.findUnique({
  where: {
    slug: slug
  }
})

if (slugExist) {
  return res.status(400).json({
    message: "El nombre ya existe"
  })
}
    const mainImage = file
      ? `/uploads/product/${file.filename}`
      : null;

    const newProduct = await prisma.product.create({
      data: {
        categoryId: categoryIdNumb,
        brandId: brandIdNumb,
        name,
        slug,
        description,
        mainImage,
        status
      },
    });

    return res.status(201).json({
      message: "Producto creado",
      data: newProduct,
    });
  } catch (error) {
    console.log("🔥 ERROR CREATE PRODUCT:", error);

    return res.status(500).json({
      message: "Error interno",
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
      description,
      status,
    } = req.body;

    const categoryIdNumb = Number(categoryId);
    const brandIdNumb = brandId ? Number(brandId) : null;

    const productExist = await prisma.product.findUnique({
      where: { id: formId },
    });

    if (!productExist) {
      return res.status(404).json({ message: "No encontrado" });
    }

    if (!Number.isInteger(categoryIdNumb) || !name) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryIdNumb },
    });

    if (!categoryExists) {
      return res.status(400).json({ message: "Categoría no encontrada" });
    }

    if (brandIdNumb) {
      const brandExists = await prisma.brand.findUnique({
        where: { id: brandIdNumb },
      });

      if (!brandExists) {
        return res.status(400).json({ message: "Marca no encontrada" });
      }
    }

const brandToUse = brandIdNumb || productExist.brandId;

let brandName = '';

if (brandToUse) {
  const brand = await prisma.brand.findUnique({
    where: { id: brandToUse },
    select: { name: true }
  });

  brandName = brand?.name || '';
}

const slug = slugify(`${name} ${brandName}`.trim(), {
  strict: true,
  lower: true
});


const slugExist = await prisma.product.findFirst({
  where: {
    slug: slug,
    NOT: {
      id: formId
    }
  }
})

if (slugExist) {
  return res.status(400).json({
    message: "El nombre ya existe"
  })
}

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
        description,
        mainImage,
        status,
      },
    });

    return res.status(200).json({
      message: "Producto actualizado",
      data: updatedProduct,
    });
  } catch (error) {
    console.log("🔥 UPDATE ERROR:", error);

    return res.status(500).json({
      message: "Error interno",
    });
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
      return res.status(200).json({
        data: [],
      });
    }

    const products = await prisma.product.findMany({
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
          {
            category: {
              name: {
                contains: q,
              },
            },
          },
          {
            brand: {
              name: {
                contains: q,
              },
            },
          },
        ],
      },

      include: {
        category: true,
        brand: true,
        variants: true,
      },

      take: 20,
    });

    return res.status(200).json({
      data: products,
    });

  } catch (error) {

    console.error(
      "Error searching products:",
      error
    );

    return res.status(500).json({
      message: "Error al buscar",
    });

  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  allProduct,
  searchProduct
}