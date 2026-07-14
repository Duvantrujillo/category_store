const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const { buildSearchStems } = require("../../utils/search-stems");

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
            return res.status(400).json({ message: 'Campos incompletos' });
        }

        if (String(firstName).length > 60) {
            return res.status(400).json({ message: "El nombre no puede superar 60 caracteres" })
        }
        if (String(lastName).length > 60) {
            return res.status(400).json({ message: "El apellido no puede superar 60 caracteres" })
        }
        if (String(address).length > 200) {
            return res.status(400).json({ message: "La dirección no puede superar 200 caracteres" })
        }
        if (String(departament).length > 100) {
            return res.status(400).json({ message: "El departamento no puede superar 100 caracteres" })
        }
        if (String(municipality).length > 100) {
            return res.status(400).json({ message: "El municipio no puede superar 100 caracteres" })
        }
        if (additionalDetails && String(additionalDetails).length > 500) {
            return res.status(400).json({ message: "Los detalles adicionales no pueden superar 500 caracteres" })
        }

        // String(...) primero: si documentNumber/phoneNumber llegan como número
        // JSON (no string), `.length` en el valor crudo da `undefined` y el
        // chequeo de rango se salta en silencio.
        const documentNumberStr = String(documentNumber)
        const documentNumberNumb = Number(documentNumberStr)
        if (isNaN(documentNumberNumb) || documentNumberStr.length > 10 || documentNumberStr.length < 4) {
            return res.status(400).json({ message: "Documento inválido (4-10 dígitos)" })
        }

        const phoneNumberStr = String(phoneNumber)
        const phoneNumberNumb = Number(phoneNumberStr)
        if (isNaN(phoneNumberNumb) || phoneNumberStr.length > 10 || phoneNumberStr.length < 7) {
            return res.status(400).json({ message: "Teléfono inválido (7-10 dígitos)" })
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
            message: 'Formulario guardado',
            data: result
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error interno' });
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
                message: 'Campos incompletos'
            });
        }

        if (String(firstName).length > 60) {
            return res.status(400).json({ message: "El nombre no puede superar 60 caracteres" })
        }
        if (String(lastName).length > 60) {
            return res.status(400).json({ message: "El apellido no puede superar 60 caracteres" })
        }
        if (String(address).length > 200) {
            return res.status(400).json({ message: "La dirección no puede superar 200 caracteres" })
        }
        if (String(departament).length > 100) {
            return res.status(400).json({ message: "El departamento no puede superar 100 caracteres" })
        }
        if (String(municipality).length > 100) {
            return res.status(400).json({ message: "El municipio no puede superar 100 caracteres" })
        }
        if (additionalDetails && String(additionalDetails).length > 500) {
            return res.status(400).json({ message: "Los detalles adicionales no pueden superar 500 caracteres" })
        }

        const documentNumberStr = String(documentNumber)
        const documentNumberNumb = Number(documentNumberStr)
        if (isNaN(documentNumberNumb) || documentNumberStr.length > 10 || documentNumberStr.length < 4) {
            return res.status(400).json({ message: "Documento inválido (4-10 dígitos)" })
        }

        const phoneNumberStr = String(phoneNumber)
        const phoneNumberNumb = Number(phoneNumberStr)
        if (isNaN(phoneNumberNumb) || phoneNumberStr.length > 10 || phoneNumberStr.length < 7) {
            return res.status(400).json({ message: "Teléfono inválido (7-10 dígitos)" })
        }

        // ======================
        // 4. Verificar existencia
        // ======================
        const existingResponse = await prisma.formResponse.findUnique({
            where: { id: formId }
        });

        if (!existingResponse) {
            return res.status(404).json({
                message: 'No encontrado'
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
            message: 'Formulario actualizado',
            data: updatedResponse
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Error interno'
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
            return res.status(404).json({ message: "No encontrado" })
        }

        const deleteForm = await prisma.formResponse.delete({
            where: {
                id: formId
            }
        })

        return res.status(200).json({ message: "Formulario eliminado" })

    } catch (error) {
        return res.status(500).json({ message: "Error interno" })
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
        return res.status(500).json({ message: "Error interno" })
    }
}






const searchForm = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q) return res.status(200).json({ data: [] });

    const stems = buildSearchStems(q);

    const forms = await prisma.formResponse.findMany({
      where: {
        AND: stems.map((s) => ({
          OR: [
            { firstName:      { contains: s } },
            { lastName:       { contains: s } },
            { documentNumber: { contains: s } },
            { phoneNumber:    { contains: s } },
            { municipality:   { contains: s } },
            { departament:    { contains: s } },
          ],
        })),
      },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });

    return res.status(200).json({ data: forms });
  } catch (error) {
    return res.status(500).json({ message: "Error al buscar" });
  }
};

module.exports = {
    createForm,
    updateForm,
    deleteForm,
    AllForm,
    searchForm,
}