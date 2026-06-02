const { PrismaClient } = require("@prisma/client");
const slugify = require('slugify')
const prisma = new PrismaClient()



const createAttribute = async (req, res) => {
  try {
    const {
      name,
      isActive,
    } = req.body



    if (!name) {
      return res.status(400).json({
        message: "nombre es obligatorio"
      })
    }
    const customerSlug = slugify(name, {
      lower: true,
      strict: true
    })

    const newAttribute = await prisma.attribute.create({
      data: {
        name: name.trim(),
        slug: customerSlug,

        isActive: isActive === true || isActive === "true",

      }
    })

    return res.status(201).json({
      message: "Atributo registrado correctamente",
      data: newAttribute
    })

  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "El slug ya existe"
      })
    }

    return res.status(500).json({
      error: "error interno del servidor"
    })
  }
}



const updateAttribute = async (req, res) => {
  try {
    // 1️⃣ Convertir ID a número y validar
    const formId = Number(req.params.id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const {
      name,
      slug,
      isActive

    } = req.body;

    // 2️⃣ Verificar que el registro exista
    const idExist = await prisma.attribute.findUnique({
      where: { id: formId } // ahora usamos formId directamente
    });

    if (!idExist) {
      return res.status(404).json({ message: "El registro no existe" });
    }

    const customerSlug = slugify(name, {
      lower: true,
      strict: true
    })

    // 3️⃣ Verificar que el slug no exista en otro registro
    if (customerSlug) {
      const slugExist = await prisma.attribute.findFirst({
        where: {
          slug: customerSlug,
          NOT: { id: formId } // excluye el registro actual
        }
      });

      if (slugExist) {
        return res.status(400).json({ message: "El slug ya existe" });
      }
    }

    // 4️⃣ Actualizar el registro
    const registerUpdate = await prisma.attribute.update({
      where: { id: formId },
      data: {
        name,
        slug: customerSlug,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
      }
    });

    // 5️⃣ Responder al cliente
    return res.status(200).json({
      message: "Registro actualizado correctamente",
      data: registerUpdate
    });

  } catch (error) {
    return res.status(500).json({ message: "error interno del servidor" });
  }
}




const deleteAttribute = async (req, res) => {
  try {
    const formId = Number(req.params.id);
    if (isNaN(formId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    // 2️⃣ Verificar que el registro exista
    const idExist = await prisma.attribute.findUnique({
      where: { id: formId }
    });

    if (!idExist) {
      return res.status(404).json({ message: "El registro no existe" });
    }

    const ExistAttributeValue = await prisma.attributeValue.findFirst({
      where: {
        attributeId: formId
      }
    })

    if (ExistAttributeValue) {
      return res.status(400).json({
        message: "No se puede eliminar el atributo porque tiene valores asociados."
      })
    }

    // 3️⃣ Eliminar el registro
    await prisma.attribute.delete({
      where: { id: formId }
    });

    // 4️⃣ Responder al cliente
    return res.status(200).json({
      message: "El registro fue eliminado satisfactoriamente"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error interno del servidor"
    });
  }
}
const allAttribute = async (req, res) => {
  try {

    const all = await prisma.attribute.findMany()
    if (all.length === 0) {
      return res.status(200).json({ message: "No Existen Registros Aun" })
    }
    return res.status(200).json({ data: all })

  } catch (error) {
    return res.status(500).json({ message: "error interno del servidor" })
  }
}

module.exports = {
  createAttribute,
  updateAttribute,
  deleteAttribute,
  allAttribute
}