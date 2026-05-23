const express = require('express');
const router = express.Router();

// Importa PrismaClient desde el paquete de Prisma
const { PrismaClient, Prisma } = require('@prisma/client');

// Crea una instancia de PrismaClient
// Esto permite conectarte y hacer consultas a la base de datos
const prisma = new PrismaClient();

router.get('/info', (req, res) => {
  res.send('funcionó o no');
});



router.post('/create', async (req, res) => {
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

  try {
    if (!firstName || !lastName || !documentNumber || !phoneNumber || !address || !departament || !municipality) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
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
});

router.put('/update/:id', async (req, res) => {
  try {

    // ======================
    // 1. ID validation
    // ======================
    const formId =(req.params.id);



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

    console.error(error);

    return res.status(500).json({
      message: 'Error al actualizar el registro'
    });
  }
});

router.get('/form-responses', async (req, res) => {
  try {
    const data = await prisma.formResponse.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener datos' });
  }
});



module.exports = router;