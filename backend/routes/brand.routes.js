const express = require('express')
const router = express.Router()


const { PrismaClient } = require("@prisma/client")
const { route } = require('./attribute-values.routes')

const prisma = new PrismaClient()


router.post('/create', async (req, res) => {
    try {
        const { name, slug, description, logoUrl, isActive } = req.body;

        // 1. Validar que vengan los datos obligatorios mínimos
        if (!name || !slug) {
            return res.status(400).json({ message: "El nombre y el slug son requeridos" });
        }

        // 2. Verificar duplicados (Corregido: Usa tu modelo real, ej: brand o branch)
        const slugExist = await prisma.brand.findUnique({
            where: { slug }
        });

        if (slugExist) {
            // CORREGIDO: Status 409 (Conflicto) y ortografía de 'message'
            return res.status(409).json({ message: "El slug ya se encuentra duplicado" });
        }

        // 3. Crear el registro
        const newBrand = await prisma.brand.create({
            data: { name, slug, description, logoUrl, isActive }
        });

        // CORREGIDO: Es mejor práctica retornar el objeto creado junto al mensaje de éxito
        return res.status(201).json({
            message: "Registro exitoso",
            data: newBrand
        });

    } catch (error) {
        console.error("Error en createBrand:", error); // Vital para que puedas debuguear en consola
        return res.status(500).json({ message: "Error interno del servidor" });
    }

})
router.put('/update/:id', async (req, res) => {
    try {
        const formId = Number(req.params.id)
        const { name, slug, description, logoUrl, isActive } = req.body

        // CORREGIDO: Status 400 (Petición incorrecta)
        if (isNaN(formId)) {
            return res.status(400).json({ message: "El ID debe ser numérico" })
        }

        // CORREGIDO: Ortografía de 'message'
        if (!name || !slug) {
            return res.status(400).json({ message: "Los campos nombre y slug no deben estar vacíos" })
        }

        const formIdExist = await prisma.brand.findUnique({
            where: {
                id: formId
            }
        })

        // CORREGIDO: Status 404 (No encontrado)
        if (!formIdExist) {
            return res.status(404).json({ message: "El registro no existe" })
        }

        // CORREGIDO: Sintaxis oficial de Prisma con 'where' y 'data'
        const registerUpdate = await prisma.brand.update({
            where: { id: formId },
            data: {
                name,
                slug,
                description,
                logoUrl,
                isActive
            }
        })

        // CORREGIDO: Status 200 para actualizaciones + devolvemos el registro actualizado
        return res.status(200).json({
            message: "Registro actualizado correctamente",
            data: registerUpdate
        })

    } catch (error) {
        // CORREGIDO: Evita que la petición se quede colgada si hay un error inesperado
        console.error("Error al actualizar:", error)
        return res.status(500).json({ message: "Error interno del servidor" })
    }
})
router.delete('/delete/:id', async (req, res) => {
    try {
        const formId = Number(req.params.id)

        // CORREGIDO: Status 400 y ortografía de 'message'
        if (isNaN(formId)) {
            return res.status(400).json({ message: "El ID debe ser numérico" })
        }

        const formIdExist = await prisma.brand.findUnique({
            where: {
                id: formId
            }
        })

        // CORREGIDO: Status 404 (No encontrado) ya que el registro no existe
        if (!formIdExist) {
            return res.status(404).json({ message: "El registro a eliminar no existe" })
        }

        // ¡Perfecto! El uso de Prisma aquí está impecable
        const registerDelete = await prisma.brand.delete({
            where: {
                id: formId
            }
        })

        // Tip PRO: Devolver 'registerDelete' le permite al frontend saber qué fue lo que borró
        return res.status(200).json({
            message: 'El registro fue eliminado satisfactoriamente',
            data: registerDelete
        })

    } catch (error) {
        console.error("Error al eliminar:", error) // No olvides el console.error para poder debuguear
        return res.status(500).json({ message: 'Error interno del servidor' })
    }
})
router.get('/all', async (req, res) => {

    try {

        const all = await prisma.brand.findMany()

        if (all.length === 0) {
            return res.status(200).json({ message: 'no existen registros aun' })
        }

        return res.status(200).json({ data: all })
    } catch (error) {
        return res.status(500).json({ message: 'error interno del servidor' })
    }
})


module.exports = router