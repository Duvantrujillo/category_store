const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const createproductVarianAtribute = async (req, res) => {
    try {
        const { productVariantId, attributeValueId } = req.body
        if (!productVariantId || !attributeValueId) {
            return res.status(400).json({ message: "debes selecionr un producto y su atributo" })
        }

        const variantIdNum = Number(productVariantId)
        const attributeIdNum = Number(attributeValueId)

        const productVariantIdExist = await prisma.productVariant.findUnique({
            where: { id: variantIdNum }
        })

        if (!productVariantIdExist) {
            return res.status(400).json({ message: "el producto no existe" })
        }

        const attributeValueIdExist = await prisma.attributeValue.findUnique({
            where: { id: attributeIdNum }
        })

        if (!attributeValueIdExist) {
            return res.status(400).json({ message: "el atributo no existe" })
        }

        // 🛡️ NUEVO CONTROL: Evita el error P2002 de Prisma
        const relationAlreadyExists = await prisma.productVariantAttribute.findFirst({
            where: {
                productVariantId: variantIdNum,
                attributeValueId: attributeIdNum
            }
        })

        if (relationAlreadyExists) {
            return res.status(400).json({
                message: "Este atributo ya se encuentra asignado a la variante del producto"
            })
        }

        // Si pasa el filtro, ahora sí se puede crear de forma segura
        const newproductVarianAtribute = await prisma.productVariantAttribute.create({
            data: {
                productVariantId: variantIdNum,
                attributeValueId: attributeIdNum
            }
        })

        return res.status(201).json({ message: "Registro exitoso" })
    } catch (error) {
        console.error(error) // Importante mantenerlo para ver otros problemas en la consola
        return res.status(500).json({ message: "error interno del servidor " })
    }
}

const updateproductVarianAtribute = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const { productVariantId, attributeValueId } = req.body
        const productVariantIdNum = Number(productVariantId)
        const attributeValueIdNum = Number(attributeValueId)

        if (isNaN(formId)) {
            return res.status(400).json({ message: "el Id debe ser numerico" })
        }

        const formIdExist = await prisma.productVariantAttribute.findUnique({
            where: { id: formId }
        })

        if (!formIdExist) {
            return res.status(400).json({ message: "el Registro no existe" })
        }

        if (!productVariantIdNum || !attributeValueIdNum) {
            return res.status(400).json({ message: "debes seleccionar un porducto y un atributo" })
        }

        const productVariantExist = await prisma.productVariant.findUnique({
            where: { id: productVariantIdNum }
        })

        if (!productVariantExist) {
            return res.status(400).json({ message: "el producto no existe" })
        }

        const attributeValueIdExist = await prisma.attributeValue.findUnique({
            where: { id: attributeValueIdNum }
        })

        // ⬇️ CORREGIDO: Ahora sí valida si la consulta a la BD trajo resultados
        if (!attributeValueIdExist) {
            return res.status(400).json({ message: "el atributo no existe" })
        }

        // ⬇️ CORREGIDO: Mapeo correcto de base de datos -> variable numérica
        const updatedproductVarianAtribute = await prisma.productVariantAttribute.update({
            where: { id: formId },
            data: {
                productVariantId: productVariantIdNum, // ✅ Campo correcto de tu BD
                attributeValueId: attributeValueIdNum  // ✅ Campo correcto de tu BD
            }
        })

        // Nota: Para actualizaciones exitosas se suele usar el estado 200 en vez de 201 (201 es para creación)
        return res.status(200).json({ message: "registro actualizado correctamente" })

    } catch (error) {
        console.error(error) // 💡 Indispensable para debuguear en tu terminal
        return res.status(500).json({ message: "error interno del servidor" }) // 🛡️ Evita que el servidor se quede colgado
    }
}

const deleteproductVarianAtribute = async (req, res) => {

    try {
        const formId = Number(req.params.id)
        if (isNaN(formId)) {
            return res.status(400).json({ message: "el ID debe ser numerico" })
        }
        const formaIdExist = await prisma.productVariantAttribute.findUnique({
            where: {
                id: formId
            }
        })


        if (!formaIdExist) {
            return res.status(400).json({ message: "el registro no existe" })
        }

        const deletedproductVarianAtribute = await prisma.productVariantAttribute.delete({
            where: {
                id: formId
            }
        })

        return res.status(200).json({ message: "registro eliminado exitosamente" })
    } catch (error) {
        return res.status(500).json({ message: "error interno del servidor" })
    }

}

const allproductVarianAtribute = async (req, res) => {
    const all = await prisma.productVariantAttribute.findMany({
        orderBy: [
            { updatedAt: 'desc' },
            { createdAt: 'desc' }
        ]
    })

    if (all.length === 0) {
        return res.status(200).json({ message: "no existen registro aun" })
    }

    return res.status(200).json({ data: all })
}


module.exports = {
    createproductVarianAtribute,
    updateproductVarianAtribute,
    deleteproductVarianAtribute,
    allproductVarianAtribute
}