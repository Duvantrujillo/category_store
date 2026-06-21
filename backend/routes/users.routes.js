const express = require('express');
const router = express.Router();
require('dotenv').config();
const userController = require('../controllers/user/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { requirePermission, requireAdmin } = require('../middlewares/permission.middleware');

// Rutas públicas
router.post('/create', userController.createUser);
router.post('/login',  userController.loginUser);

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