const express = require('express')
const router = express.Router()
const permissionController = require('../controllers/permission/permission.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/roles',        requirePermission('permissions.manage'), permissionController.getRolesWithPermissions)
router.put('/role/:roleId', requirePermission('permissions.manage'), permissionController.updateRolePermissions)

module.exports = router
