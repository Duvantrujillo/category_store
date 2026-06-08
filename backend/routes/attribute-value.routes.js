const express = require('express')
const router = express.Router()
const attributeValueController = require ('../controllers/attribute-value/atrtribute-value.controller')



router.post('/create',attributeValueController.createAtribute_Value)

router.put('/update/:id', attributeValueController.updateAtribute_Value)

router.delete('/delete/:id', attributeValueController.deleteAtribute_Value)

router.get('/all',attributeValueController.allAtribute_Value)

module.exports = router
