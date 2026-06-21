const express = require('express')
const router = express.Router()
const formController = require('../controllers/form/form.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

// Envío de formulario público (clientes lo llaman sin sesión)
router.post('/create', formController.createForm)

// Gestión interna — requieren sesión (authMiddleware global) + permiso
router.get('/all',          requirePermission('forms.view'),   formController.AllForm)
router.get('/search',       requirePermission('forms.view'),   formController.searchForm)
router.put('/update/:id',   requirePermission('forms.update'), formController.updateForm)
router.delete('/delete/:id',requirePermission('forms.delete'), formController.deleteForm)

module.exports = router
