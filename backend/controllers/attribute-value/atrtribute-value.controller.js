const { PrismaClient } = require("@prisma/client");
const slugify = require('slugify')
const prisma = new PrismaClient()


const createAtribute_Value = async (req, res) => {
    try {
        const { value, attributeId, sortOrder } = req.body


        const customerSlug = slugify(value, {
            lower: true,
            strict: true
        })




        const slugExist = await prisma.attributeValue.findFirst({
            where: {
                slug: customerSlug
            }
        })

        if (slugExist) {
            return res.status(400).json({ Messages: "el slug ya existe" })
        }




        const attributeIdExist = await prisma.attribute.findUnique({
            where: {
                id: attributeId
            }
        })

        if (!attributeIdExist) {
            return res.status(400).json({ message: "el Atributo no existe" })
        }





        const newAttributeValue = await prisma.attributeValue.create({
            data: {
                value: value,
                slug: customerSlug,
                attributeId: Number(attributeId),
            }
        })

        return res.status(201).json({ Messages: "Registro exitoso", newAttributeValue })

    } catch (error) {
        console.error(error) // Recomendado para que puedas ver el error real en tu consola
        return res.status(500).json({ Messages: "error interno del servidor" })
    }
}


const updateAtribute_Value = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const { value, slug, attributeId, sortOrder } = req.body

        if (isNaN(formId)) {
            return res.status(400).json({ Messages: "el id es invalido" }) // Unificado a Messages
        }

        const idExist = await prisma.attributeValue.findFirst({
            where: { id: formId },

        })

        if (!idExist) {
            return res.status(404).json({ Messages: "No se encontro este registro" }) // Cambiado a 404 Not Found
        }

        const customerSlug = slugify(value, {
            lower: true,
            strict: true
        })

        const slugExist = await prisma.attributeValue.findFirst({
            where: {
                slug: customerSlug,
                NOT: {
                    id: formId
                }
            }
        })

        if (slugExist) {
            return res.status(400).json({ Messages: "la slug ya existe" })
        }

        const registerUpdate = await prisma.attributeValue.update({
            where: { id: formId },
            data: {
                value,
                slug: customerSlug,
                attributeId: Number(attributeId),
            }
        })

        return res.status(200).json({ Messages: "Registro Exitoso", registerUpdate })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ Messages: "error interno del servidor" })
    }
}



const deleteAtribute_Value = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).json({
                message: 'El id debe ser numérico'
            })
        }

        const productExist = await prisma.product.findUnique({
            where: {
                id: id
            }
        })

        if (productExist) {
            return res.status(400).json({
                message: "No se puede eliminar este registro porque está asociado a uno o más productos."
            })
        }

        await prisma.attributeValue.delete({
            where: { id }
        })

        return res.status(200).json({
            message: 'Registro eliminado correctamente'
        })

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                message: 'El registro no existe'
            })
        }

        return res.status(500).json({
            message: 'Error interno del servidor'
        })
    }
}

const allAtribute_Value = async (req, res) => {
    try {
        const all = await prisma.attributeValue.findMany({
            include: {
                attribute: true
            }
        })

        if (all.length === 0) {
            return res.status(200).json({ message: "no hay registros aun" })
        }

        return res.status(200).json({ data: all })
    } catch (error) {
        return res.status(500).json({ message: "error interno del servidor" })
    }
}


module.exports = {
    createAtribute_Value,
    updateAtribute_Value,
    deleteAtribute_Value,
    allAtribute_Value,
}