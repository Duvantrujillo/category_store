const express = require('express')
const router = express.Router()
const returnItemController = require('../controllers/return-item/return_item.controller')

router.post('/create',returnItemController.CreatereturnItem)




module.exports = router