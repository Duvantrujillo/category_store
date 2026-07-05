const express = require('express');
const router = express.Router();
require('dotenv').config();
const { rateLimit } = require('express-rate-limit');
const userController = require('../controllers/user/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requirePermission, requireAdmin } = require('../middlewares/permission.middleware');

// Limita intentos de fuerza bruta contra contraseñas (endpoint público sin auth)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesión, intenta más tarde' }
});

// Limita creación masiva de cuentas (endpoint público sin auth)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Demasiados registros desde esta conexión, intenta más tarde' }
});

// Rutas públicas
router.post('/create', registerLimiter, userController.createUser);
router.post('/login',  loginLimiter,    userController.loginUser);

// Perfil propio — requiere sesión válida
router.get('/me', authMiddleware, userController.getMe);

// Rutas solo para admin y super_admin
router.get('/roles', authMiddleware, requireAdmin, userController.getRoles);

// Gestión de usuarios — requiere permiso específico (super_admin pasa siempre)
router.get('/all',              authMiddleware, requirePermission('admins.view'),   userController.allUser);
router.post('/admin-create',    authMiddleware, requirePermission('admins.create'), userController.adminCreateUser);
router.patch('/:id/status',     authMiddleware, requirePermission('admins.update'), userController.updateUserStatus);
router.patch('/:id/password',   authMiddleware, requirePermission('admins.update'), userController.resetUserPassword);
router.patch('/:id',            authMiddleware, requirePermission('admins.update'), userController.updateUser);

module.exports = router;
