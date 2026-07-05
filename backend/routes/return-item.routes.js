const express = require('express')
const router = express.Router()
const returnItemController = require('../controllers/return-item/return_item.controller')
const { requirePermission } = require('../middlewares/permission.middleware')

router.post('/create', requirePermission('returns.create'), returnItemController.CreatereturnItem)




module.exports = router
