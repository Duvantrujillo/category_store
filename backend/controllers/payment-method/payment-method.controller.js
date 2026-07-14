const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const VALID_TYPES = ['DIGITAL_WALLET', 'BANK_TRANSFER', 'CREDIT_CARD', 'INTERNATIONAL', 'CASH']

// GET /payment-method/all — público, solo los activos (para mostrar en el storefront)
const getActivePaymentMethods = async (req, res) => {
    try {
        const methods = await prisma.paymentMethod.findMany({
            where: { isActive: true },
            select: { id: true, name: true, type: true },
            orderBy: { id: 'asc' },
        })

        return res.status(200).json({ methods })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

// GET /payment-method/admin/all — admin, incluye inactivos
const allPaymentMethodsAdmin = async (req, res) => {
    try {
        const methods = await prisma.paymentMethod.findMany({
            orderBy: { id: 'asc' },
        })
        return res.status(200).json({ data: methods })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

const createPaymentMethod = async (req, res) => {
    try {
        const { name, type, isActive } = req.body

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio" })
        }
        if (name.trim().length > 60) {
            return res.status(400).json({ message: "El nombre no puede superar 60 caracteres" })
        }
        if (!type || !VALID_TYPES.includes(type)) {
            return res.status(400).json({ message: "El tipo no es válido" })
        }

        const created = await prisma.paymentMethod.create({
            data: {
                name: name.trim(),
                type,
                isActive: isActive === undefined ? true : (isActive === true || isActive === "true"),
            }
        })

        return res.status(201).json({ message: "Método de pago creado", data: created })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

const updatePaymentMethod = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        if (isNaN(formId)) {
            return res.status(400).json({ message: "ID inválido" })
        }

        const idExist = await prisma.paymentMethod.findUnique({ where: { id: formId } })
        if (!idExist) {
            return res.status(404).json({ message: "No encontrado" })
        }

        const { name, type, isActive } = req.body

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "El nombre es obligatorio" })
        }
        if (name.trim().length > 60) {
            return res.status(400).json({ message: "El nombre no puede superar 60 caracteres" })
        }
        if (!type || !VALID_TYPES.includes(type)) {
            return res.status(400).json({ message: "El tipo no es válido" })
        }

        const updated = await prisma.paymentMethod.update({
            where: { id: formId },
            data: {
                name: name.trim(),
                type,
                isActive: isActive !== undefined ? (isActive === true || isActive === "true") : undefined,
            }
        })

        return res.status(200).json({ message: "Método de pago actualizado", data: updated })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

const deletePaymentMethod = async (req, res) => {
    try {
        const formId = Number(req.params.id)
        if (isNaN(formId)) {
            return res.status(400).json({ message: "ID inválido" })
        }

        const idExist = await prisma.paymentMethod.findUnique({ where: { id: formId } })
        if (!idExist) {
            return res.status(404).json({ message: "No encontrado" })
        }

        // Sin relaciones en el schema (Payment.paymentMethod es texto libre,
        // no una FK a esta tabla) — no hace falta chequear referencias.
        await prisma.paymentMethod.delete({ where: { id: formId } })

        return res.status(200).json({ message: "Método de pago eliminado" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Error interno" })
    }
}

module.exports = {
    getActivePaymentMethods,
    allPaymentMethodsAdmin,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
}
