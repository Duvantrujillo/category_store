const ADMIN_ROLES = ['admin', 'super_admin'];

const requirePermission = (permName) => (req, res, next) => {
  const { role, permissions = [] } = req.user ?? {};

  if (role === 'super_admin') return next();

  if (role === 'customer') {
    return res.status(403).json({ message: 'Acceso denegado.' });
  }

  if (permissions.includes(permName)) return next();

  return res.status(403).json({
    message: `No tienes permiso para realizar esta acción. Se requiere: ${permName}`,
  });
};

// Permite acceso a admin y super_admin
const requireAdmin = (req, res, next) => {
  if (ADMIN_ROLES.includes(req.user?.role)) return next();
  return res.status(403).json({ message: 'Acceso restringido al panel de administración.' });
};

// Exclusivo para super_admin
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role === 'super_admin') return next();
  return res.status(403).json({ message: 'Acción reservada para el super administrador.' });
};

module.exports = { requirePermission, requireAdmin, requireSuperAdmin };
