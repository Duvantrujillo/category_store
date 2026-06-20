const express = require('express');
const router = express.Router();
require('dotenv').config();
const userController = require('../controllers/user/user.controller')
const { requireSuperAdmin } = require('../middlewares/permission.middleware')

router.post('/create', userController.createUser)
router.post('/login',  userController.loginUser)
router.get('/me',      userController.getMe)

router.get('/all',   requireSuperAdmin, userController.allUser)
router.get('/roles', requireSuperAdmin, userController.getRoles)

router.post('/admin-create',  requireSuperAdmin, userController.adminCreateUser)
router.patch('/:id/status',   requireSuperAdmin, userController.updateUserStatus)
router.patch('/:id/password', requireSuperAdmin, userController.resetUserPassword)
router.patch('/:id',          requireSuperAdmin, userController.updateUser)

module.exports = router;