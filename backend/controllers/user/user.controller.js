const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validación básica
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Campos requeridos'
      });
    }

    // 2. Verificar si existe usuario
    const userExist = await prisma.user.findUnique({
      where: { email }
    });

    if (userExist) {
      return res.status(409).json({
        message: 'Correo ya registrado'
      });
    }

    // 3. Hash de contraseña (SEGURIDAD)
    const hashedPassword = await bcrypt.hash(password, 10);

    const roleExist = await prisma.role.findFirst({
      where: {
        name: 'customer'
      }
    });

    if (!roleExist) {
      return res.status(400).json({ message: 'Error de configuración' })
    }

    // 4. Crear usuario en DB
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: {
          connect: { id: roleExist.id }
        }
      }
    });

    // 5. No devolver password
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Usuario creado',
      user: userWithoutPassword
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error interno'
    });
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {


    if (!email || !password) {
      return res.status(400).json({ message: 'Campos requeridos' })
    }

    //verifica que el usuario exista

    const userExist = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });



    if (!userExist) {
      return res.status(400).json({ message: 'Credenciales inválidas' })
    }


    //comparacion de la password
    const validPassword = await bcrypt.compare(password, userExist.password)


    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET no esta definido")
    }

    const token = Jwt.sign(
      { id: userExist.id, email: userExist.email, role: userExist.role.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );



    return res.status(200).json({
      message: "Sesión iniciada", token,
      user: {
        id: userExist.id,
        name: userExist.name,
        userExist: userExist.email,
        role: userExist.role.name
      }
    })

  } catch (error) {
     console.log("🔥 LOGIN ERROR REAL:", error);
    return res.status(500).json({ message: 'Error interno' })
  }

}

const allUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return res.json(users);

  } catch (error) {
    return res.status(500).json({
      message: 'Error interno'
    });
  }
}

module.exports = { createUser, loginUser, allUser }