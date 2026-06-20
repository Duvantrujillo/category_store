const express = require('express')
const router = express.Router()
const attributeController = require('../controllers/attribute/attribute.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/all',          requirePermission('attributes.view'),   attributeController.allAttribute)
router.post('/create',      requirePermission('attributes.create'), attributeController.createAttribute)
router.put('/update/:id',   requirePermission('attributes.update'), attributeController.updateAttribute)
router.delete('/delete/:id',requirePermission('attributes.delete'), attributeController.deleteAttribute)

module.exports = router
