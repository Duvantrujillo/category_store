const { PrismaClient } = require("@prisma/client");
const slugify = require('slugify')
const prisma = new PrismaClient()


const createAtribute_Value = async (req, res) => {
    try {
        const { value, attributeId, sortOrder } = req.body


        if (!value || !value.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio" })
        }

        if (value.trim().length > 20) {
            return res.status(400).json({ message: "El nombre no puede superar 20 caracteres" })
        }

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
            return res.status(400).json({ Messages: "El nombre ya existe" })
        }




        const attributeIdExist = await prisma.attribute.findUnique({
            where: {
                id: attributeId
            }
        })

        if (!attributeIdExist) {
            return res.status(400).json({ message: "Atributo no encontrado" })
        }





        const newAttributeValue = await prisma.attributeValue.create({
            data: {
                value: value,
                slug: customerSlug,
                attributeId: Number(attributeId),
            }
        })

        return res.status(201).json({ Messages: "Valor creado", newAttributeValue })

    } catch (error) {
        console.error(error) // Recomendado para que puedas ver el error real en tu consola
        return res.status(500).json({ Messages: "Error interno" })
    }
}


const updateAtribute_Value = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const { value, slug, attributeId, sortOrder } = req.body

        if (isNaN(formId)) {
            return res.status(400).json({ Messages: "ID inválido" })
        }

        const idExist = await prisma.attributeValue.findFirst({
            where: { id: formId },
        })

        if (!idExist) {
            return res.status(404).json({ Messages: "No encontrado" })
        }

        if (!value || !value.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio" })
        }

        if (value.trim().length > 20) {
            return res.status(400).json({ message: "El nombre no puede superar 20 caracteres" })
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
            return res.status(400).json({ Messages: "El nombre ya existe" })
        }

        const registerUpdate = await prisma.attributeValue.update({
            where: { id: formId },
            data: {
                value,
                slug: customerSlug,
                attributeId: Number(attributeId),
            }
        })

        return res.status(200).json({ Messages: "Valor actualizado", registerUpdate })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ Messages: "Error interno" })
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

        const productExist = await prisma.product.findUnique({
            where: {
                id: id
            }
        })

        if (productExist) {
            return res.status(400).json({
                message: "Tiene productos asociados"
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

    const values = await prisma.attributeValue.findMany({
      where: {
        OR: [
          { value:   { contains: q } },
          { slug:    { contains: q } },
          { attribute: { name: { contains: q } } },
        ],
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