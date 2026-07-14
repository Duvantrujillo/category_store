const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const createproductVarianAtribute = async (req, res) => {
    try {
        const { productVariantId, attributeValueId } = req.body
        if (!productVariantId || !attributeValueId) {
            return res.status(400).json({ message: "Campos requeridos" })
        }

        const variantIdNum = Number(productVariantId)
        const attributeIdNum = Number(attributeValueId)

        if (!Number.isInteger(variantIdNum) || variantIdNum <= 0 || !Number.isInteger(attributeIdNum) || attributeIdNum <= 0) {
            return res.status(400).json({ message: "IDs inválidos" })
        }

        const productVariantIdExist = await prisma.productVariant.findUnique({
            where: { id: variantIdNum }
        })

        if (!productVariantIdExist) {
            return res.status(400).json({ message: "Variante no encontrada" })
        }

        const attributeValueIdExist = await prisma.attributeValue.findUnique({
            where: { id: attributeIdNum }
        })

        if (!attributeValueIdExist) {
            return res.status(400).json({ message: "Atributo no encontrado" })
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
                message: "Atributo ya asignado"
            })
        }

        // Si pasa el filtro, ahora sí se puede crear de forma segura
        const newproductVarianAtribute = await prisma.productVariantAttribute.create({
            data: {
                productVariantId: variantIdNum,
                attributeValueId: attributeIdNum
            }
        })

        return res.status(201).json({ message: "Atributo asignado" })
    } catch (error) {
        console.error(error) // Importante mantenerlo para ver otros problemas en la consola
        return res.status(500).json({ message: "Error interno" })
    }
}

const updateproductVarianAtribute = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const { productVariantId, attributeValueId } = req.body
        const productVariantIdNum = Number(productVariantId)
        const attributeValueIdNum = Number(attributeValueId)

        if (isNaN(formId)) {
            return res.status(400).json({ message: "ID inválido" })
        }

        const formIdExist = await prisma.productVariantAttribute.findUnique({
            where: { id: formId }
        })

        if (!formIdExist) {
            return res.status(400).json({ message: "No encontrado" })
        }

        if (!productVariantIdNum || !attributeValueIdNum) {
            return res.status(400).json({ message: "Campos requeridos" })
        }

        const productVariantExist = await prisma.productVariant.findUnique({
            where: { id: productVariantIdNum }
        })

        if (!productVariantExist) {
            return res.status(400).json({ message: "Variante no encontrada" })
        }

        const attributeValueIdExist = await prisma.attributeValue.findUnique({
            where: { id: attributeValueIdNum }
        })

        // ⬇️ CORREGIDO: Ahora sí valida si la consulta a la BD trajo resultados
        if (!attributeValueIdExist) {
            return res.status(400).json({ message: "Atributo no encontrado" })
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
        return res.status(200).json({ message: "Atributo actualizado" })

    } catch (error) {
        console.error(error) // 💡 Indispensable para debuguear en tu terminal
        return res.status(500).json({ message: "Error interno" }) // 🛡️ Evita que el servidor se quede colgado
    }
}

const deleteproductVarianAtribute = async (req, res) => {

    try {
        const formId = Number(req.params.id)
        if (isNaN(formId)) {
            return res.status(400).json({ message: "ID inválido" })
        }
        const formaIdExist = await prisma.productVariantAttribute.findUnique({
            where: {
                id: formId
            }
        })


        if (!formaIdExist) {
            return res.status(400).json({ message: "No encontrado" })
        }

        const deletedproductVarianAtribute = await prisma.productVariantAttribute.delete({
            where: {
                id: formId
            }
        })

        return res.status(200).json({ message: "Atributo eliminado" })
    } catch (error) {
        return res.status(500).json({ message: "Error interno" })
    }

}

const allproductVarianAtribute = async (req, res) => {
    try {
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
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}


module.exports = {
    createproductVarianAtribute,
    updateproductVarianAtribute,
    deleteproductVarianAtribute,
    allproductVarianAtribute
}