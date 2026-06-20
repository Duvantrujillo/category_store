const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const Jwt = require('jsonwebtoken');

const VALID_STATUSES = ['active', 'inactive', 'blocked'];

const STATUS_MESSAGES = {
  inactive: 'Tu cuenta está inactiva. Contacta al administrador.',
  blocked:  'Tu cuenta ha sido bloqueada. Contacta al administrador.',
};

/* ─────────────────────────────────────────
   REGISTRO PÚBLICO (cliente)
───────────────────────────────────────── */
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Campos requeridos' });
    }

    const userExist = await prisma.user.findUnique({ where: { email } });
    if (userExist) {
      return res.status(409).json({ message: 'Correo ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleExist = await prisma.role.findFirst({ where: { name: 'customer' } });
    if (!roleExist) {
      return res.status(400).json({ message: 'Error de configuración' });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: 'active',
        role: { connect: { id: roleExist.id } },
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ message: 'Usuario creado', user: userWithoutPassword });

  } catch (error) {
    return res.status(500).json({ message: 'Error interno' });
  }
};

/* ─────────────────────────────────────────
   LOGIN — verifica estado antes de emitir token
───────────────────────────────────────── */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Campos requeridos' });
    }

    const userExist = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            permissions: { where: { isActive: true }, select: { permission: { select: { name: true } } } },
          },
        },
      },
    });

    if (!userExist) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Verificar estado — solo bloquea si tiene un estado explícitamente inactivo/bloqueado
    // (null o undefined = activo, para usuarios creados antes de esta columna)
    if (userExist.status && userExist.status !== 'active') {
      return res.status(403).json({
        message: STATUS_MESSAGES[userExist.status] ?? 'Acceso denegado',
      });
    }

    const validPassword = await bcrypt.compare(password, userExist.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET no esta definido');
    }

    const token = Jwt.sign(
      { id: userExist.id, email: userExist.email, role: userExist.role.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Sesión iniciada',
      token,
      user: {
        id:          userExist.id,
        name:        userExist.name,
        email:       userExist.email,
        role:        userExist.role.name,
        status:      userExist.status,
        permissions: userExist.role.permissions.map((rp) => rp.permission.name),
      },
    });

  } catch (error) {
    console.error('[loginUser]', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

/* ─────────────────────────────────────────
   LISTAR USUARIOS (admin)
───────────────────────────────────────── */
const allUser = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error interno' });
  }
};

/* ─────────────────────────────────────────
   LISTAR ROLES (admin)
───────────────────────────────────────── */
const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: { status: true },
      select: { id: true, name: true, description: true },
      orderBy: { id: 'asc' },
    });
    return res.status(200).json({ roles });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno' });
  }
};

/* ─────────────────────────────────────────
   CREAR USUARIO (admin) — activo por defecto
───────────────────────────────────────── */
const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, roleId, status = 'active' } = req.body;

    if (!name || !email || !password || !confirmPassword || !roleId) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Correo electrónico inválido' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Estado de usuario inválido' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const role = await prisma.role.findFirst({ where: { id: Number(roleId), status: true } });
    if (!role) {
      return res.status(400).json({ message: 'Rol inválido o inactivo' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        status,
        role: { connect: { id: role.id } },
      },
      select: { id: true, name: true, email: true, status: true, roleId: true, createdAt: true },
    });

    return res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });

  } catch (error) {
    console.error('[adminCreateUser]', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/* ─────────────────────────────────────────
   CAMBIAR ESTADO DE USUARIO (admin)
───────────────────────────────────────── */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { status },
      select: { id: true, name: true, email: true, status: true },
    });

    return res.status(200).json({ message: 'Estado actualizado', user: updated });

  } catch (error) {
    console.error('[updateUserStatus]', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/* ─────────────────────────────────────────
   EDITAR DATOS DE USUARIO (admin)
───────────────────────────────────────── */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, roleId } = req.body;

    if (!name && !email && !roleId) {
      return res.status(400).json({ message: 'Debes enviar al menos un campo para actualizar' });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const data = {};

    if (name !== undefined) {
      if (name.trim().length < 2)
        return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' });
      data.name = name.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        return res.status(400).json({ message: 'Correo electrónico inválido' });

      const taken = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
      if (taken && taken.id !== Number(id))
        return res.status(409).json({ message: 'El correo ya está en uso por otro usuario' });

      data.email = email.trim().toLowerCase();
    }

    if (roleId !== undefined) {
      const role = await prisma.role.findFirst({ where: { id: Number(roleId), status: true } });
      if (!role) return res.status(400).json({ message: 'Rol inválido o inactivo' });
      data.roleId = role.id;
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, name: true, email: true, status: true, role: { select: { id: true, name: true } } },
    });

    return res.status(200).json({ message: 'Usuario actualizado', user: updated });
  } catch (error) {
    console.error('[updateUser]', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/* ─────────────────────────────────────────
   RESTABLECER CONTRASEÑA (admin)
───────────────────────────────────────── */
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword)
      return res.status(400).json({ message: 'Todos los campos son requeridos' });

    if (newPassword.length < 8)
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: Number(id) },
      data: { password: hashed },
    });

    return res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('[resetUserPassword]', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/* ─────────────────────────────────────────
   PERFIL PROPIO — devuelve permisos frescos de la BD
───────────────────────────────────────── */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id:     true,
        name:   true,
        email:  true,
        status: true,
        role: {
          select: {
            name: true,
            permissions: { where: { isActive: true }, select: { permission: { select: { name: true } } } },
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    return res.json({
      id:          user.id,
      name:        user.name,
      email:       user.email,
      status:      user.status,
      role:        user.role.name,
      permissions: user.role.permissions.map((rp) => rp.permission.name),
    });
  } catch (error) {
    console.error('[getMe]', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

module.exports = { createUser, loginUser, allUser, getRoles, adminCreateUser, updateUserStatus, updateUser, resetUserPassword, getMe };
