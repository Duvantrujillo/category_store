const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()

const createForm = async (req, res) => {

    try {
        const {
            firstName,
            lastName,
            documentNumber,
            phoneNumber,
            departament,
            municipality,
            address,
            additionalDetails
        } = req.body;



        if (!firstName || !lastName || !documentNumber || !phoneNumber || !address || !departament || !municipality) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const documentNumberNumb = Number(documentNumber)
        if (isNaN(documentNumberNumb) || documentNumber.length > 10 || documentNumber.length < 4) {
            return res.status(400).json({ message: "Tu Documento debe ser numérico y tener entre 4 y 10 dígitos" })
        }

        const phoneNumberNumb = Number(phoneNumber)

        if (isNaN(phoneNumberNumb) || phoneNumber.length > 10 || phoneNumber.length < 7) {
            // Actualizamos el mensaje para reflejar el rango de 7 a 10 dígitos
            return res.status(400).json({ message: "Tu teléfono debe ser numérico y tener entre 7 y 10 dígitos" })
        }



        const documentNumberExist = await prisma.formResponse.findFirst({
            where: { documentNumber }
        });

        let result;

        if (documentNumberExist) {
            result = await prisma.formResponse.update({
                where: { id: documentNumberExist.id },
                data: {
                    firstName,
                    lastName,
                    phoneNumber,
                    departament,
                    municipality,
                    address,
                    additionalDetails
                }
            });
        } else {
            result = await prisma.formResponse.create({
                data: {
                    firstName,
                    lastName,
                    documentNumber,
                    phoneNumber,
                    departament,
                    municipality,
                    address,
                    additionalDetails
                }
            });
        }

        return res.status(200).json({
            message: 'Registro procesado correctamente',
            data: result
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const updateForm = async (req, res) => {
    try {

        // ======================
        // 1. ID validation
        // ======================
        const formId = String(req.params.id);



        // ======================
        // 2. Body destructuring
        // ======================
        const {
            firstName,
            lastName,
            documentNumber,
            phoneNumber,
            departament,
            municipality,
            address,
            additionalDetails
        } = req.body;
        // ======================
        // 3. Validación de campos vacíos
        // ======================
        const requiredFields = [
            firstName,
            lastName,
            documentNumber,
            phoneNumber,
            departament,
            municipality,
            address
        ];

        const hasEmptyFields = requiredFields.some(
            (field) => field === undefined || field === null || field.toString().trim() === ''
        );

        if (hasEmptyFields) {
            return res.status(400).json({
                message: 'Todos los campos obligatorios deben estar completos'
            });
        }

        // ======================
        // 4. Verificar existencia
        // ======================
        const existingResponse = await prisma.formResponse.findUnique({
            where: { id: formId }
        });

        if (!existingResponse) {
            return res.status(404).json({
                message: 'Registro no encontrado'
            });
        }

        // ======================
        // 5. Update
        // ======================
        const updatedResponse = await prisma.formResponse.update({
            where: { id: formId },
            data: {
                firstName,
                lastName,
                documentNumber,
                phoneNumber,
                departament,
                municipality,
                address,
                additionalDetails
            }
        });
        return res.status(200).json({
            message: 'Registro actualizado correctamente',
            data: updatedResponse
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error al actualizar el registro'
        });
    }
}

const deleteForm = async (req, res) => {
    try {
        const formId = String(req.params.id)

        const formIdExist = await prisma.formResponse.findUnique({
            where: {
                id: formId
            }
        })

        if (!formIdExist) {
            return res.status(404).json({ message: "el registro no existe" })
        }

        const deleteForm = await prisma.formResponse.delete({
            where: {
                id: formId
            }
        })

        return res.status(200).json({ message: "registro eliminado" })

    } catch (error) {
        return res.status(500).json({ message: "error interno del servidor" })
    }

}

const AllForm = async (req, res) => {
    try {


        const all = await prisma.formResponse.findMany({
            orderBy: [
                { updatedAt: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        if (all.length === 0) {
            return res.status(200).json({ message: "no existen registros Aun" })
        }

        return res.status(200).json({ data: all })
    } catch (error) {
        return res.status(500).json({ message: "error interno del servidor" })
    }
}






module.exports = {
    createForm,
    updateForm,
    deleteForm,
    AllForm
}