const Jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STATUS_MESSAGES = {
  inactive: 'Tu cuenta está inactiva. Contacta al administrador.',
  blocked:  'Tu cuenta ha sido bloqueada. Tu sesión ha sido cerrada.',
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado. Se requiere iniciar sesión.' });
  }

  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);

    // Cargar usuario con estado, rol y permisos en una sola consulta
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id:     true,
        status: true,
        role: {
          select: {
            name: true,
            permissions: {
              where:  { isActive: true },
              select: { permission: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Sesión inválida. Inicia sesión nuevamente.' });
    }

    // Verificar estado de la cuenta
    if (user.status && user.status !== 'active') {
      return res.status(401).json({
        message: STATUS_MESSAGES[user.status] ?? 'Acceso denegado.',
        forceLogout: true,
      });
    }

    // Adjuntar datos al request para uso en middlewares posteriores
    req.user = {
      ...decoded,
      role:        user.role.name,
      permissions: user.role.permissions.map((rp) => rp.permission.name),
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = { authMiddleware };
