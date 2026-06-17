const express = require('express')
const router = express.Router()
const returnRequestController =  require('../controllers/return-request/return_request.controller')



router.get('/all', returnRequestController.getAllReturnRequests)
router.post('/create', returnRequestController.createreturnRequest)
router.put('/:id', returnRequestController.updateReturnRequest)


module.exports = router