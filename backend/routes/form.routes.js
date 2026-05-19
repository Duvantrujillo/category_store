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



router.post('/register', async (req, res) => {
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


router.get('/form-responses', async (req, res) => {
    try {
        const data = await prisma.formResponse.findMany();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos' });
    }
});

module.exports = router;