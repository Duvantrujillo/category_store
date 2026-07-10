const { PrismaClient } = require("@prisma/client");
const slugify = require('slugify')
const prisma = new PrismaClient()
const { buildSearchStems } = require("../../utils/search-stems");


const createAtribute_Value = async (req, res) => {
    try {
        const { value, attributeId, sortOrder } = req.body


        if (!value || !value.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio" })
        }

        if (value.trim().length > 20) {
            return res.status(400).json({ message: "El nombre no puede superar 20 caracteres" })
        }

        const attributeIdNumb = Number(attributeId)
        if (!Number.isInteger(attributeIdNumb) || attributeIdNumb <= 0) {
            return res.status(400).json({ message: "attributeId inválido" })
        }

        const customerSlug = slugify(value, {
            lower: true,
            strict: true
        })

        const attributeIdExist = await prisma.attribute.findUnique({
            where: {
                id: attributeIdNumb
            }
        })

        if (!attributeIdExist) {
            return res.status(400).json({ message: "Atributo no encontrado" })
        }

        // Slug único dentro del mismo atributo (no global)
        const slugExist = await prisma.attributeValue.findFirst({
            where: { slug: customerSlug, attributeId: attributeIdNumb }
        })
        if (slugExist) {
            return res.status(400).json({ message: "El nombre ya existe para este atributo" })
        }


        const newAttributeValue = await prisma.attributeValue.create({
            data: {
                value: value,
                slug: customerSlug,
                attributeId: attributeIdNumb,
            }
        })

        return res.status(201).json({ message:"Valor creado", newAttributeValue })

    } catch (error) {
        console.error(error) // Recomendado para que puedas ver el error real en tu consola
        return res.status(500).json({ message:"Error interno" })
    }
}


const updateAtribute_Value = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const { value, slug, attributeId, sortOrder } = req.body

        if (isNaN(formId)) {
            return res.status(400).json({ message:"ID inválido" })
        }

        const idExist = await prisma.attributeValue.findFirst({
            where: { id: formId },
        })

        if (!idExist) {
            return res.status(404).json({ message:"No encontrado" })
        }

        if (!value || !value.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio" })
        }

        if (value.trim().length > 20) {
            return res.status(400).json({ message: "El nombre no puede superar 20 caracteres" })
        }

        // A diferencia de create, acá attributeId puede venir sin cambios —
        // pero si viene, tiene que ser válido y existir de verdad; si no se
        // manda, se conserva el que ya tenía la fila en vez de guardar NaN.
        let attributeIdNumb = idExist.attributeId
        if (typeof attributeId !== 'undefined' && attributeId !== null && attributeId !== '') {
            attributeIdNumb = Number(attributeId)
            if (!Number.isInteger(attributeIdNumb) || attributeIdNumb <= 0) {
                return res.status(400).json({ message: "attributeId inválido" })
            }
            const attributeIdExist = await prisma.attribute.findUnique({ where: { id: attributeIdNumb } })
            if (!attributeIdExist) {
                return res.status(400).json({ message: "Atributo no encontrado" })
            }
        }

        const customerSlug = slugify(value, {
            lower: true,
            strict: true
        })

        const slugExist = await prisma.attributeValue.findFirst({
            where: {
                slug: customerSlug,
                attributeId: attributeIdNumb,
                NOT: { id: formId }
            }
        })

        if (slugExist) {
            return res.status(400).json({ message: "El nombre ya existe para este atributo" })
        }

        const registerUpdate = await prisma.attributeValue.update({
            where: { id: formId },
            data: {
                value,
                slug: customerSlug,
                attributeId: attributeIdNumb,
            }
        })

        return res.status(200).json({ message:"Valor actualizado", registerUpdate })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message:"Error interno" })
    }
}



const deleteAtribute_Value = async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).json({
                message: 'ID inválido'
            })
        }

        const inUse = await prisma.productVariantAttribute.findFirst({
            where: { attributeValueId: id },
            select: { id: true },
        })

        if (inUse) {
            return res.status(400).json({
                message: "Tiene variantes de producto asociadas"
            })
        }

        await prisma.attributeValue.delete({
            where: { id }
        })

        return res.status(200).json({
            message: 'Valor eliminado'
        })

    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                message: 'No encontrado'
            })
        }

        return res.status(500).json({
            message: 'Error interno'
        })
    }
}

const allAtribute_Value = async (req, res) => {
    try {
        const all = await prisma.attributeValue.findMany({
            include: {
                attribute: true
            },
            orderBy: [
                { updatedAt: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        if (all.length === 0) {
            return res.status(200).json({ message: "no hay registros aun" })
        }

        return res.status(200).json({ data: all })
    } catch (error) {
        return res.status(500).json({ message: "Error interno" })
    }
}


const searchAttributeValue = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q) return res.status(200).json({ data: [] });

    const stems = buildSearchStems(q);

    const values = await prisma.attributeValue.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { value:   { contains: s } },
            { slug:    { contains: s } },
            { attribute: { name: { contains: s } } },
          ],
        })),
      },
      include: { attribute: true },
      take: 20,
    });

    return res.status(200).json({ data: values });
  } catch (error) {
    return res.status(500).json({ message: "Error al buscar" });
  }
};

module.exports = {
    createAtribute_Value,
    updateAtribute_Value,
    deleteAtribute_Value,
    allAtribute_Value,
    searchAttributeValue,
}