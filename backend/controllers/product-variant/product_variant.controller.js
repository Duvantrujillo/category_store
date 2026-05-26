const { ClientPrisma, PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()




const createProductVariant = async (req, res) => {
    try {
        const {
            productId,
            sku,
            barcode,
            price,
            cost,
            stock,
            weight,
            isDefault,
            isActive
        } = req.body;

        const skuExist = await prisma.productVariant.findUnique({
            where: { sku }
        });

        if (skuExist) {
            return res.status(409).json({ message: "El SKU ya existe" });
        }

        if (barcode) {
            const barcodeExist = await prisma.productVariant.findFirst({
                where: { barcode }
            });

            if (barcodeExist) {
                return res.status(409).json({ message: "El código de barras ya existe" });
            }
        }

        const newProductVariant = await prisma.productVariant.create({
            data: {
                productId,
                sku,
                barcode,
                price,
                cost,
                stock,
                weight,
                isDefault,
                isActive
            }
        });

        return res.status(201).json({
            message: "Variante creada correctamente",
            data: newProductVariant
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

const updateProductVariant = async (req, res) => {
    try {
        const formId = Number(req.params.id);

        if (isNaN(formId)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const {
            productId,
            sku,
            barcode,
            price,
            cost,
            stock,
            weight,
            isDefault,
            isActive
        } = req.body;

        // 1. verificar existencia
        const variantExist = await prisma.productVariant.findUnique({
            where: { id: formId }
        });

        if (!variantExist) {
            return res.status(404).json({ message: "La variante no existe" });
        }

        // 2. validar producto
        const productExist = await prisma.product.findUnique({
            where: { id: Number(productId) }
        });

        if (!productExist) {
            return res.status(404).json({ message: "El producto no existe" });
        }

        // 3. validar duplicado SKU
        const skuExist = await prisma.productVariant.findFirst({
            where: {
                sku,
                NOT: { id: formId }
            }
        });

        if (skuExist) {
            return res.status(409).json({ message: "El SKU ya existe" });
        }

        // 4. update
        const updated = await prisma.productVariant.update({
            where: { id: formId },
            data: {
                productId,
                sku,
                barcode,
                price,
                cost,
                stock,
                weight,
                isDefault,
                isActive
            }
        });

        return res.status(200).json({
            message: "Variante actualizada correctamente",
            data: updated
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};
const deleteProductVariant = async (req, res) => {
    try {
        const formId = Number(req.params.id);

        if (isNaN(formId)) {
            return res.status(400).json({
                message: "el ID debe ser numérico"
            });
        }

        const formIdExist = await prisma.productVariant.findUnique({
            where: {
                id: formId
            }
        });

        if (!formIdExist) {
            return res.status(404).json({
                message: "el registro no existe"
            });
        }

        const deletedProductVariant = await prisma.productVariant.delete({
            where: {
                id: formId
            }
        });

        return res.status(200).json({
            message: "el registro fue eliminado exitosamente",
            data: deletedProductVariant
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "error interno del servidor"
        });
    }
};

const allProductVariant = async (req,res) => {
    const all = await prisma.productVariant.findMany()

    if (all.length === 0){
        return res.status(200).json({message: "no hay registros aun"})
    }

    return res.status(200).json({data: all})
}

module.exports ={
    createProductVariant,
    updateProductVariant,
    deleteProductVariant,
    allProductVariant
}