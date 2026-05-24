const express = require('express')
const router = express.Router()

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()


router.post('/create', async (req, res) => {
    try {
        const { value, slug, attributeId, sortOrder } = req.body

        const slugExist = await prisma.attributeValue.findFirst({
            where: {
                slug: slug
            }
        })

        if (slugExist) {
            return res.status(400).json({ Messages: "el slug ya existe" })
        }

        const newAttributeValue = await prisma.attributeValue.create({
            data: {
                value: value,
                slug: slug,
                attributeId: Number(attributeId), // Asegura que sea un número entero
                sortOrder: sortOrder ? Number(sortOrder) : 0
            }
        })

        return res.status(201).json({ Messages: "Registro exitoso", newAttributeValue })

    } catch (error) {
        console.error(error) // Recomendado para que puedas ver el error real en tu consola
        return res.status(500).json({ Messages: "error interno del servidor" })
    }
})

router.put('/update/:id', async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const { value, slug, attributeId, sortOrder } = req.body

        if (isNaN(formId)) {
            return res.status(400).json({ Messages: "el id es invalido" }) // Unificado a Messages
        }

        const idExist = await prisma.attributeValue.findFirst({
            where: { id: formId }
        })

        if (!idExist) {
            return res.status(404).json({ Messages: "No se encontro este registro" }) // Cambiado a 404 Not Found
        }

        const slugExist = await prisma.attributeValue.findFirst({
            where: {
                slug: slug,
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
                slug,
                attributeId: Number(attributeId),
                sortOrder: sortOrder ? Number(sortOrder) : 0
            }
        })

        return res.status(200).json({ Messages: "Registro Exitoso", registerUpdate })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ Messages: "error interno del servidor" })
    }
})

router.delete('/delete/:id', async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (isNaN(id)) {
            return res.status(400).json({
                message: 'El id debe ser numérico'
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
})

router.get('/all', async (req, res) => {
    try {
        const all = await prisma.attributeValue.findMany()

        if (all.length === 0) {
            return res.status(200).json({ message: "no hay registros aun" })
        }

        return res.status(200).json({ data: all })
    } catch (error) {
        return res.status(500).json({ message: "error interno del servidor" })
    }
})
module.exports = router
