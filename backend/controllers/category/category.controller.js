const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()




const createCategory = async (req,res)=>{
      try {
        const { parentId, name, slug, description, isActive, sortOrder } = req.body

        // 1. Validar campos de texto obligatorios
        if (!name || !slug) {
            return res.status(400).json({ error: "El nombre y el slug son obligatorios" });
        }

        // 2. Validar que los campos numéricos o booleanos existan realmente
        if (isActive === undefined || sortOrder === undefined) {
            return res.status(400).json({ error: "Faltan los campos de estado u ordenamiento" });
        }

        // 3. Verificar si el slug ya existe (Corrección: prisma.category.findUnique)
        const slugExist = await prisma.category.findUnique({
            where: {
                slug: slug
            }
        })

        if (slugExist) {
            return res.status(400).json({ message: "La categoría ya existe" }); // Corrección: Status 400
        }

        // 4. Guardar el registro (Corrección: prisma.category.create)
        const result = await prisma.category.create({
            data: {
                parentId: parentId ? parseInt(parentId) : null, // Asegura que sea Entero o Null
                name,
                slug,
                description,
                isActive,
                sortOrder: parseInt(sortOrder) // Asegura que sea un número Entero
            }
        })

        // 5. Responder con el objeto creado (Corrección: Status 201 e incluir result)
        return res.status(201).json({ message: "Registro Exitoso", data: result });

    } catch (error) {
        console.error(error); // Es bueno imprimirlo en consola para poder debugear
        return res.status(500).json({ error: "Error inesperado del servidor" }); // Corrección: .status(500)
    }
}
const updateCategory = async (req,res)=>{
   try {
        const formId = req.params.id;
        const {
            parentId,
            name,
            slug,
            description,
            isActive,
            sortOrder
        } = req.body;

        // Validar ID
        if (!formId) {
            return res.status(400).json({
                message: "El ID es obligatorio para actualizar"
            });
        }

        // Buscar categoría
        const existenResponse = await prisma.category.findUnique({
            where: {
                id: parseInt(formId)
            }
        });

        if (!existenResponse) {
            return res.status(404).json({
                message: "La categoría no existe"
            });
        }

        // Actualizar
        const updateResponse = await prisma.category.update({

            where: {
                id: parseInt(formId)
            },

            data: {
                parentId:
                    parentId
                        ? parseInt(parentId)
                        : null,
                name,
                slug,
                description,
                isActive,
                sortOrder:
                    sortOrder !== undefined
                        ? parseInt(sortOrder)
                        : undefined
            }
        });

        return res.status(200).json({
            message: "Datos actualizados correctamente",
            data: updateResponse
        });

    } catch (error) {

        console.error(error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                message: "El slug ya está siendo usado"
            });
        }

        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}
const deleteCategory = async (req,res)=>{
try {
    const formId = req.params.id
   
    const existenResponse = await prisma.category.findUnique({
        where: {
            id: parseInt(formId)
        }
    })

    if (!existenResponse){
        return res.status(404).json({message: "el registro no existe"}) // Tip: 404 queda mejor para "no existe"
    }

    const registerDelete = await prisma.category.delete({
        where:{
            id: parseInt(formId) // ¡Corrección aquí! Cambiado parentId por parseInt
        }
    })

    return res.status(200).json({message: "eliminacion exitoso", data: registerDelete})

} catch (error) {
    return res.status(500).json({error: "error interno del servidor"})
}
}
const activeCategory = async (req,res)=>{
 try {
        const activeCategory = await prisma.category.findMany({
            where: {
                isActive: true
            },
            orderBy:{
                sortOrder: 'asc'
            }
        })

        return res.status (200).json({message: 'categoria activas obtenidas correctamente', data: activeCategory})
    } catch (error) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

module.exports = {
    createCategory,
    updateCategory,
    deleteCategory,
    activeCategory
}