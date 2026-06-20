const express = require('express')
const router = express.Router()
const attributeValueController = require('../controllers/attribute-value/atrtribute-value.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.get('/all',          requirePermission('attribute-values.view'),   attributeValueController.allAtribute_Value)
router.post('/create',      requirePermission('attribute-values.create'), attributeValueController.createAtribute_Value)
router.put('/update/:id',   requirePermission('attribute-values.update'), attributeValueController.updateAtribute_Value)
router.delete('/delete/:id',requirePermission('attribute-values.delete'), attributeValueController.deleteAtribute_Value)

module.exports = router
