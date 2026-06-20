/**
 * requirePermission(permName)
 *
 * Middleware de fábrica que verifica que el usuario autenticado
 * tenga el permiso indicado.
 *
 * Reglas:
 *  - super_admin siempre pasa (tiene acceso total).
 *  - customer nunca accede a rutas de panel de administración.
 *  - Para cualquier otro rol se comprueba la lista de permisos
 *    cargada en req.user.permissions por authMiddleware.
 */
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

// Exclusivo para rutas que solo puede ejecutar el super_admin
const requireSuperAdmin = (req, res, next) => {
  if (req.user?.role === 'super_admin') return next();
  return res.status(403).json({ message: 'Acción reservada para el super administrador.' });
};

module.exports = { requirePermission, requireSuperAdmin };
