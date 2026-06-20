const express = require('express')
const router = express.Router()
const formController = require('../controllers/form/form.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/all',          requirePermission('forms.view'),   formController.AllForm)
router.post('/create',      requirePermission('forms.create'), formController.createForm)
router.put('/update/:id',   requirePermission('forms.update'), formController.updateForm)
router.delete('/delete/:id',requirePermission('forms.delete'), formController.deleteForm)

module.exports = router
